/**
 * SAMI'S - Central Brand Configuration
 *
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for all branding across the platform.
 * All components, pages, emails, and backend systems MUST import from this file.
 *
 * ⚠️ CRITICAL: The brand name "SAMI'S" is PERMANENT and IMMUTABLE.
 * No admin setting, API, or configuration should allow changing this.
 *
 * @version 1.0.0
 * @immutable
 */

// =============================================================================
// BRAND IDENTITY - IMMUTABLE
// =============================================================================

/**
 * Core brand name - NEVER change this value
 * This is enforced across the entire platform
 */
export const BRAND_NAME = 'SAMI\'S' as const;

/**
 * Full legal business name
 */
export const BRAND_LEGAL_NAME = 'SAMI\'S Marketplace' as const;

/**
 * Brand tagline
 */
export const BRAND_TAGLINE = 'Your Premium Shopping Destination' as const;

// =============================================================================
// BRAND ASSETS
// =============================================================================

/**
 * Logo configuration
 */
export const BRAND_LOGO = {
  /**
   * Main logo path
   */
  path: '/logo.svg',

  /**
   * Logo text version (used when image is unavailable)
   */
  text: BRAND_NAME,

  /**
   * Logo dimensions
   */
  width: 150,
  height: 50,

  /**
   * Alt text for accessibility
   */
  alt: `${BRAND_NAME} Logo`,
} as const;

/**
 * Favicon configuration
 */
export const BRAND_FAVICON = '/favicon.ico' as const;

/**
 * Watermark configuration
 */
export const BRAND_WATERMARK = {
  text: BRAND_NAME,
  opacity: 0.05,
  fontSize: '48px',
  fontWeight: 'bold' as const,
} as const;

// =============================================================================
// BRAND COLORS
// =============================================================================

/**
 * Primary brand colors
 */
export const BRAND_COLORS = {
  /**
   * Primary brand color - main call-to-action buttons, links, highlights
   */
  primary: '#FF6B35' as const,

  /**
   * Primary dark variant - hover states, active elements
   */
  primaryDark: '#E85A24' as const,

  /**
   * Primary light variant - backgrounds, subtle highlights
   */
  primaryLight: '#FFF0EB' as const,

  /**
   * Secondary brand color - accents, complementary elements
   */
  secondary: '#2D3436' as const,

  /**
   * Accent color - special offers, featured items
   */
  accent: '#00B894' as const,

  /**
   * Neutral grays - text, borders, backgrounds
   */
  gray: {
    50: '#F9FAFB' as const,
    100: '#F3F4F6' as const,
    200: '#E5E7EB' as const,
    300: '#D1D5DB' as const,
    400: '#9CA3AF' as const,
    500: '#6B7280' as const,
    600: '#4B5563' as const,
    700: '#374151' as const,
    800: '#1F2937' as const,
    900: '#111827' as const,
  },
} as const;

// =============================================================================
// BRAND TYPOGRAPHY
// =============================================================================

/**
 * Font family configuration
 */
export const BRAND_FONTS = {
  /**
   * Primary font family - headings, displays
   */
  heading: 'Inter, system-ui, -apple-system, sans-serif' as const,

  /**
   * Body font family - paragraphs, body text
   */
  body: 'Inter, system-ui, -apple-system, sans-serif' as const,

  /**
   * Monospace font family - code, technical content
   */
  mono: 'Courier New, monospace' as const,
} as const;

// =============================================================================
// BRAND CONTACT INFO
// =============================================================================

/**
 * Official contact information
 */
export const BRAND_CONTACT = {
  /**
   * Customer support email
   */
  supportEmail: 'support@samis.com' as const,

  /**
   * General inquiries email
   */
  generalEmail: 'info@samis.com' as const,

  /**
   * Customer support phone
   */
  supportPhone: '+1 (555) SAMI-HELP' as const,

  /**
   * Official website URL
   */
  website: 'https://samis.com' as const,
} as const;

// =============================================================================
// BRAND SOCIAL MEDIA
// =============================================================================

/**
 * Social media profiles
 */
export const BRAND_SOCIAL = {
  facebook: 'https://facebook.com/samis' as const,
  twitter: 'https://twitter.com/samis' as const,
  instagram: 'https://instagram.com/samis' as const,
  linkedin: 'https://linkedin.com/company/samis' as const,
} as const;

// =============================================================================
// BRAND LEGAL
// =============================================================================

/**
 * Legal and compliance information
 */
export const BRAND_LEGAL = {
  /**
   * Copyright notice template
   * @param year - The copyright year (defaults to current year)
   */
  copyright: (year: number = new Date().getFullYear()): string => {
    return `© ${year} ${BRAND_NAME} – All Rights Reserved`;
  },

  /**
   * Terms of service path
   */
  termsPath: '/terms' as const,

  /**
   * Privacy policy path
   */
  privacyPath: '/privacy' as const,

  /**
   * Refund policy path
   */
  refundPath: '/refund-policy' as const,
} as const;

// =============================================================================
// BRAND SEO & METADATA
// =============================================================================

/**
 * Default SEO configuration
 */
export const BRAND_SEO = {
  /**
   * Default title template
   * @param pageTitle - The specific page title
   */
  titleTemplate: (pageTitle: string): string => {
    return `${pageTitle} | ${BRAND_NAME}`;
  },

  /**
   * Default meta description
   */
  defaultDescription: `Shop at ${BRAND_NAME} - ${BRAND_TAGLINE}. Discover amazing products from trusted vendors.`,

  /**
   * Default keywords
   */
  defaultKeywords: [
    BRAND_NAME,
    'online shopping',
    'e-commerce',
    'marketplace',
    'buy online',
    'trusted vendors',
  ],

  /**
   * OpenGraph default configuration
   */
  openGraph: {
    siteName: BRAND_NAME,
    type: 'website' as const,
    locale: 'en_US' as const,
  },

  /**
   * Twitter card configuration
   */
  twitterCard: {
    card: 'summary_large_image' as const,
    site: `@${BRAND_NAME.toLowerCase()}` as const,
  },
} as const;

// =============================================================================
// BRAND EMAILS & NOTIFICATIONS
// =============================================================================

/**
 * Email branding configuration
 */
export const BRAND_EMAIL = {
  /**
   * Sender name (appears in "From" field)
   */
  senderName: BRAND_NAME,

  /**
   * Sender email address
   */
  senderEmail: `noreply@samis.com`,

  /**
   * Support email (for replies)
   */
  supportEmail: BRAND_CONTACT.supportEmail,

  /**
   * Email footer text
   */
  footer: `
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        ${BRAND_LEGAL.copyright()}
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
        This email was sent by ${BRAND_NAME}. Visit us at ${BRAND_CONTACT.website}
      </p>
    </div>
  `,

  /**
   * Email header logo HTML
   */
  headerLogo: `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: ${BRAND_COLORS.primary}; font-size: 32px; font-weight: bold; margin: 0;">
        ${BRAND_NAME}
      </h1>
      <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
        ${BRAND_TAGLINE}
      </p>
    </div>
  `,
} as const;

// =============================================================================
// BRAND INVOICE & DOCUMENTS
// =============================================================================

/**
 * Invoice and document branding
 */
export const BRAND_INVOICE = {
  /**
   * Invoice header text
   */
  header: `${BRAND_NAME} - Invoice`,

  /**
   * Invoice watermark
   */
  watermark: BRAND_WATERMARK,

  /**
   * Company information for invoices
   */
  companyInfo: {
    name: BRAND_LEGAL_NAME,
    address: '123 Commerce Street, Business City, BC 12345',
    phone: BRAND_CONTACT.supportPhone,
    email: BRAND_CONTACT.supportEmail,
    website: BRAND_CONTACT.website,
  },

  /**
   * Invoice footer text
   */
  footer: `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid ${BRAND_COLORS.primary}; text-align: center;">
      <p style="color: ${BRAND_COLORS.gray[600]}; font-size: 14px; margin: 0;">
        Thank you for shopping at ${BRAND_NAME}!
      </p>
      <p style="color: ${BRAND_COLORS.gray[500]}; font-size: 12px; margin: 8px 0 0 0;">
        ${BRAND_LEGAL.copyright()}
      </p>
    </div>
  `,
} as const;

// =============================================================================
// IMMUTABLE BRAND EXPORT (READ-ONLY)
// =============================================================================

/**
 * Complete immutable brand configuration
 * Exported as a const object - cannot be modified at runtime
 */
export const BRAND = {
  name: BRAND_NAME,
  legalName: BRAND_LEGAL_NAME,
  tagline: BRAND_TAGLINE,
  logo: BRAND_LOGO,
  favicon: BRAND_FAVICON,
  watermark: BRAND_WATERMARK,
  colors: BRAND_COLORS,
  fonts: BRAND_FONTS,
  contact: BRAND_CONTACT,
  social: BRAND_SOCIAL,
  legal: BRAND_LEGAL,
  seo: BRAND_SEO,
  email: BRAND_EMAIL,
  invoice: BRAND_INVOICE,
} as const;

/**
 * Type definition for brand configuration (read-only)
 */
export type BrandConfig = Readonly<typeof BRAND>;

/**
 * Freeze check - ensures brand cannot be modified
 * @internal
 */
if (process.env.NODE_ENV === 'development') {
  Object.freeze(BRAND);
  Object.freeze(BRAND.colors);
  Object.freeze(BRAND.colors.gray);
  Object.freeze(BRAND.contact);
  Object.freeze(BRAND.social);
  Object.freeze(BRAND.legal);
  Object.freeze(BRAND.seo);
  Object.freeze(BRAND.email);
  Object.freeze(BRAND.invoice);
  Object.freeze(BRAND.logo);
  Object.freeze(BRAND.watermark);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get formatted page title with brand suffix
 * @param pageTitle - The page title
 * @returns Full title string with brand
 */
export function getPageTitle(pageTitle: string): string {
  return BRAND_SEO.titleTemplate(pageTitle);
}

/**
 * Get copyright notice with current year
 * @param year - Optional custom year
 * @returns Copyright notice string
 */
export function getCopyright(year?: number): string {
  return BRAND_LEGAL.copyright(year);
}

/**
 * Get email sender information
 * @returns Sender name and email
 */
export function getEmailSender(): { name: string; email: string } {
  return {
    name: BRAND_EMAIL.senderName,
    email: BRAND_EMAIL.senderEmail,
  };
}

/**
 * Get company info for invoices/documents
 * @returns Company information object
 */
export function getCompanyInfo(): typeof BRAND_INVOICE.companyInfo {
  return BRAND_INVOICE.companyInfo;
}

/**
 * Validate that a string matches the brand name (for security checks)
 * @param name - Name to validate
 * @returns True if name matches brand name
 */
export function isValidBrandName(name: string): boolean {
  return name === BRAND_NAME;
}

/**
 * Get brand watermark URL (for use in images/PDFs)
 * @returns Watermark configuration
 */
export function getWatermarkConfig(): typeof BRAND_WATERMARK {
  return BRAND_WATERMARK;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default BRAND;
