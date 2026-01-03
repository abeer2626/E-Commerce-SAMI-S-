/**
 * Payment Rules Admin API - Individual Rule Route
 *
 * GET /api/admin/payment-rules/:id - Get a single payment rule by ID
 * PATCH /api/admin/payment-rules/:id - Update a payment rule
 * DELETE /api/admin/payment-rules/:id - Delete a payment rule
 */

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { PaymentRulesService } from '@/lib/payment-rules/service';
import {
  validatePaymentRuleInput,
  formatValidationErrors,
} from '@/lib/payment-rules/validation';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updatePaymentRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  paymentMethod: z.enum(['COD', 'ADVANCE', 'ONLINE']).optional(),
  action: z.enum(['ALLOW', 'RESTRICT', 'FORCE_ADVANCE']).optional(),
  conditions: z
    .object({
      minAmount: z.number().min(0).optional(),
      maxAmount: z.number().min(0).optional(),
      categories: z.array(z.string()).optional(),
      userTypes: z.array(z.enum(['GUEST', 'LOGGED_IN'])).optional(),
      userRoles: z.array(z.enum(['USER', 'VENDOR', 'ADMIN'])).optional(),
    })
    .optional(),
  advancePaymentSettings: z
    .object({
      type: z.enum(['PARTIAL', 'FULL']),
      percentage: z.number().min(0).max(100).optional(),
      fixedAmount: z.number().min(0).optional(),
      minAmount: z.number().min(0).optional(),
      maxAmount: z.number().min(0).optional(),
    })
    .optional(),
});

// ============================================================================
// GET - Fetch a single payment rule by ID
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch rule using the service
    const rule = await PaymentRulesService.getRuleById(id);

    if (!rule) {
      return NextResponse.json({ error: 'Payment rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Payment rule fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment rule' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update a payment rule
// ============================================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if rule exists
    const existingRule = await PaymentRulesService.getRuleById(id);
    if (!existingRule) {
      return NextResponse.json({ error: 'Payment rule not found' }, { status: 404 });
    }

    // Validate input using Zod
    const validation = updatePaymentRuleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // If name is being updated, check for duplicates
    if (validation.data.name && validation.data.name !== existingRule.name) {
      const duplicateRule = await prisma.paymentRule.findUnique({
        where: { name: validation.data.name },
      });

      if (duplicateRule) {
        return NextResponse.json(
          { error: 'A payment rule with this name already exists' },
          { status: 409 }
        );
      }
    }

    // If action or conditions are being updated, perform full validation
    const requiresFullValidation =
      validation.data.action !== undefined ||
      validation.data.conditions !== undefined ||
      validation.data.advancePaymentSettings !== undefined;

    if (requiresFullValidation) {
      const ruleForValidation = {
        name: validation.data.name ?? existingRule.name,
        description: validation.data.description ?? existingRule.description,
        paymentMethod: validation.data.paymentMethod ?? existingRule.paymentMethod,
        action: validation.data.action ?? existingRule.action,
        conditions: validation.data.conditions ?? existingRule.conditions,
        advancePaymentSettings:
          validation.data.advancePaymentSettings ?? existingRule.advancePaymentSettings,
        priority: validation.data.priority ?? existingRule.priority,
      };

      const businessValidation = validatePaymentRuleInput(ruleForValidation);
      if (!businessValidation.isValid) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatValidationErrors(businessValidation.errors),
          },
          { status: 400 }
        );
      }
    }

    // Update the rule using the service
    const updatedRule = await PaymentRulesService.updateRule(id, validation.data);

    return NextResponse.json({
      message: 'Payment rule updated successfully',
      rule: updatedRule,
    });
  } catch (error) {
    console.error('Payment rule update error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment rule' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete a payment rule
// ============================================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if rule exists
    const existingRule = await PaymentRulesService.getRuleById(id);
    if (!existingRule) {
      return NextResponse.json({ error: 'Payment rule not found' }, { status: 404 });
    }

    // Check if rule is being used by any orders
    const appliedRuleCount = await prisma.appliedPaymentRule.count({
      where: { ruleId: id },
    });

    if (appliedRuleCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete payment rule that has been applied to orders',
          details: 'Consider deactivating the rule instead',
          appliedOrderCount: appliedRuleCount,
        },
        { status: 409 }
      );
    }

    // Delete the rule using the service
    await PaymentRulesService.deleteRule(id);

    return NextResponse.json({
      message: 'Payment rule deleted successfully',
    });
  } catch (error) {
    console.error('Payment rule deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment rule' },
      { status: 500 }
    );
  }
}
