/**
 * Order Payment Rules API
 *
 * GET /api/orders/:orderId/payment-rules - Get applied payment rules for an order
 *
 * This endpoint retrieves the payment rules that were applied to an order,
 * providing an audit trail of why certain payment methods were available or restricted.
 */

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentRulesService } from '@/lib/payment-rules/service';
import { parseConditions } from '@/lib/payment-rules/types';

// ============================================================================
// GET - Get applied payment rules for an order
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Get session (optional for viewing, but required for security check)
    const session = await getServerSession(authOptions);
    const { orderId } = await params;

    // Fetch the order to check ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization: user must be the order owner or an admin
    if (
      !session?.user ||
      (session.user.id !== order.userId && session.user.role !== 'ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch applied payment rules using the service
    const appliedRules = await PaymentRulesService.getOrderAppliedRules(orderId);

    // Format the response with parsed conditions
    const formattedRules = appliedRules.map((appliedRule) => ({
      id: appliedRule.id,
      action: appliedRule.action,
      evaluatedConditions: parseConditions(appliedRule.evaluatedConditions || '{}'),
      appliedAt: appliedRule.createdAt,
      rule: {
        id: appliedRule.rule.id,
        name: appliedRule.rule.name,
        description: appliedRule.rule.description,
        priority: appliedRule.rule.priority,
        paymentMethod: appliedRule.rule.paymentMethod,
        action: appliedRule.rule.action,
        conditions: parseConditions(appliedRule.rule.conditions),
      },
    }));

    return NextResponse.json({
      orderId,
      paymentMethod: order.paymentMethod,
      appliedRules: formattedRules,
      total: formattedRules.length,
    });
  } catch (error) {
    console.error('Applied payment rules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applied payment rules' },
      { status: 500 }
    );
  }
}
