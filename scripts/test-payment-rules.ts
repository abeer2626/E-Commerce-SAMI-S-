/**
 * Payment Rules Engine - Test Script
 *
 * This script creates sample payment rules and tests the evaluation logic
 */

import { PrismaClient } from '@prisma/client';
import { PaymentRulesService } from '../lib/payment-rules/service';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Payment Rules Engine Test ===\n');

  // Clear existing rules (optional - for clean testing)
  console.log('1. Clearing existing payment rules...');
  await prisma.appliedPaymentRule.deleteMany({});
  await prisma.paymentRule.deleteMany({});
  console.log('   ✓ Cleared existing rules\n');

  // Create test rules
  console.log('2. Creating test payment rules...');

  // Rule 1: High value orders require advance payment
  const rule1 = await PaymentRulesService.createRule({
    name: 'High Value Orders - Advance Required',
    description: 'Orders above $500 require 20% advance payment via COD',
    priority: 100,
    paymentMethod: 'COD',
    action: 'FORCE_ADVANCE',
    conditions: {
      minAmount: 500,
    },
    advancePaymentSettings: {
      type: 'PARTIAL',
      percentage: 20,
    },
  });
  console.log('   ✓ Created: High Value Orders Rule (priority: 100)');

  // Rule 2: Restrict COD for Electronics category
  const rule2 = await PaymentRulesService.createRule({
    name: 'Electronics - No COD',
    description: 'Electronics products cannot use COD payment',
    priority: 50,
    paymentMethod: 'COD',
    action: 'RESTRICT',
    conditions: {
      categories: ['Electronics'],
    },
  });
  console.log('   ✓ Created: Electronics No COD Rule (priority: 50)');

  // Rule 3: Admin users can use any payment method
  const rule3 = await PaymentRulesService.createRule({
    name: 'Admin - Online Payment Access',
    description: 'Admin users have access to online payment',
    priority: 200,
    paymentMethod: 'ONLINE',
    action: 'ALLOW',
    conditions: {
      userRoles: ['ADMIN'],
    },
  });
  console.log('   ✓ Created: Admin Online Payment Rule (priority: 200)');

  // Rule 4: Small orders allow all methods
  const rule4 = await PaymentRulesService.createRule({
    name: 'Small Orders - All Methods Allowed',
    description: 'Orders under $50 can use any payment method',
    priority: 10,
    action: 'ALLOW',
    conditions: {
      maxAmount: 50,
    },
  });
  console.log('   ✓ Created: Small Orders Rule (priority: 10)');

  console.log('\n3. Testing rule evaluation...\n');

  // Test Case 1: High value order ($600 Electronics) - should force advance on COD
  console.log('   Test 1: $600 Electronics order (regular user)');
  const test1 = await PaymentRulesService.evaluatePaymentMethods({
    orderTotal: 600,
    categories: ['Electronics'],
    user: {
      id: 'user-123',
      role: 'USER',
      isAuthenticated: true,
    },
  });
  console.log('     COD Status:', test1.methods.COD.status);
  console.log('     ADVANCE Status:', test1.methods.ADVANCE.status);
  console.log('     ONLINE Status:', test1.methods.ONLINE.status);
  console.log('     Allowed Methods:', test1.allowedMethods.join(', '));
  console.log('     Advance Payment Required:', test1.methods.COD.advancePaymentRequirement?.amount || 'N/A');

  // Test Case 2: Small order ($30) - should allow all methods
  console.log('\n   Test 2: $30 order (regular user)');
  const test2 = await PaymentRulesService.evaluatePaymentMethods({
    orderTotal: 30,
    categories: ['Fashion'],
    user: {
      id: 'user-123',
      role: 'USER',
      isAuthenticated: true,
    },
  });
  console.log('     COD Status:', test2.methods.COD.status);
  console.log('     ADVANCE Status:', test2.methods.ADVANCE.status);
  console.log('     ONLINE Status:', test2.methods.ONLINE.status);
  console.log('     Allowed Methods:', test2.allowedMethods.join(', '));

  // Test Case 3: Admin user with high value order
  console.log('\n   Test 3: $1000 order (ADMIN user)');
  const test3 = await PaymentRulesService.evaluatePaymentMethods({
    orderTotal: 1000,
    categories: ['Fashion'],
    user: {
      id: 'admin-123',
      role: 'ADMIN',
      isAuthenticated: true,
    },
  });
  console.log('     COD Status:', test3.methods.COD.status);
  console.log('     ADVANCE Status:', test3.methods.ADVANCE.status);
  console.log('     ONLINE Status:', test3.methods.ONLINE.status);
  console.log('     Applied Rules for ONLINE:', test3.methods.ONLINE.appliedRules.length);

  // Test Case 4: Medium Electronics order ($200)
  console.log('\n   Test 4: $200 Electronics order');
  const test4 = await PaymentRulesService.evaluatePaymentMethods({
    orderTotal: 200,
    categories: ['Electronics'],
    user: {
      id: 'user-123',
      role: 'USER',
      isAuthenticated: true,
    },
  });
  console.log('     COD Status:', test4.methods.COD.status);
  console.log('     ADVANCE Status:', test4.methods.ADVANCE.status);
  console.log('     ONLINE Status:', test4.methods.ONLINE.status);
  console.log('     Restricted Methods:', test4.restrictedMethods.join(', '));

  // Test Case 5: Guest user
  console.log('\n   Test 5: $100 order (guest user)');
  const test5 = await PaymentRulesService.evaluatePaymentMethods({
    orderTotal: 100,
    categories: ['Fashion'],
    user: null,
  });
  console.log('     COD Status:', test5.methods.COD.status);
  console.log('     ADVANCE Status:', test5.methods.ADVANCE.status);
  console.log('     ONLINE Status:', test5.methods.ONLINE.status);

  console.log('\n4. Fetching all rules from database...');
  const allRules = await PaymentRulesService.getRules();
  console.log(`   Total rules: ${allRules.length}`);
  allRules.forEach((rule) => {
    console.log(`   - [${rule.priority}] ${rule.name} (${rule.action})`);
    console.log(`     Method: ${rule.paymentMethod || 'ALL'}`);
    console.log(`     Active: ${rule.isActive}`);
  });

  console.log('\n=== Test Complete ===');
}

main()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
