/**
 * SAMI'S - Email Templates
 *
 * Centralized email template system with immutable branding.
 * All email communications must use these templates.
 *
 * @version 1.0.0
 * @immutable
 */

import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_LEGAL_NAME,
  BRAND_COLORS,
  BRAND_CONTACT,
  BRAND_SOCIAL,
  BRAND_LEGAL,
  getCopyright,
} from '@/config/brand';
import { formatCurrency } from '../brand-helpers';

// =============================================================================
// BASE EMAIL TEMPLATE
// =============================================================================

/**
 * Base email template wrapper
 * @param content - Email body content (HTML)
 * @param subject - Email subject
 * @returns Complete HTML email
 */
function baseEmailTemplate(content: string, subject: string): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .email-container { width: 600px; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-logo {
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      margin: 0;
      text-decoration: none;
    }
    .email-tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 8px 0 0 0;
    }
    .email-content {
      padding: 40px 30px;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .email-footer-text {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
    .email-footer-link {
      color: ${BRAND_COLORS.primary};
      text-decoration: none;
    }
    .btn-primary {
      display: inline-block;
      background-color: ${BRAND_COLORS.primary};
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .btn-primary:hover {
      background-color: ${BRAND_COLORS.primaryDark};
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .email-content {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1 class="email-logo">${BRAND_NAME}</h1>
      <p class="email-tagline">${BRAND_TAGLINE}</p>
    </div>

    <!-- Content -->
    <div class="email-content">
      ${content}
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p class="email-footer-text">${getCopyright(currentYear)}</p>
      <p class="email-footer-text" style="margin: 8px 0 0 0;">
        This email was sent by <strong>${BRAND_LEGAL_NAME}</strong>.<br>
        Questions? Contact us at <a href="mailto:${BRAND_CONTACT.supportEmail}" class="email-footer-link">${BRAND_CONTACT.supportEmail}</a>
      </p>
      <div style="margin-top: 20px;">
        <a href="${BRAND_SOCIAL.facebook}" style="margin: 0 10px; color: #6b7280; text-decoration: none;">Facebook</a>
        <a href="${BRAND_SOCIAL.twitter}" style="margin: 0 10px; color: #6b7280; text-decoration: none;">Twitter</a>
        <a href="${BRAND_SOCIAL.instagram}" style="margin: 0 10px; color: #6b7280; text-decoration: none;">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// =============================================================================
// WELCOME EMAIL
// =============================================================================

/**
 * Welcome email for new users
 * @param userName - User's name
 * @returns HTML email content
 */
export function welcomeEmail(userName: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Welcome to ${BRAND_NAME}!</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Welcome to <strong>${BRAND_NAME}</strong>! We're thrilled to have you join our community of shoppers.
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      ${BRAND_TAGLINE}. Start exploring amazing products from our trusted vendors today!
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BRAND_CONTACT.website}/products" class="btn-primary">
        Start Shopping
      </a>
    </div>
    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  `;

  return baseEmailTemplate(content, `Welcome to ${BRAND_NAME}!`);
}

// =============================================================================
// ORDER CONFIRMATION EMAIL
// =============================================================================

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
}

/**
 * Order confirmation email
 * @param orderDetails - Order information
 * @returns HTML email content
 */
export function orderConfirmationEmail(orderDetails: OrderDetails): string {
  const { orderNumber, customerName, items, subtotal, shipping, tax, total, shippingAddress } = orderDetails;

  const itemsRows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 16px; color: #374151;">
        ${item.name}<br>
        <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
      </td>
      <td style="padding: 16px; text-align: right; color: #374151; font-weight: 600;">
        ${formatCurrency(item.price)}
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Order Confirmed! 🎉</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Hi ${customerName},
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Great news! Your order <strong>#${orderNumber}</strong> has been confirmed and is being processed.
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Thank you for shopping at <strong>${BRAND_NAME}</strong>. We'll notify you when your order ships.
    </p>

    <!-- Order Summary -->
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Order Summary</h3>
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
        <strong>Order Number:</strong> ${orderNumber}
      </p>
      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
        <strong>Shipping Address:</strong><br>${shippingAddress.replace(/\n/g, '<br>')}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
        ${itemsRows}
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; color: #6b7280;">Subtotal</td>
          <td style="padding: 16px; text-align: right; color: #6b7280;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; color: #6b7280;">Shipping</td>
          <td style="padding: 16px; text-align: right; color: #6b7280;">${formatCurrency(shipping)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; color: #6b7280;">Tax</td>
          <td style="padding: 16px; text-align: right; color: #6b7280;">${formatCurrency(tax)}</td>
        </tr>
        <tr style="border-top: 2px solid ${BRAND_COLORS.primary};">
          <td style="padding: 16px; color: #111827; font-weight: 600; font-size: 18px;">Total</td>
          <td style="padding: 16px; text-align: right; color: ${BRAND_COLORS.primary}; font-weight: 600; font-size: 18px;">
            ${formatCurrency(total)}
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${BRAND_CONTACT.website}/orders" class="btn-primary">
        Track Your Order
      </a>
    </div>

    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Questions? Contact our <a href="${BRAND_CONTACT.website}/contact" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">support team</a>.
    </p>
  `;

  return baseEmailTemplate(content, `Order Confirmed - ${BRAND_NAME} - #${orderNumber}`);
}

// =============================================================================
// VENDOR WELCOME EMAIL
// =============================================================================

/**
 * Vendor welcome email after approval
 * @param vendorData - Vendor information
 * @returns HTML email content
 */
export function vendorWelcomeEmail(vendorData: {
  businessName: string;
  contactName: string;
}): string {
  const { businessName, contactName } = vendorData;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Welcome to ${BRAND_NAME} for Vendors! 🎉</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Dear ${contactName},
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Congratulations! Your vendor application for <strong>${businessName}</strong> has been approved on <strong>${BRAND_NAME}</strong>.
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      You can now access your vendor dashboard and start listing your products. Here's what you can do:
    </p>

    <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #6b7280; font-size: 16px; line-height: 1.8;">
      <li>Add and manage your products</li>
      <li>Track orders and shipments</li>
      <li>View sales analytics and reports</li>
      <li>Manage your inventory</li>
    </ul>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${BRAND_CONTACT.website}/vendor/dashboard" class="btn-primary">
        Go to Vendor Dashboard
      </a>
    </div>

    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      If you need any help, check out our <a href="${BRAND_CONTACT.website}/vendor/help" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">Vendor Guide</a> or contact support.
    </p>
  `;

  return baseEmailTemplate(content, `Vendor Account Approved - ${BRAND_NAME}`);
}

// =============================================================================
// PASSWORD RESET EMAIL
// =============================================================================

/**
 * Password reset email
 * @param resetUrl - Password reset URL
 * @returns HTML email content
 */
export function passwordResetEmail(resetUrl: string): string {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Reset Your Password</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password for your <strong>${BRAND_NAME}</strong> account.
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Click the button below to create a new password. This link is valid for 1 hour.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn-primary">
        Reset Password
      </a>
    </div>

    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
    </p>
    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      For security, this link will expire in 1 hour.
    </p>
  `;

  return baseEmailTemplate(content, `Reset Your Password - ${BRAND_NAME}`);
}

// =============================================================================
// ORDER SHIPPED EMAIL
// =============================================================================

interface ShipmentDetails {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

/**
 * Order shipped notification email
 * @param shipmentDetails - Shipment information
 * @returns HTML email content
 */
export function orderShippedEmail(shipmentDetails: ShipmentDetails): string {
  const { orderNumber, customerName, trackingNumber, carrier, estimatedDelivery } = shipmentDetails;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #111827;">Your Order Has Shipped! 🚚</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Hi ${customerName},
    </p>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to you.
    </p>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 32px 0;">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Shipment Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Carrier</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${carrier}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tracking Number</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${trackingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Estimated Delivery</td>
          <td style="padding: 8px 0; color: ${BRAND_COLORS.primary}; font-size: 14px; font-weight: 600;">${estimatedDelivery}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${BRAND_CONTACT.website}/orders" class="btn-primary">
        Track Your Order
      </a>
    </div>

    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Thank you for shopping at <strong>${BRAND_NAME}</strong>!
    </p>
  `;

  return baseEmailTemplate(content, `Order Shipped - ${BRAND_NAME} - #${orderNumber}`);
}

// =============================================================================
// VENDOR APPROVED EMAIL
// =============================================================================

/**
 * Vendor account approved email
 * @param vendorData - Vendor information
 * @returns HTML email content
 */
export function vendorApprovedEmail(vendorData: {
  businessName: string;
  contactName: string;
}): string {
  return vendorWelcomeEmail(vendorData);
}

// =============================================================================
// ADMIN BRAND ENFORCEMENT EMAIL (WARNING)
// =============================================================================

/**
 * Internal email for brand violation warnings
 * @param violationDetails - Details of the violation
 * @returns HTML email content
 */
export function brandViolationEmail(violationDetails: {
  violationType: string;
  description: string;
  userId: string;
  timestamp: string;
}): string {
  const { violationType, description, userId, timestamp } = violationDetails;

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #dc2626;">⚠️ Brand Violation Detected</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
      A potential violation of <strong>${BRAND_NAME}</strong> brand guidelines has been detected.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; padding: 16px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #991b1b;">Violation Details</h3>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Type</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${violationType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">User ID</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${userId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Timestamp</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">${timestamp}</td>
        </tr>
      </table>
      <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Description:</strong> ${description}</p>
    </div>

    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Please review this violation and take appropriate action if necessary.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${BRAND_CONTACT.website}/admin/violations" class="btn-primary">
        Review Violation
      </a>
    </div>
  `;

  return baseEmailTemplate(content, `Brand Violation Alert - ${BRAND_NAME}`);
}

// =============================================================================
// EXPORT ALL TEMPLATES
// =============================================================================

export const EmailTemplates = {
  welcome: welcomeEmail,
  orderConfirmation: orderConfirmationEmail,
  vendorWelcome: vendorWelcomeEmail,
  vendorApproved: vendorApprovedEmail,
  passwordReset: passwordResetEmail,
  orderShipped: orderShippedEmail,
  brandViolation: brandViolationEmail,
} as const;

export default EmailTemplates;
