/**
 * SAMI'S - Brand Helper Utilities
 *
 * Utility functions for consistent brand usage across the platform.
 * All helpers import from the central brand configuration.
 *
 * @version 1.0.0
 * @immutable
 */

import {
  BRAND,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_LEGAL_NAME,
  BRAND_LOGO,
  BRAND_COLORS,
  BRAND_CONTACT,
  BRAND_LEGAL,
  BRAND_SEO,
  BRAND_EMAIL,
  BRAND_INVOICE,
  getCopyright,
  getPageTitle,
  getEmailSender,
  getCompanyInfo,
  getWatermarkConfig,
  isValidBrandName,
  type BrandConfig,
} from '@/config/brand';

// =============================================================================
// REACT/FRONTEND HELPERS
// =============================================================================

/**
 * Generate complete page metadata for Next.js pages
 * @param pageTitle - The page title
 * @param description - Optional custom description
 * @param imageUrl - Optional custom image for OpenGraph
 * @returns Metadata object for Next.js
 */
export function generatePageMetadata({
  pageTitle,
  description,
  imageUrl,
  path,
}: {
  pageTitle: string;
  description?: string;
  imageUrl?: string;
  path?: string;
}) {
  const fullTitle = getPageTitle(pageTitle);
  const metaDescription = description || BRAND_SEO.defaultDescription;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [...BRAND_SEO.defaultKeywords, pageTitle],
    openGraph: {
      type: 'website' as const,
      locale: BRAND_SEO.openGraph.locale,
      url: path ? `${BRAND_CONTACT.website}${path}` : BRAND_CONTACT.website,
      title: fullTitle,
      description: metaDescription,
      siteName: BRAND_SEO.openGraph.siteName,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} - ${pageTitle}`,
        },
      ] : [],
    },
    twitter: {
      card: BRAND_SEO.twitterCard.card,
      site: BRAND_SEO.twitterCard.site,
      title: fullTitle,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/**
 * Get structured data for SEO (JSON-LD)
 * @param type - Schema type (Organization, WebSite, etc.)
 * @param data - Additional data for the schema
 * @returns JSON-LD structured data object
 */
export function getStructuredData(
  type: 'Organization' | 'WebSite' | 'Product',
  data?: Record<string, any>
): Record<string, any> {
  const baseUrl = BRAND_CONTACT.website;

  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  if (type === 'Organization') {
    return {
      ...baseData,
      name: BRAND_LEGAL_NAME,
      alternateName: BRAND_NAME,
      url: baseUrl,
      logo: `${baseUrl}${BRAND_LOGO.path}`,
      description: BRAND_TAGLINE,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: BRAND_CONTACT.supportPhone,
        contactType: 'Customer Service',
        email: BRAND_CONTACT.supportEmail,
      },
      sameAs: Object.values(BRAND.social),
      ...data,
    };
  }

  if (type === 'WebSite') {
    return {
      ...baseData,
      name: BRAND_NAME,
      url: baseUrl,
      description: BRAND_TAGLINE,
      publisher: {
        '@type': 'Organization',
        name: BRAND_LEGAL_NAME,
        logo: `${baseUrl}${BRAND_LOGO.path}`,
      },
      ...data,
    };
  }

  if (type === 'Product') {
    return {
      ...baseData,
      brand: {
        '@type': 'Brand',
        name: BRAND_NAME,
      },
      ...data,
    };
  }

  return baseData;
}

/**
 * Get brand CSS classes for styling
 * @returns Object with brand-related CSS classes
 */
export function getBrandClasses() {
  return {
    primary: 'text-primary-600',
    primaryBg: 'bg-primary-600',
    primaryHover: 'hover:bg-primary-700',
    gradient: 'bg-gradient-to-r from-primary-600 to-primary-500',
    textGradient: 'bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent',
    border: 'border-primary-600',
    ring: 'ring-primary-500',
  };
}

/**
 * Get brand Tailwind color config (for dynamic styles)
 * @returns Object with brand color values
 */
export function getBrandTailwindColors() {
  return {
    primary: 'rgb(255, 107, 53)',
    primaryDark: 'rgb(232, 90, 36)',
    primaryLight: 'rgb(255, 240, 235)',
    secondary: 'rgb(45, 52, 54)',
    accent: 'rgb(0, 184, 148)',
  };
}

// =============================================================================
// BACKEND/SERVER-SIDE HELPERS
// =============================================================================

/**
 * Format order ID with brand prefix
 * @param orderId - The order ID
 * @returns Formatted order ID (e.g., SAMI-ORD-12345)
 */
export function formatOrderId(orderId: string): string {
  const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8);
  return `${BRAND_NAME.replace(/[^a-zA-Z]/g, '').toUpperCase()}-${cleanId}`;
}

/**
 * Generate invoice number with brand prefix
 * @param sequenceNumber - The sequence number
 * @returns Invoice number (e.g., INV-SAMI-001234)
 */
export function generateInvoiceNumber(sequenceNumber: number): string {
  const paddedNumber = String(sequenceNumber).padStart(6, '0');
  return `INV-${BRAND_NAME.replace(/[^a-zA-Z]/g, '').toUpperCase()}-${paddedNumber}`;
}

/**
 * Format currency with brand locale
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate order confirmation email HTML
 * @param orderData - Order information
 * @returns HTML email content
 */
export function generateOrderConfirmationEmail(orderData: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: string;
}): string {
  const itemsList = orderData.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; color: #374151;">${item.name}</td>
          <td style="padding: 12px; text-align: center; color: #6b7280;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right; color: #374151;">${formatCurrency(item.price)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${BRAND_NAME}</title>
        <style>
          body { font-family: ${BRAND.fonts.body}; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          ${BRAND_EMAIL.headerLogo}

          <div style="padding: 30px;">
            <h2 style="color: ${BRAND.colors.primary}; font-size: 24px; margin: 0 0 20px 0;">
              Order Confirmed!
            </h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Hi ${orderData.customerName},
            </p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Thank you for shopping at <strong>${BRAND_NAME}</strong>. Your order has been confirmed and is being processed.
            </p>

            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #374151; font-size: 18px; margin: 0 0 12px 0;">
                Order Details
              </h3>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Order Number:</strong> ${orderData.orderNumber}<br>
                <strong>Shipping Address:</strong><br>${orderData.shippingAddress.replace(/\n/g, '<br>')}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="background-color: ${BRAND.colors.primaryLight};">
                  <th style="padding: 12px; text-align: left; color: #374151;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #374151;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #374151;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid ${BRAND.colors.primary};">
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">
                    Total
                  </td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: ${BRAND.colors.primary}; font-size: 18px;">
                    ${formatCurrency(orderData.total)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              You can track your order status in your <a href="${BRAND_CONTACT.website}/orders" style="color: ${BRAND.colors.primary};">account</a>.
            </p>
          </div>

          ${BRAND_EMAIL.footer}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate vendor welcome email HTML
 * @param vendorData - Vendor information
 * @returns HTML email content
 */
export function generateVendorWelcomeEmail(vendorData: {
  businessName: string;
  contactName: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${BRAND_NAME}</title>
        <style>
          body { font-family: ${BRAND.fonts.body}; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          ${BRAND_EMAIL.headerLogo}

          <div style="padding: 30px;">
            <h2 style="color: ${BRAND.colors.primary}; font-size: 24px; margin: 0 0 20px 0;">
              Welcome to ${BRAND_NAME}!
            </h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Dear ${vendorData.contactName},
            </p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Congratulations! Your vendor application for <strong>${vendorData.businessName}</strong> has been approved on <strong>${BRAND_NAME}</strong>.
            </p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              You can now access your vendor dashboard and start listing your products. Log in to your account to get started.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${BRAND_CONTACT.website}/vendor/dashboard"
                 style="display: inline-block; background-color: ${BRAND.colors.primary}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Go to Vendor Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>

          ${BRAND_EMAIL.footer}
        </div>
      </body>
    </html>
  `;
}

// =============================================================================
// VALIDATION & SECURITY HELPERS
// =============================================================================

/**
 * Validate brand name in user input (prevents brand spoofing)
 * @param inputName - Name to validate
 * @returns Object with validation result
 */
export function validateBrandNameInput(inputName: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  // Check if trying to impersonate the brand
  const sanitizedName = inputName.trim().toLowerCase();
  const brandVariations = [
    BRAND_NAME.toLowerCase(),
    BRAND_LEGAL_NAME.toLowerCase(),
    'samis',
    'sami s',
    'sami-s',
  ];

  if (brandVariations.some((variation) => sanitizedName.includes(variation))) {
    return {
      isValid: false,
      error: 'This name is reserved and cannot be used.',
    };
  }

  return {
    isValid: true,
    sanitized: inputName.trim(),
  };
}

/**
 * Get immutable brand config (for type safety)
 * @returns Readonly brand configuration
 */
export function getBrandConfig(): Readonly<BrandConfig> {
  return BRAND;
}

/**
 * Check if a color value is a valid brand color
 * @param color - Color value to check
 * @returns True if color is part of brand palette
 */
export function isValidBrandColor(color: string): boolean {
  const allColors = Object.values(BRAND_COLORS.primary);
  const allGrayValues = Object.values(BRAND_COLORS.gray);

  return [...allColors, ...allGrayValues].includes(color as any);
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Brand utilities object
 */
export const BrandUtils = {
  // Frontend
  generatePageMetadata,
  getStructuredData,
  getBrandClasses,
  getBrandTailwindColors,

  // Backend
  formatOrderId,
  generateInvoiceNumber,
  formatCurrency,
  generateOrderConfirmationEmail,
  generateVendorWelcomeEmail,

  // Validation
  validateBrandNameInput,
  getBrandConfig,
  isValidBrandColor,
} as const;

export default BrandUtils;
