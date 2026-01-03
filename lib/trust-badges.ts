/**
 * Trust Badge Awarding System
 * Automatically awards badges to vendors based on performance
 */

import { prisma } from './prisma';

export interface VendorStats {
  totalOrders: number;
  successfulDeliveries: number;
  totalRevenue: number;
  paidOnTimeCount: number;
}

export type BadgeType = 'PAID_ON_TIME' | 'TOP_SELLER' | 'TRUSTED' | 'FAST_DELIVERY' | 'PREMIUM';

/**
 * Calculate trust score for a vendor
 */
export async function calculateTrustScore(vendorId: string): Promise<number> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) return 0;

  let score = 50; // Base score

  // Revenue factor (up to 20 points)
  const revenueScore = Math.min((vendor.totalEarnings / 10000) * 20, 20);
  score += revenueScore;

  // Delivery success rate (up to 20 points)
  if (vendor.totalOrders > 0) {
    const successRate = (vendor.successfulDeliveries / vendor.totalOrders) * 100;
    score += (successRate / 100) * 20;
  }

  // Paid on time streak (up to 10 points)
  score += Math.min(vendor.paidOnTimeStreak * 2, 10);

  return Math.min(Math.round(score), 100);
}

/**
 * Check and award badges based on vendor performance
 */
export async function awardBadges(vendorId: string): Promise<BadgeType[]> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) return [];

  const badges: BadgeType[] = vendor.badges ? JSON.parse(vendor.badges) : [];

  // PAID_ON_TIME: 5+ consecutive on-time payments
  if (vendor.paidOnTimeStreak >= 5 && !badges.includes('PAID_ON_TIME')) {
    badges.push('PAID_ON_TIME');
  }

  // TOP_SELLER: High revenue or sales volume
  if (vendor.totalEarnings > 5000 && !badges.includes('TOP_SELLER')) {
    badges.push('TOP_SELLER');
  }

  // TRUSTED: Verified and approved for 30+ days
  const daysSinceApproval = Math.floor(
    (Date.now() - new Date(vendor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (vendor.isApproved && daysSinceApproval >= 30 && !badges.includes('TRUSTED')) {
    badges.push('TRUSTED');
  }

  // FAST_DELIVERY: 95%+ delivery success rate with 10+ orders
  if (vendor.totalOrders >= 10) {
    const successRate = (vendor.successfulDeliveries / vendor.totalOrders) * 100;
    if (successRate >= 95 && !badges.includes('FAST_DELIVERY')) {
      badges.push('FAST_DELIVERY');
    }
  }

  // PREMIUM: Trust score 80+
  const trustScore = await calculateTrustScore(vendorId);
  if (trustScore >= 80 && !badges.includes('PREMIUM')) {
    badges.push('PREMIUM');
  }

  // Update vendor with new badges
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      badges: JSON.stringify(badges),
      trustScore,
    },
  });

  return badges;
}

/**
 * Update vendor stats after order completion
 */
export async function updateVendorStats(vendorId: string, orderStatus: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) return;

  const updateData: any = {
    totalOrders: { increment: 1 },
  };

  // If order delivered successfully
  if (orderStatus === 'DELIVERED') {
    updateData.successfulDeliveries = { increment: 1 };
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: updateData,
  });

  // Check for new badges
  await awardBadges(vendorId);
}

/**
 * Increment paid on time streak when payout is processed
 */
export async function incrementPaidOnTimeStreak(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { paidOnTimeStreak: true },
  });

  if (!vendor) return;

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      paidOnTimeStreak: vendor.paidOnTimeStreak + 1,
    },
  });

  // Check for PAID_ON_TIME badge
  await awardBadges(vendorId);
}
