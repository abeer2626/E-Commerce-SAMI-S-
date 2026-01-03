/**
 * Payment Rules Engine - Type Definitions
 *
 * This file contains all TypeScript types and interfaces for the payment rules engine.
 * These types ensure type safety across the entire payment rules system.
 */

// ============================================================================
// PAYMENT METHOD TYPES
// ============================================================================

export type PaymentMethod = 'COD' | 'ADVANCE' | 'ONLINE';

export const PAYMENT_METHODS: PaymentMethod[] = ['COD', 'ADVANCE', 'ONLINE'];

// ============================================================================
// PAYMENT RULE ACTION TYPES
// ============================================================================

export type PaymentRuleAction = 'ALLOW' | 'RESTRICT' | 'FORCE_ADVANCE';

export const PAYMENT_RULE_ACTIONS: PaymentRuleAction[] = ['ALLOW', 'RESTRICT', 'FORCE_ADVANCE'];

// ============================================================================
// PAYMENT RULE CONDITION TYPES
// ============================================================================

/**
 * User type conditions
 */
export type UserTypeCondition = 'GUEST' | 'LOGGED_IN';

/**
 * User role conditions
 */
export type UserRoleCondition = 'USER' | 'VENDOR' | 'ADMIN';

/**
 * Payment rule conditions
 * All conditions are optional - a rule matches if ALL specified conditions match
 */
export interface PaymentRuleConditions {
  /** Order total amount - minimum (inclusive) */
  minAmount?: number;

  /** Order total amount - maximum (inclusive) */
  maxAmount?: number;

  /** Product categories that trigger this rule */
  categories?: string[];

  /** User type conditions */
  userTypes?: UserTypeCondition[];

  /** User role conditions */
  userRoles?: UserRoleCondition[];
}

// ============================================================================
// ADVANCE PAYMENT SETTINGS TYPES
// ============================================================================

export type AdvancePaymentType = 'PARTIAL' | 'FULL';

/**
 * Advance payment settings
 * Used when action = FORCE_ADVANCE
 */
export interface AdvancePaymentSettings {
  /** Type of advance payment required */
  type: AdvancePaymentType;

  /** Percentage of order total required for partial advance payment */
  percentage?: number;

  /** Fixed amount required for advance payment */
  fixedAmount?: number;

  /** Minimum advance amount in currency */
  minAmount?: number;

  /** Maximum advance amount in currency */
  maxAmount?: number;
}

// ============================================================================
// PAYMENT RULE TYPES
// ============================================================================

/**
 * Complete payment rule definition
 */
export interface PaymentRule {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  priority: number;
  paymentMethod?: PaymentMethod | null;
  action: PaymentRuleAction;
  conditions: PaymentRuleConditions;
  advancePaymentSettings?: AdvancePaymentSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input type for creating a new payment rule
 */
export interface CreatePaymentRuleInput {
  name: string;
  description?: string | null;
  isActive?: boolean;
  priority?: number;
  paymentMethod?: PaymentMethod | null;
  action: PaymentRuleAction;
  conditions: PaymentRuleConditions;
  advancePaymentSettings?: AdvancePaymentSettings;
}

/**
 * Input type for updating an existing payment rule
 */
export interface UpdatePaymentRuleInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  priority?: number;
  paymentMethod?: PaymentMethod | null;
  action?: PaymentRuleAction;
  conditions?: PaymentRuleConditions;
  advancePaymentSettings?: AdvancePaymentSettings;
}

// ============================================================================
// PAYMENT METHOD EVALUATION RESULT TYPES
// ============================================================================

/**
 * Status of a payment method after rule evaluation
 */
export type PaymentMethodStatus =
  | 'ALLOWED'
  | 'RESTRICTED'
  | 'FORCE_ADVANCE_PARTIAL'
  | 'FORCE_ADVANCE_FULL';

/**
 * Result of evaluating a single payment method
 */
export interface PaymentMethodResult {
  /** The payment method */
  method: PaymentMethod;

  /** Current status of this payment method */
  status: PaymentMethodStatus;

  /** Rules that were applied to determine this status */
  appliedRules: AppliedPaymentRuleInfo[];

  /** Advance payment requirements (only present when status is FORCE_ADVANCE_*) */
  advancePaymentRequirement?: AdvancePaymentRequirement;
}

/**
 * Information about an applied payment rule
 */
export interface AppliedPaymentRuleInfo {
  ruleId: string;
  ruleName: string;
  action: PaymentRuleAction;
  priority: number;
  conditions: PaymentRuleConditions;
}

/**
 * Advance payment requirement details
 */
export interface AdvancePaymentRequirement {
  type: AdvancePaymentType;
  amount: number;
  percentage?: number;
}

/**
 * Result of evaluating payment methods for a checkout context
 */
export interface PaymentMethodsEvaluationResult {
  /** Individual payment method results */
  methods: Record<PaymentMethod, PaymentMethodResult>;

  /** List of all payment methods that are currently allowed */
  allowedMethods: PaymentMethod[];

  /** List of restricted payment methods with reasons */
  restrictedMethods: PaymentMethod[];

  /** Payment methods that require advance payment */
  advancePaymentMethods: PaymentMethod[];

  /** Timestamp of evaluation */
  evaluatedAt: Date;
}

// ============================================================================
// CHECKOUT CONTEXT TYPES
// ============================================================================

/**
 * Context required to evaluate payment rules for a checkout
 */
export interface CheckoutContext {
  /** Total order amount */
  orderTotal: number;

  /** Product categories in the order */
  categories: string[];

  /** User information (null = guest) */
  user: CheckoutUserInfo | null;
}

/**
 * User information for checkout context
 */
export interface CheckoutUserInfo {
  id: string;
  role: UserRoleCondition;
  isAuthenticated: boolean;
}

// ============================================================================
// ORDER PAYMENT INFO TYPES
// ============================================================================

/**
 * Payment information stored on an order
 */
export interface OrderPaymentInfo {
  /** Selected payment method */
  paymentMethod: PaymentMethod;

  /** Payment rules that were applied */
  appliedRules: AppliedPaymentRuleInfo[];

  /** Advance payment details (if applicable) */
  advancePayment?: AdvancePaymentRequirement;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request payload for evaluating payment methods
 */
export interface EvaluatePaymentMethodsRequest {
  orderTotal: number;
  categories: string[];
  userId?: string;
  userRole?: UserRoleCondition;
  isGuest?: boolean;
}

/**
 * Request payload for applying payment rules to an order
 */
export interface ApplyPaymentRulesRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  appliedRules: Array<{
    ruleId: string;
    action: PaymentRuleAction;
    conditions: PaymentRuleConditions;
  }>;
  advancePayment?: AdvancePaymentRequirement;
}

// ============================================================================
// VALIDATION ERROR TYPES
// ============================================================================

/**
 * Validation error for payment rule conditions
 */
export interface PaymentRuleValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Result of validating payment rule conditions
 */
export interface PaymentRuleValidationResult {
  isValid: boolean;
  errors: PaymentRuleValidationError[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON string to PaymentRuleConditions
 */
export function parseConditions(jsonString: string): PaymentRuleConditions {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      minAmount: parsed.minAmount,
      maxAmount: parsed.maxAmount,
      categories: parsed.categories || [],
      userTypes: parsed.userTypes || [],
      userRoles: parsed.userRoles || [],
    };
  } catch (error) {
    console.error('Failed to parse conditions:', error);
    return {};
  }
}

/**
 * Stringify PaymentRuleConditions to JSON string
 */
export function stringifyConditions(conditions: PaymentRuleConditions): string {
  return JSON.stringify(conditions);
}

/**
 * Parse JSON string to AdvancePaymentSettings
 */
export function parseAdvancePaymentSettings(jsonString: string | null | undefined): AdvancePaymentSettings | undefined {
  if (!jsonString) return undefined;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse advance payment settings:', error);
    return undefined;
  }
}

/**
 * Stringify AdvancePaymentSettings to JSON string
 */
export function stringifyAdvancePaymentSettings(settings: AdvancePaymentSettings | undefined): string | undefined {
  if (!settings) return undefined;
  return JSON.stringify(settings);
}
