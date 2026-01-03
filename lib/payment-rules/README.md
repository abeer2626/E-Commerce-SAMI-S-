# Payment Rules Engine - Documentation

## Overview

The Payment Rules Engine is a flexible, rule-based system that dynamically allows or restricts payment methods based on configurable conditions. It enables administrators to control payment behavior without modifying core code.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHECKOUT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cart/Order → Payment Rules Engine → Allowed Methods            │
│     │              │                    │                       │
│     │              ▼                    ▼                       │
│     │        ┌─────────────┐      ┌─────────────────┐          │
│     │        │ Evaluation  │      │ Payment Method  │          │
│     │        │   Service   │      │    Results      │          │
│     │        └─────────────┘      └─────────────────┘          │
│     │              │                                           │
│     ▼              ▼                                           │
│  Order Created → Applied Rules Recorded                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### PaymentRule Model

```prisma
model PaymentRule {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  priority    Int      @default(0)           // Higher priority first
  paymentMethod String?                   // COD, ADVANCE, ONLINE
  action      String                      // ALLOW, RESTRICT, FORCE_ADVANCE
  conditions  String                      // JSON string of conditions
  advancePaymentSettings String?          // JSON string for advance payment
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  appliedPaymentRules AppliedPaymentRule[]
  @@index([isActive, priority])
}
```

### AppliedPaymentRule Model

```prisma
model AppliedPaymentRule {
  id         String   @id @default(cuid())
  orderId    String
  ruleId     String
  action     String
  evaluatedConditions String?             // JSON string

  order      Order     @relation(fields: [orderId], references: [id])
  rule       PaymentRule @relation(fields: [ruleId], references: [id])

  @@unique([orderId, ruleId])
}
```

## API Endpoints

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/payment-rules` | Get all payment rules |
| POST | `/api/admin/payment-rules` | Create a new payment rule |
| GET | `/api/admin/payment-rules/:id` | Get a single payment rule |
| PATCH | `/api/admin/payment-rules/:id` | Update a payment rule |
| DELETE | `/api/admin/payment-rules/:id` | Delete a payment rule |

### Checkout APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/checkout/payment-methods` | Evaluate available payment methods |
| POST | `/api/checkout/payment-methods` | Evaluate with detailed context |

### Order APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/:orderId/payment-rules` | Get applied rules for an order |

## Payment Methods

- **COD** - Cash on Delivery
- **ADVANCE** - Advance Payment (partial or full)
- **ONLINE** - Online Payment (Stripe, etc.)

## Rule Actions

### ALLOW
Payment method is permitted for matching conditions.

### RESTRICT
Payment method is blocked for matching conditions.

### FORCE_ADVANCE
Payment method requires advance payment:
- **PARTIAL** - Specified percentage or fixed amount
- **FULL** - 100% of order total

## Condition Types

```typescript
interface PaymentRuleConditions {
  // Order amount range
  minAmount?: number;
  maxAmount?: number;

  // Product categories
  categories?: string[];           // ["Electronics", "Fashion"]

  // User type
  userTypes?: ('GUEST' | 'LOGGED_IN')[];

  // User role
  userRoles?: ('USER' | 'VENDOR' | 'ADMIN')[];
}
```

## Rule Evaluation Priority

Rules are evaluated in priority order (highest first):

1. Fetch all active rules ordered by `priority` DESC
2. For each rule, check if conditions match checkout context
3. If conditions match, apply action to affected payment methods
4. Higher priority rules override lower priority rules
5. RESTRICT overrides ALLOW, but FORCE_ADVANCE overrides both

## Usage Examples

### 1. Create a Payment Rule

```typescript
// POST /api/admin/payment-rules
{
  "name": "High Value Orders - Advance Payment Only",
  "description": "Orders above $500 require 20% advance payment",
  "priority": 100,
  "paymentMethod": "COD",
  "action": "FORCE_ADVANCE",
  "conditions": {
    "minAmount": 500
  },
  "advancePaymentSettings": {
    "type": "PARTIAL",
    "percentage": 20
  }
}
```

### 2. Restrict COD for Electronics

```typescript
{
  "name": "No COD for Electronics",
  "priority": 50,
  "paymentMethod": "COD",
  "action": "RESTRICT",
  "conditions": {
    "categories": ["Electronics"]
  }
}
```

### 3. Allow Online Payment for Admins Only

```typescript
{
  "name": "Online Payment - Admin Only",
  "priority": 200,
  "paymentMethod": "ONLINE",
  "action": "ALLOW",
  "conditions": {
    "userRoles": ["ADMIN"]
  }
}
```

### 4. Full Advance for Guest Users

```typescript
{
  "name": "Guest Users - Full Advance Required",
  "priority": 150,
  "paymentMethod": "COD",
  "action": "RESTRICT",
  "conditions": {
    "userTypes": ["GUEST"]
  }
}
```

### 5. Evaluate Payment Methods at Checkout

```typescript
// GET /api/checkout/payment-methods?orderTotal=600&categories=Electronics

// Response:
{
  "context": {
    "orderTotal": 600,
    "categories": ["Electronics"],
    "user": { "id": "xxx", "role": "USER", "isAuthenticated": true }
  },
  "evaluation": {
    "methods": {
      "COD": {
        "method": "COD",
        "status": "FORCE_ADVANCE_PARTIAL",
        "appliedRules": [...],
        "advancePaymentRequirement": {
          "type": "PARTIAL",
          "amount": 120,
          "percentage": 20
        }
      },
      "ADVANCE": {
        "method": "ADVANCE",
        "status": "ALLOWED",
        "appliedRules": []
      },
      "ONLINE": {
        "method": "ONLINE",
        "status": "ALLOWED",
        "appliedRules": []
      }
    },
    "allowedMethods": ["ADVANCE", "ONLINE", "COD"],
    "restrictedMethods": [],
    "advancePaymentMethods": ["COD"]
  }
}
```

## Creating an Order with Payment Rules

```typescript
// POST /api/orders
{
  "userId": "user_id",
  "total": 600,
  "shippingAddress": "123 Main St, City, State",
  "items": [...],
  "paymentMethod": "COD",
  "advancePaymentRequirement": {
    "type": "PARTIAL",
    "amount": 120,
    "percentage": 20
  }
}
```

## Testing the Rules Engine

### Test Rule Evaluation

```bash
# Evaluate payment methods for a $600 electronics order
curl "http://localhost:3000/api/checkout/payment-methods?orderTotal=600&categories=Electronics"
```

### Create a Test Rule

```bash
curl -X POST http://localhost:3000/api/admin/payment-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rule",
    "priority": 1,
    "action": "RESTRICT",
    "conditions": {
      "minAmount": 1000
    }
  }'
```

## Best Practices

1. **Priority Management**: Use priority values in ranges (0-100 for basic, 100-500 for advanced, 500+ for critical)

2. **Rule Naming**: Use descriptive names like:
   - "Orders > $500 - Advance Required"
   - "Electronics - No COD"
   - "Guest Users - Full Payment"

3. **Condition Specificity**: More specific rules should have higher priority

4. **Testing**: Always test rules in a development environment first

5. **Audit Trail**: Check `/api/orders/:orderId/payment-rules` to see which rules were applied

## Error Handling

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": "conditions.minAmount: minAmount cannot be greater than maxAmount"
}
```

### Payment Method Not Allowed

```json
{
  "error": "Payment method COD is not allowed for this order",
  "appliedRules": [...],
  "suggestion": "Please evaluate payment methods first using /api/checkout/payment-methods"
}
```

## File Structure

```
lib/payment-rules/
├── types.ts              # All TypeScript types
├── service.ts            # Core evaluation service
├── validation.ts         # Validation utilities
├── index.ts              # Public API exports
└── README.md             # This file

app/api/
├── admin/payment-rules/
│   ├── route.ts         # GET (all), POST (create)
│   └── [id]/route.ts    # GET, PATCH, DELETE
├── checkout/payment-methods/
│   └── route.ts         # GET, POST (evaluate)
└── orders/[orderId]/payment-rules/
    └── route.ts         # GET (applied rules)
```

## Future Enhancements

1. **Time-based Rules**: Apply rules during specific periods (holidays, sales)

2. **Geographic Rules**: Restrict methods by location

3. **Vendor-specific Rules**: Different rules per vendor

4. **Coupon Integration**: Apply payment rules based on coupon codes

5. **Rule Templates**: Pre-built rule templates for common scenarios
