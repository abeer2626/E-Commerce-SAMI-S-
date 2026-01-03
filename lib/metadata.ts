/**
 * SAMI'S - Centralized Metadata Configuration
 *
 * This file provides consistent metadata generation for all pages.
 * All page metadata should be generated using these utilities.
 *
 * @version 1.0.0
 */

import { BRAND_NAME, BRAND_TAGLINE, BRAND_LEGAL_NAME, BRAND_CONTACT, getCopyright } from '@/config/brand';

// =============================================================================
// DEFAULT METADATA
// =============================================================================

/**
 * Default site metadata
 */
export const siteMetadata = {
  title: {
    default: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `Shop at ${BRAND_NAME} - ${BRAND_TAGLINE}. Discover amazing products from trusted vendors worldwide.`,
  keywords: [
    BRAND_NAME,
    'online shopping',
    'e-commerce',
    'marketplace',
    'buy online',
    'trusted vendors',
    'quality products',
    'secure shopping',
  ],
  authors: [{ name: BRAND_LEGAL_NAME }],
  creator: BRAND_LEGAL_NAME,
  publisher: BRAND_LEGAL_NAME,

  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BRAND_CONTACT.website,
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    description: `Shop at ${BRAND_NAME} - ${BRAND_TAGLINE}`,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    description: `Shop at ${BRAND_NAME} - ${BRAND_TAGLINE}`,
    images: ['/og-image.png'],
    creator: `@${BRAND_NAME.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },

  // Icons
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Other
  metadataBase: new URL(BRAND_CONTACT.website),
  alternates: {
    canonical: BRAND_CONTACT.website,
  },
};

// =============================================================================
// PAGE-SPECIFIC METADATA TEMPLATES
// =============================================================================

/**
 * Generate metadata for a specific page
 * @param pageConfig - Page configuration
 * @returns Metadata object for Next.js
 */
export function generatePageMetadata(pageConfig: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}) {
  const {
    title,
    description = `Shop at ${BRAND_NAME} - ${title}. ${BRAND_TAGLINE}.`,
    path,
    image,
    keywords = [],
    noIndex = false,
  } = pageConfig;

  const fullTitle = `${title} | ${BRAND_NAME}`;
  const url = path ? `${BRAND_CONTACT.website}${path}` : BRAND_CONTACT.website;

  return {
    title: fullTitle,
    description,
    keywords: [BRAND_NAME, ...keywords],
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: fullTitle,
            },
          ]
        : siteMetadata.openGraph.images,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : siteMetadata.twitter.images,
    },
    alternates: {
      canonical: url,
    },
  };
}

// =============================================================================
// PRE-DEFINED PAGE METADATA
// =============================================================================

/**
 * Homepage metadata
 */
export const homePageMetadata = generatePageMetadata({
  title: 'Home',
  description: `Welcome to ${BRAND_NAME} - ${BRAND_TAGLINE}. Explore our curated collection of premium products from trusted vendors worldwide.`,
  path: '/',
  keywords: ['homepage', 'home', 'shop online'],
});

/**
 * Products page metadata
 */
export const productsPageMetadata = generatePageMetadata({
  title: 'Products',
  description: `Browse our extensive collection of products at ${BRAND_NAME}. Find electronics, fashion, accessories, and more from verified vendors.`,
  path: '/products',
  keywords: ['products', 'catalog', 'shop', 'browse'],
});

/**
 * Product detail page metadata generator
 * @param productName - Product name
 * @param productDescription - Product description
 * @param productImage - Product image URL
 */
export function productPageMetadata(productName: string, productDescription?: string, productImage?: string) {
  return generatePageMetadata({
    title: productName,
    description: productDescription || `Shop ${productName} at ${BRAND_NAME}. ${BRAND_TAGLINE}.`,
    keywords: [productName, 'product', 'buy online'],
    image: productImage,
  });
}

/**
 * Checkout page metadata
 */
export const checkoutPageMetadata = generatePageMetadata({
  title: 'Checkout',
  description: `Complete your purchase at ${BRAND_NAME}. Secure checkout with multiple payment options including COD, advance payment, and online payment.`,
  path: '/checkout',
  keywords: ['checkout', 'payment', 'buy', 'cart'],
  noIndex: true,
});

/**
 * Sign in page metadata
 */
export const signInPageMetadata = generatePageMetadata({
  title: 'Sign In',
  description: `Sign in to your ${BRAND_NAME} account to access your orders, wishlist, and more.`,
  path: '/auth/signin',
  keywords: ['signin', 'login', 'account'],
  noIndex: true,
});

/**
 * Sign up page metadata
 */
export const signUpPageMetadata = generatePageMetadata({
  title: 'Create Account',
  description: `Join ${BRAND_NAME} today and start shopping from the best vendors. Create your account in seconds.`,
  path: '/auth/signup',
  keywords: ['signup', 'register', 'create account'],
  noIndex: true,
});

/**
 * Vendor dashboard metadata
 */
export const vendorDashboardMetadata = generatePageMetadata({
  title: 'Vendor Dashboard',
  description: `Manage your products and orders on ${BRAND_NAME}. Access analytics, update inventory, and grow your business.`,
  path: '/vendor/dashboard',
  keywords: ['vendor', 'seller', 'dashboard', 'manage products'],
  noIndex: true,
});

/**
 * Admin dashboard metadata
 */
export const adminDashboardMetadata = generatePageMetadata({
  title: 'Admin Dashboard',
  description: `Administrative control panel for ${BRAND_NAME}. Manage users, vendors, orders, and platform settings.`,
  path: '/admin/dashboard',
  keywords: ['admin', 'administration', 'management'],
  noIndex: true,
});

/**
 * Wishlist page metadata
 */
export const wishlistPageMetadata = generatePageMetadata({
  title: 'My Wishlist',
  description: `View your saved items at ${BRAND_NAME}. Keep track of products you love and want to buy later.`,
  path: '/wishlist',
  keywords: ['wishlist', 'saved items', 'favorites'],
});

/**
 * Orders page metadata
 */
export const ordersPageMetadata = generatePageMetadata({
  title: 'My Orders',
  description: `Track your orders from ${BRAND_NAME}. View order status, history, and details.`,
  path: '/orders',
  keywords: ['orders', 'order history', 'track order'],
});

/**
 * Profile page metadata
 */
export const profilePageMetadata = generatePageMetadata({
  title: 'My Profile',
  description: `Manage your ${BRAND_NAME} account settings, addresses, and preferences.`,
  path: '/profile',
  keywords: ['profile', 'account', 'settings'],
  noIndex: true,
});

// =============================================================================
// EXPORTS
// =============================================================================

// Export for root layout
export const metadata = siteMetadata;
