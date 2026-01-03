/**
 * Payment Rules Engine - Validation Utilities
 *
 * This file contains validation functions for payment rules.
 * Ensures data integrity and business rule compliance.
 */

import type {
  PaymentMethod,
  PaymentRuleAction,
  PaymentRuleConditions,
  AdvancePaymentSettings,
  PaymentRuleValidationError,
  PaymentRuleValidationResult,
  CreatePaymentRuleInput,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const VALID_PAYMENT_METHODS: PaymentMethod[] = ['COD', 'ADVANCE', 'ONLINE'];
export const VALID_PAYMENT_RULE_ACTIONS: PaymentRuleAction[] = ['ALLOW', 'RESTRICT', 'FORCE_ADVANCE'];
export const VALID_USER_TYPES = ['GUEST', 'LOGGED_IN'];
export const VALID_USER_ROLES = ['USER', 'VENDOR', 'ADMIN'];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate payment method
 */
export function validatePaymentMethod(value: any): PaymentMethod | null {
  if (typeof value !== 'string') return null;
  if (value === '') return null; // Empty means applies to all methods
  return VALID_PAYMENT_METHODS.includes(value as PaymentMethod) ? (value as PaymentMethod) : null;
}

/**
 * Validate payment rule action
 */
export function validatePaymentRuleAction(value: any): PaymentRuleAction | null {
  if (typeof value !== 'string') return null;
  return VALID_PAYMENT_RULE_ACTIONS.includes(value as PaymentRuleAction)
    ? (value as PaymentRuleAction)
    : null;
}

/**
 * Validate payment rule conditions
 */
export function validatePaymentRuleConditions(
  conditions: any
): PaymentRuleValidationResult {
  const errors: PaymentRuleValidationError[] = [];

  // Conditions must be an object
  if (!conditions || typeof conditions !== 'object' || Array.isArray(conditions)) {
    return {
      isValid: false,
      errors: [
        {
          field: 'conditions',
          message: 'Conditions must be an object',
          value: conditions,
        },
      ],
    };
  }

  // Validate minAmount
  if (conditions.minAmount !== undefined) {
    if (typeof conditions.minAmount !== 'number' || conditions.minAmount < 0) {
      errors.push({
        field: 'conditions.minAmount',
        message: 'minAmount must be a non-negative number',
        value: conditions.minAmount,
      });
    }

    // Check if minAmount is greater than maxAmount (if both are specified)
    if (
      conditions.maxAmount !== undefined &&
      conditions.minAmount > conditions.maxAmount
    ) {
      errors.push({
        field: 'conditions.minAmount',
        message: 'minAmount cannot be greater than maxAmount',
        value: conditions.minAmount,
      });
    }
  }

  // Validate maxAmount
  if (conditions.maxAmount !== undefined) {
    if (typeof conditions.maxAmount !== 'number' || conditions.maxAmount < 0) {
      errors.push({
        field: 'conditions.maxAmount',
        message: 'maxAmount must be a non-negative number',
        value: conditions.maxAmount,
      });
    }
  }

  // Validate categories
  if (conditions.categories !== undefined) {
    if (!Array.isArray(conditions.categories)) {
      errors.push({
        field: 'conditions.categories',
        message: 'categories must be an array',
        value: conditions.categories,
      });
    } else if (!conditions.categories.every((c: any) => typeof c === 'string' && c.length > 0)) {
      errors.push({
        field: 'conditions.categories',
        message: 'categories must be an array of non-empty strings',
        value: conditions.categories,
      });
    }
  }

  // Validate userTypes
  if (conditions.userTypes !== undefined) {
    if (!Array.isArray(conditions.userTypes)) {
      errors.push({
        field: 'conditions.userTypes',
        message: 'userTypes must be an array',
        value: conditions.userTypes,
      });
    } else {
      const invalidTypes = conditions.userTypes.filter(
        (t: any) => !VALID_USER_TYPES.includes(t)
      );
      if (invalidTypes.length > 0) {
        errors.push({
          field: 'conditions.userTypes',
          message: `userTypes contains invalid values: ${invalidTypes.join(', ')}`,
          value: conditions.userTypes,
        });
      }
    }
  }

  // Validate userRoles
  if (conditions.userRoles !== undefined) {
    if (!Array.isArray(conditions.userRoles)) {
      errors.push({
        field: 'conditions.userRoles',
        message: 'userRoles must be an array',
        value: conditions.userRoles,
      });
    } else {
      const invalidRoles = conditions.userRoles.filter(
        (r: any) => !VALID_USER_ROLES.includes(r)
      );
      if (invalidRoles.length > 0) {
        errors.push({
          field: 'conditions.userRoles',
          message: `userRoles contains invalid values: ${invalidRoles.join(', ')}`,
          value: conditions.userRoles,
        });
      }
    }
  }

  // Ensure at least one condition is specified
  const hasConditions =
    conditions.minAmount !== undefined ||
    conditions.maxAmount !== undefined ||
    (conditions.categories && conditions.categories.length > 0) ||
    (conditions.userTypes && conditions.userTypes.length > 0) ||
    (conditions.userRoles && conditions.userRoles.length > 0);

  if (!hasConditions) {
    errors.push({
      field: 'conditions',
      message: 'At least one condition must be specified',
      value: conditions,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate advance payment settings
 */
export function validateAdvancePaymentSettings(
  settings: any,
  action: PaymentRuleAction
): PaymentRuleValidationResult {
  const errors: PaymentRuleValidationError[] = [];

  // Advance payment settings are only required for FORCE_ADVANCE action
  if (action !== 'FORCE_ADVANCE') {
    if (settings !== undefined && settings !== null) {
      return {
        isValid: false,
        errors: [
          {
            field: 'advancePaymentSettings',
            message: 'advancePaymentSettings should only be provided for FORCE_ADVANCE action',
            value: settings,
          },
        ],
      };
    }
    return { isValid: true, errors: [] };
  }

  // For FORCE_ADVANCE action, settings are required
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return {
      isValid: false,
      errors: [
        {
          field: 'advancePaymentSettings',
          message: 'advancePaymentSettings must be an object for FORCE_ADVANCE action',
          value: settings,
        },
      ],
    };
  }

  // Validate type
  if (settings.type !== 'PARTIAL' && settings.type !== 'FULL') {
    errors.push({
      field: 'advancePaymentSettings.type',
      message: 'type must be either PARTIAL or FULL',
      value: settings.type,
    });
  }

  // For PARTIAL type, validate percentage or fixedAmount
  if (settings.type === 'PARTIAL') {
    if (settings.percentage === undefined && settings.fixedAmount === undefined) {
      errors.push({
        field: 'advancePaymentSettings',
        message: 'For PARTIAL type, either percentage or fixedAmount must be specified',
        value: settings,
      });
    }

    if (settings.percentage !== undefined) {
      if (typeof settings.percentage !== 'number' || settings.percentage <= 0 || settings.percentage > 100) {
        errors.push({
          field: 'advancePaymentSettings.percentage',
          message: 'percentage must be a number between 0 and 100',
          value: settings.percentage,
        });
      }
    }

    if (settings.fixedAmount !== undefined) {
      if (typeof settings.fixedAmount !== 'number' || settings.fixedAmount <= 0) {
        errors.push({
          field: 'advancePaymentSettings.fixedAmount',
          message: 'fixedAmount must be a positive number',
          value: settings.fixedAmount,
        });
      }
    }
  }

  // Validate minAmount
  if (settings.minAmount !== undefined) {
    if (typeof settings.minAmount !== 'number' || settings.minAmount < 0) {
      errors.push({
        field: 'advancePaymentSettings.minAmount',
        message: 'minAmount must be a non-negative number',
        value: settings.minAmount,
      });
    }
  }

  // Validate maxAmount
  if (settings.maxAmount !== undefined) {
    if (typeof settings.maxAmount !== 'number' || settings.maxAmount < 0) {
      errors.push({
        field: 'advancePaymentSettings.maxAmount',
        message: 'maxAmount must be a non-negative number',
        value: settings.maxAmount,
      });
    }
  }

  // Validate minAmount vs maxAmount
  if (
    settings.minAmount !== undefined &&
    settings.maxAmount !== undefined &&
    settings.minAmount > settings.maxAmount
  ) {
    errors.push({
      field: 'advancePaymentSettings.minAmount',
      message: 'minAmount cannot be greater than maxAmount',
      value: settings.minAmount,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete payment rule input
 */
export function validatePaymentRuleInput(
  input: CreatePaymentRuleInput
): PaymentRuleValidationResult {
  const errors: PaymentRuleValidationError[] = [];

  // Validate name
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'name is required and must be a non-empty string',
      value: input.name,
    });
  }

  // Validate payment method
  if (input.paymentMethod !== undefined && input.paymentMethod !== null) {
    if (!validatePaymentMethod(input.paymentMethod)) {
      errors.push({
        field: 'paymentMethod',
        message: `paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
        value: input.paymentMethod,
      });
    }
  }

  // Validate action
  if (!input.action || !validatePaymentRuleAction(input.action)) {
    errors.push({
      field: 'action',
      message: `action must be one of: ${VALID_PAYMENT_RULE_ACTIONS.join(', ')}`,
      value: input.action,
    });
  }

  // Validate conditions
  const conditionsResult = validatePaymentRuleConditions(input.conditions);
  if (!conditionsResult.isValid) {
    errors.push(...conditionsResult.errors);
  }

  // Validate advance payment settings
  if (input.action) {
    const advanceSettingsResult = validateAdvancePaymentSettings(
      input.advancePaymentSettings,
      input.action as PaymentRuleAction
    );
    if (!advanceSettingsResult.isValid) {
      errors.push(...advanceSettingsResult.errors);
    }
  }

  // Validate priority
  if (input.priority !== undefined) {
    if (typeof input.priority !== 'number' || input.priority < 0 || !Number.isInteger(input.priority)) {
      errors.push({
        field: 'priority',
        message: 'priority must be a non-negative integer',
        value: input.priority,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into a human-readable message
 */
export function formatValidationErrors(errors: PaymentRuleValidationError[]): string {
  return errors
    .map((error) => {
      return `${error.field}: ${error.message}`;
    })
    .join('; ');
}
