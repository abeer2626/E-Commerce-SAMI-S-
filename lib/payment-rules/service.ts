/**
 * Payment Rules Engine - Core Service
 *
 * This service provides the core functionality for evaluating payment rules
 * and determining which payment methods are available for a given checkout context.
 */

import { prisma } from '@/lib/prisma';
import type {
  PaymentMethod,
  PaymentRule,
  PaymentRuleConditions,
  PaymentRuleAction,
  CheckoutContext,
  PaymentMethodsEvaluationResult,
  PaymentMethodResult,
  PaymentMethodStatus,
  AppliedPaymentRuleInfo,
  AdvancePaymentRequirement,
  AdvancePaymentSettings,
} from './types';
import {
  parseConditions,
  parseAdvancePaymentSettings,
} from './types';

// ============================================================================
// PAYMENT RULES EVALUATION SERVICE
// ============================================================================

export class PaymentRulesService {
  /**
   * Evaluate all payment rules for a given checkout context
   * Returns the status of each payment method after applying all active rules
   */
  static async evaluatePaymentMethods(
    context: CheckoutContext
  ): Promise<PaymentMethodsEvaluationResult> {
    // Fetch all active rules, ordered by priority (highest first)
    const rules = await this.fetchActiveRules();

    // Initialize results for all payment methods
    const methodResults: Record<PaymentMethod, PaymentMethodResult> = {
      COD: this.initializeMethodResult('COD'),
      ADVANCE: this.initializeMethodResult('ADVANCE'),
      ONLINE: this.initializeMethodResult('ONLINE'),
    };

    // Evaluate rules in priority order (highest priority first)
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      // Conditions are already parsed by fetchActiveRules
      const conditions = rule.conditions;

      // Check if rule conditions match the context
      if (this.doConditionsMatch(conditions, context)) {
        // Determine which payment methods this rule applies to
        const affectedMethods = rule.paymentMethod
          ? [rule.paymentMethod as PaymentMethod]
          : (['COD', 'ADVANCE', 'ONLINE'] as PaymentMethod[]);

        // Apply the rule action to each affected method
        for (const method of affectedMethods) {
          const currentResult = methodResults[method];

          // Only update if no higher priority rule has already set a definitive status
          // RESTRICT always overrides ALLOW, but higher priority rules take precedence
          if (this.shouldApplyRule(rule.action, currentResult.status)) {
            methodResults[method] = this.applyRuleAction(
              method,
              rule,
              conditions,
              context.orderTotal
            );
          }
        }
      }
    }

    // Generate summary lists
    const allowedMethods: PaymentMethod[] = [];
    const restrictedMethods: PaymentMethod[] = [];
    const advancePaymentMethods: PaymentMethod[] = [];

    for (const [method, result] of Object.entries(methodResults)) {
      if (result.status === 'ALLOWED') {
        allowedMethods.push(method as PaymentMethod);
      } else if (result.status === 'RESTRICTED') {
        restrictedMethods.push(method as PaymentMethod);
      } else if (
        result.status === 'FORCE_ADVANCE_PARTIAL' ||
        result.status === 'FORCE_ADVANCE_FULL'
      ) {
        advancePaymentMethods.push(method as PaymentMethod);
        // Also add to allowed since advance payment is a form of payment
        allowedMethods.push(method as PaymentMethod);
      }
    }

    return {
      methods: methodResults,
      allowedMethods,
      restrictedMethods,
      advancePaymentMethods,
      evaluatedAt: new Date(),
    };
  }

  /**
   * Fetch all active payment rules from database, ordered by priority
   */
  private static async fetchActiveRules(): Promise<PaymentRule[]> {
    const rules = await prisma.paymentRule.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priority: 'desc', // Higher priority first
      },
    });

    return rules.map((rule) => ({
      ...rule,
      paymentMethod: rule.paymentMethod as PaymentMethod | null,
      action: rule.action as PaymentRuleAction,
      conditions: parseConditions(rule.conditions),
      advancePaymentSettings: parseAdvancePaymentSettings(rule.advancePaymentSettings),
    }));
  }

  /**
   * Initialize a payment method result with default values
   */
  private static initializeMethodResult(method: PaymentMethod): PaymentMethodResult {
    return {
      method,
      status: 'ALLOWED' as PaymentMethodStatus,
      appliedRules: [],
    };
  }

  /**
   * Check if rule conditions match the checkout context
   */
  private static doConditionsMatch(
    conditions: PaymentRuleConditions,
    context: CheckoutContext
  ): boolean {
    // Check amount range
    if (conditions.minAmount !== undefined && context.orderTotal < conditions.minAmount) {
      return false;
    }

    if (conditions.maxAmount !== undefined && context.orderTotal > conditions.maxAmount) {
      return false;
    }

    // Check categories (rule matches if ANY category in the order is in the rule's categories)
    if (conditions.categories && conditions.categories.length > 0) {
      const hasMatchingCategory = conditions.categories.some((category) =>
        context.categories.includes(category)
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    // Check user types
    if (conditions.userTypes && conditions.userTypes.length > 0) {
      const userType = context.user ? 'LOGGED_IN' : 'GUEST';
      if (!conditions.userTypes.includes(userType)) {
        return false;
      }
    }

    // Check user roles
    if (conditions.userRoles && conditions.userRoles.length > 0) {
      if (!context.user || !conditions.userRoles.includes(context.user.role)) {
        return false;
      }
    }

    // All conditions passed
    return true;
  }

  /**
   * Determine if a rule should be applied based on current status and rule action
   * Higher priority rules take precedence
   * RESTRICT always overrides ALLOW, but higher priority rules are evaluated first
   */
  private static shouldApplyRule(
    ruleAction: PaymentRuleAction,
    currentStatus: PaymentMethodStatus
  ): boolean {
    // If current status is RESTRICTED, only override with a higher priority rule
    // Since we process in priority order, we only apply if:
    // 1. Current status is ALLOWED (can be overridden by any action)
    // 2. Current status is FORCE_ADVANCE_* (can be overridden by RESTRICT)
    if (currentStatus === 'RESTRICTED') {
      return false; // Already restricted, don't override
    }

    if (currentStatus === 'ALLOWED') {
      return true; // Can apply any rule
    }

    // Current status is FORCE_ADVANCE_*
    if (ruleAction === 'RESTRICT') {
      return true; // RESTRICT overrides FORCE_ADVANCE
    }

    return false; // Don't override another FORCE_ADVANCE with lower priority
  }

  /**
   * Apply a rule action to a payment method
   */
  private static applyRuleAction(
    method: PaymentMethod,
    rule: PaymentRule,
    conditions: PaymentRuleConditions,
    orderTotal: number
  ): PaymentMethodResult {
    const ruleInfo: AppliedPaymentRuleInfo = {
      ruleId: rule.id,
      ruleName: rule.name,
      action: rule.action as PaymentRuleAction,
      priority: rule.priority,
      conditions,
    };

    let status: PaymentMethodStatus;
    let advancePaymentRequirement: AdvancePaymentRequirement | undefined;

    switch (rule.action) {
      case 'ALLOW':
        status = 'ALLOWED';
        break;

      case 'RESTRICT':
        status = 'RESTRICTED';
        break;

      case 'FORCE_ADVANCE':
        const settings = rule.advancePaymentSettings as AdvancePaymentSettings | undefined;
        if (settings?.type === 'FULL') {
          status = 'FORCE_ADVANCE_FULL';
          advancePaymentRequirement = {
            type: 'FULL',
            amount: orderTotal,
          };
        } else {
          // PARTIAL
          status = 'FORCE_ADVANCE_PARTIAL';
          const amount = this.calculateAdvanceAmount(settings, orderTotal);
          advancePaymentRequirement = {
            type: 'PARTIAL',
            amount,
            percentage: settings?.percentage,
          };
        }
        break;

      default:
        status = 'ALLOWED';
    }

    return {
      method,
      status,
      appliedRules: [ruleInfo],
      advancePaymentRequirement,
    };
  }

  /**
   * Calculate advance payment amount based on settings
   */
  private static calculateAdvanceAmount(
    settings: AdvancePaymentSettings | undefined,
    orderTotal: number
  ): number {
    if (!settings) {
      return 0;
    }

    let amount = 0;

    if (settings.percentage) {
      amount = (orderTotal * settings.percentage) / 100;
    } else if (settings.fixedAmount) {
      amount = settings.fixedAmount;
    }

    // Apply min/max constraints
    if (settings.minAmount !== undefined) {
      amount = Math.max(amount, settings.minAmount);
    }

    if (settings.maxAmount !== undefined) {
      amount = Math.min(amount, settings.maxAmount);
    }

    // Ensure amount doesn't exceed order total
    amount = Math.min(amount, orderTotal);

    return amount;
  }

  // ============================================================================
  // PAYMENT RULE MANAGEMENT METHODS
  // ============================================================================

  /**
   * Create a new payment rule
   */
  static async createRule(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    priority?: number;
    paymentMethod?: string;
    action: string;
    conditions: any;
    advancePaymentSettings?: any;
  }): Promise<PaymentRule> {
    const rule = await prisma.paymentRule.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
        paymentMethod: data.paymentMethod,
        action: data.action,
        conditions: typeof data.conditions === 'string' ? data.conditions : JSON.stringify(data.conditions),
        advancePaymentSettings: data.advancePaymentSettings
          ? typeof data.advancePaymentSettings === 'string'
            ? data.advancePaymentSettings
            : JSON.stringify(data.advancePaymentSettings)
          : null,
      },
    });

    return {
      ...rule,
      paymentMethod: rule.paymentMethod as PaymentMethod | null,
      action: rule.action as PaymentRuleAction,
      conditions: parseConditions(rule.conditions),
      advancePaymentSettings: parseAdvancePaymentSettings(rule.advancePaymentSettings),
    };
  }

  /**
   * Update an existing payment rule
   */
  static async updateRule(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      priority?: number;
      paymentMethod?: string;
      action?: string;
      conditions?: any;
      advancePaymentSettings?: any;
    }
  ): Promise<PaymentRule> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.action !== undefined) updateData.action = data.action;
    if (data.conditions !== undefined) {
      updateData.conditions =
        typeof data.conditions === 'string' ? data.conditions : JSON.stringify(data.conditions);
    }
    if (data.advancePaymentSettings !== undefined) {
      updateData.advancePaymentSettings =
        typeof data.advancePaymentSettings === 'string'
          ? data.advancePaymentSettings
          : JSON.stringify(data.advancePaymentSettings);
    }

    const rule = await prisma.paymentRule.update({
      where: { id },
      data: updateData,
    });

    return {
      ...rule,
      paymentMethod: rule.paymentMethod as PaymentMethod | null,
      action: rule.action as PaymentRuleAction,
      conditions: parseConditions(rule.conditions),
      advancePaymentSettings: parseAdvancePaymentSettings(rule.advancePaymentSettings),
    };
  }

  /**
   * Delete a payment rule
   */
  static async deleteRule(id: string): Promise<void> {
    await prisma.paymentRule.delete({
      where: { id },
    });
  }

  /**
   * Get all payment rules with optional filtering
   */
  static async getRules(filters?: {
    isActive?: boolean;
    paymentMethod?: string;
  }): Promise<PaymentRule[]> {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.paymentMethod !== undefined) {
      where.paymentMethod = filters.paymentMethod;
    }

    const rules = await prisma.paymentRule.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return rules.map((rule) => ({
      ...rule,
      paymentMethod: rule.paymentMethod as PaymentMethod | null,
      action: rule.action as PaymentRuleAction,
      conditions: parseConditions(rule.conditions),
      advancePaymentSettings: parseAdvancePaymentSettings(rule.advancePaymentSettings),
    }));
  }

  /**
   * Get a single payment rule by ID
   */
  static async getRuleById(id: string): Promise<PaymentRule | null> {
    const rule = await prisma.paymentRule.findUnique({
      where: { id },
    });

    if (!rule) return null;

    return {
      ...rule,
      paymentMethod: rule.paymentMethod as PaymentMethod | null,
      action: rule.action as PaymentRuleAction,
      conditions: parseConditions(rule.conditions),
      advancePaymentSettings: parseAdvancePaymentSettings(rule.advancePaymentSettings),
    };
  }

  // ============================================================================
  // ORDER INTEGRATION METHODS
  // ============================================================================

  /**
   * Record applied payment rules for an order
   * Call this when an order is created with a specific payment method
   */
  static async recordAppliedRules(
    orderId: string,
    evaluationResult: PaymentMethodsEvaluationResult,
    selectedPaymentMethod: PaymentMethod
  ): Promise<void> {
    const methodResult = evaluationResult.methods[selectedPaymentMethod];

    // Create records for each applied rule
    for (const ruleInfo of methodResult.appliedRules) {
      await prisma.appliedPaymentRule.create({
        data: {
          orderId,
          ruleId: ruleInfo.ruleId,
          action: ruleInfo.action,
          evaluatedConditions: JSON.stringify(ruleInfo.conditions),
        },
      });
    }
  }

  /**
   * Get applied payment rules for an order
   */
  static async getOrderAppliedRules(orderId: string) {
    return prisma.appliedPaymentRule.findMany({
      where: { orderId },
      include: {
        rule: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
