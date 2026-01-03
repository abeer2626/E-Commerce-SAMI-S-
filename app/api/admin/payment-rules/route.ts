/**
 * Payment Rules Admin API - Main Route
 *
 * POST /api/admin/payment-rules - Create a new payment rule
 * GET /api/admin/payment-rules - Get all payment rules (with optional filters)
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

const createPaymentRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  paymentMethod: z.enum(['COD', 'ADVANCE', 'ONLINE']).optional(),
  action: z.enum(['ALLOW', 'RESTRICT', 'FORCE_ADVANCE']),
  conditions: z.object({
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    categories: z.array(z.string()).optional(),
    userTypes: z.array(z.enum(['GUEST', 'LOGGED_IN'])).optional(),
    userRoles: z.array(z.enum(['USER', 'VENDOR', 'ADMIN'])).optional(),
  }),
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
// GET - Fetch all payment rules
// ============================================================================

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const paymentMethod = searchParams.get('paymentMethod');

    // Build filters
    const filters: any = {};
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }
    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
    }

    // Fetch rules using the service
    const rules = await PaymentRulesService.getRules(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return NextResponse.json({
      rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('Payment rules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment rules' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create a new payment rule
// ============================================================================

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input using Zod
    const validation = createPaymentRuleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Additional business logic validation
    const businessValidation = validatePaymentRuleInput(validation.data);
    if (!businessValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(businessValidation.errors),
        },
        { status: 400 }
      );
    }

    // Check if a rule with the same name already exists
    const existingRule = await prisma.paymentRule.findUnique({
      where: { name: validation.data.name },
    });

    if (existingRule) {
      return NextResponse.json(
        { error: 'A payment rule with this name already exists' },
        { status: 409 }
      );
    }

    // Create the rule using the service
    const rule = await PaymentRulesService.createRule({
      name: validation.data.name,
      description: validation.data.description,
      isActive: validation.data.isActive ?? true,
      priority: validation.data.priority ?? 0,
      paymentMethod: validation.data.paymentMethod,
      action: validation.data.action,
      conditions: validation.data.conditions,
      advancePaymentSettings: validation.data.advancePaymentSettings,
    });

    return NextResponse.json(
      {
        message: 'Payment rule created successfully',
        rule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment rule creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment rule' },
      { status: 500 }
    );
  }
}
