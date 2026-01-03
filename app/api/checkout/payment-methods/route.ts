/**
 * Checkout Payment Methods API
 *
 * GET /api/checkout/payment-methods - Evaluate available payment methods for current cart/checkout
 *
 * This endpoint integrates the payment rules engine with the checkout flow.
 * It evaluates all active payment rules and returns which payment methods are available
 * based on the current checkout context (order total, categories, user info).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentRulesService } from '@/lib/payment-rules/service';
import type {
  CheckoutContext,
  EvaluatePaymentMethodsRequest,
} from '@/lib/payment-rules/types';

// ============================================================================
// GET - Evaluate available payment methods
// ============================================================================

export async function GET(request: Request) {
  try {
    // Get user session (optional - guest users can check out too)
    const session = await getServerSession(authOptions);

    // Parse query parameters for checkout context
    const { searchParams } = new URL(request.url);
    const orderTotal = searchParams.get('orderTotal');
    const categories = searchParams.get('categories');
    const isGuest = searchParams.get('isGuest');

    // Validate required parameters
    if (!orderTotal) {
      return NextResponse.json(
        { error: 'orderTotal parameter is required' },
        { status: 400 }
      );
    }

    // Parse parameters
    const parsedOrderTotal = parseFloat(orderTotal);
    if (isNaN(parsedOrderTotal) || parsedOrderTotal < 0) {
      return NextResponse.json(
        { error: 'orderTotal must be a valid positive number' },
        { status: 400 }
      );
    }

    // Parse categories (comma-separated)
    const parsedCategories: string[] = categories
      ? categories.split(',').map((c) => c.trim()).filter((c) => c.length > 0)
      : [];

    // Build checkout context
    const context: CheckoutContext = {
      orderTotal: parsedOrderTotal,
      categories: parsedCategories,
      user: session?.user
        ? {
            id: session.user.id,
            role: (session.user.role as any) || 'USER',
            isAuthenticated: true,
          }
        : null,
    };

    // Evaluate payment rules
    const result = await PaymentRulesService.evaluatePaymentMethods(context);

    return NextResponse.json({
      context: {
        orderTotal: context.orderTotal,
        categories: context.categories,
        user: context.user
          ? {
              id: context.user.id,
              role: context.user.role,
              isAuthenticated: context.user.isAuthenticated,
            }
          : null,
        isGuest: !session?.user,
      },
      evaluation: result,
    });
  } catch (error) {
    console.error('Payment methods evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate payment methods' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Evaluate payment methods with detailed context
// ============================================================================

export async function POST(request: Request) {
  try {
    // Get user session (optional)
    const session = await getServerSession(authOptions);

    const body = (await request.json()) as EvaluatePaymentMethodsRequest;

    // Validate required fields
    if (body.orderTotal === undefined || body.orderTotal === null) {
      return NextResponse.json(
        { error: 'orderTotal is required' },
        { status: 400 }
      );
    }

    if (typeof body.orderTotal !== 'number' || body.orderTotal < 0) {
      return NextResponse.json(
        { error: 'orderTotal must be a valid positive number' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.categories)) {
      return NextResponse.json(
        { error: 'categories must be an array' },
        { status: 400 }
      );
    }

    // Build checkout context
    const context: CheckoutContext = {
      orderTotal: body.orderTotal,
      categories: body.categories,
      user:
        !body.isGuest && session?.user
          ? {
              id: session.user.id,
              role: (body.userRole as any) || (session.user.role as any) || 'USER',
              isAuthenticated: true,
            }
          : null,
    };

    // Evaluate payment rules
    const result = await PaymentRulesService.evaluatePaymentMethods(context);

    return NextResponse.json({
      context: {
        orderTotal: context.orderTotal,
        categories: context.categories,
        user: context.user
          ? {
              id: context.user.id,
              role: context.user.role,
              isAuthenticated: context.user.isAuthenticated,
            }
          : null,
        isGuest: !context.user,
      },
      evaluation: result,
    });
  } catch (error) {
    console.error('Payment methods evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate payment methods' },
      { status: 500 }
    );
  }
}
