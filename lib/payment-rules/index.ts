/**
 * Payment Rules Engine - Main Export File
 *
 * This file re-exports all public APIs from the payment rules engine
 * for easy importing throughout the application.
 */

// ============================================================================
// TYPES EXPORTS
// ============================================================================

export type {
  PaymentMethod,
  PaymentRuleAction,
  UserTypeCondition,
  UserRoleCondition,
  PaymentRuleConditions,
  AdvancePaymentSettings,
  AdvancePaymentType,
  PaymentRule,
  CreatePaymentRuleInput,
  UpdatePaymentRuleInput,
  PaymentMethodStatus,
  PaymentMethodResult,
  PaymentMethodsEvaluationResult,
  AppliedPaymentRuleInfo,
  AdvancePaymentRequirement,
  CheckoutContext,
  CheckoutUserInfo,
  OrderPaymentInfo,
  EvaluatePaymentMethodsRequest,
  ApplyPaymentRulesRequest,
  PaymentRuleValidationError,
  PaymentRuleValidationResult,
} from './types';

// ============================================================================
// CONSTANTS EXPORTS
// ============================================================================

export const PAYMENT_METHODS = ['COD', 'ADVANCE', 'ONLINE'] as const;
export const PAYMENT_RULE_ACTIONS = ['ALLOW', 'RESTRICT', 'FORCE_ADVANCE'] as const;
export const USER_TYPES = ['GUEST', 'LOGGED_IN'] as const;
export const USER_ROLES = ['USER', 'VENDOR', 'ADMIN'] as const;

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { PaymentRulesService } from './service';

// ============================================================================
// VALIDATION EXPORTS
// ============================================================================

export {
  validatePaymentMethod,
  validatePaymentRuleAction,
  validatePaymentRuleConditions,
  validateAdvancePaymentSettings,
  validatePaymentRuleInput,
  formatValidationErrors,
  VALID_PAYMENT_METHODS,
  VALID_PAYMENT_RULE_ACTIONS,
  VALID_USER_TYPES,
  VALID_USER_ROLES,
} from './validation';

// ============================================================================
// HELPER FUNCTIONS EXPORTS
// ============================================================================

export {
  parseConditions,
  stringifyConditions,
  parseAdvancePaymentSettings,
  stringifyAdvancePaymentSettings,
} from './types';
