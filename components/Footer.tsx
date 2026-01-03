'use client';

import Link from 'next/link';
import { Package, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_LEGAL, BRAND_CONTACT, BRAND_SOCIAL, getCopyright } from '@/config/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: '/products', label: 'All Products' },
      { href: '/products?category=Electronics', label: 'Electronics' },
      { href: '/products?category=Fashion', label: 'Fashion' },
      { href: '/products?category=Accessories', label: 'Accessories' },
      { href: '/products?featured=true', label: 'Featured' },
    ],
    support: [
      { href: '/orders', label: 'Track Order' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: BRAND_LEGAL.refundPath, label: 'Refunds' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/help', label: 'Help Center' },
    ],
    company: [
      { href: '/about', label: 'About {BRAND_NAME}' },
      { href: '/careers', label: 'Careers' },
      { href: '/vendors', label: 'Become a Vendor' },
      { href: BRAND_LEGAL.privacyPath, label: 'Privacy Policy' },
      { href: BRAND_LEGAL.termsPath, label: 'Terms of Service' },
    ],
  };

  // Replace {BRAND_NAME} placeholder with actual brand name
  const processedLinks = {
    ...footerLinks,
    company: footerLinks.company.map(link => ({
      ...link,
      label: link.label.replace('{BRAND_NAME}', BRAND_NAME),
    })),
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Brand Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[200px] font-bold text-white opacity-[0.02] select-none">
          {BRAND_NAME}
        </span>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="text-xl font-bold text-white">{BRAND_NAME}</h3>
                <p className="text-xs text-gray-400">{BRAND_TAGLINE}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {BRAND_NAME} is your premium destination for quality products from trusted vendors.
              Shop the latest trends with confidence and convenience.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href={BRAND_SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={`${BRAND_NAME} on Facebook`}
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={BRAND_SOCIAL.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={`${BRAND_NAME} on Twitter`}
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={BRAND_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={`${BRAND_NAME} on Instagram`}
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={BRAND_SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={`${BRAND_NAME} on LinkedIn`}
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={`${BRAND_NAME} on WhatsApp`}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {processedLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {processedLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {processedLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a
                  href={`mailto:${BRAND_CONTACT.supportEmail}`}
                  className="text-sm text-gray-300 hover:text-orange-500 transition-colors"
                >
                  {BRAND_CONTACT.supportEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <a
                  href={`tel:${BRAND_CONTACT.supportPhone}`}
                  className="text-sm text-gray-300 hover:text-orange-500 transition-colors"
                >
                  {BRAND_CONTACT.supportPhone}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-300">
                  123 Commerce Street, Business City
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 flex items-center justify-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-2 text-sm">
            <span>We accept:</span>
            <span className="font-semibold">Visa</span>
            <span className="font-semibold">Mastercard</span>
            <span className="font-semibold">PayPal</span>
            <span className="font-semibold">Stripe</span>
            <span className="font-semibold">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            {/* Copyright - IMMUTABLE */}
            <p className="text-sm text-gray-500">
              {getCopyright(currentYear)}
            </p>

            {/* Brand Badge */}
            <div className="flex items-center space-x-2 text-gray-500">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">{BRAND_NAME}</span>
              <span className="text-gray-700">•</span>
              <span className="text-xs">Premium Marketplace</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4 text-sm">
              <Link
                href={BRAND_LEGAL.privacyPath}
                className="text-gray-500 hover:text-orange-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href={BRAND_LEGAL.termsPath}
                className="text-gray-500 hover:text-orange-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href={BRAND_LEGAL.refundPath}
                className="text-gray-500 hover:text-orange-500 transition-colors"
              >
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
