'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Menu, Heart, Package, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cart from './Cart';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BRAND_NAME, BRAND_TAGLINE } from '@/config/brand';

interface HeaderProps {
  session?: any;
}

export default function Header({ session }: HeaderProps) {
  const { data: currentSession, update } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const router = useRouter();

  const userSession = currentSession || session;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { href: '/products', label: 'Products', show: true },
    { href: '/orders', label: 'Orders', show: !!userSession?.user },
    { href: '/vendor/dashboard', label: 'Vendor Dashboard', show: userSession?.user?.role === 'VENDOR' },
    { href: '/admin/dashboard', label: 'Admin Panel', show: userSession?.user?.role === 'ADMIN' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/50'
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Package className="h-8 w-8 text-primary-600" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-tight">
                  {BRAND_NAME}
                </span>
                <span className="text-xs text-gray-500 font-medium leading-none mt-0.5 hidden sm:block">
                  {BRAND_TAGLINE}
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${BRAND_NAME}...`}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) =>
                item.show ? (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-all font-medium"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ) : null
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (userSession?.user) {
                    router.push('/wishlist');
                  } else {
                    toast.error('Please sign in to view wishlist');
                  }
                }}
                className="relative p-2.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-full transition"
              >
                <Heart className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-full transition"
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {userSession?.user ? (
                <div className="hidden md:flex items-center space-x-2 ml-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{userSession.user.name}</span>
                    </Link>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="p-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2 ml-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/signin"
                      className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/auth/signup"
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition ml-1"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${BRAND_NAME}...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {navItems.map((item) =>
                  item.show ? (
                    <Link key={item.href} href={item.href}>
                      <motion.span
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition font-medium"
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  ) : null
                )}
                <Link href="/wishlist">
                  <motion.span
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition font-medium"
                  >
                    Wishlist
                  </motion.span>
                </Link>
                {userSession?.user ? (
                  <>
                    <Link href="/profile">
                      <motion.span
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition font-medium"
                      >
                        Profile
                      </motion.span>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <motion.span
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition font-medium"
                      >
                        Sign In
                      </motion.span>
                    </Link>
                    <Link href="/auth/signup">
                      <motion.span
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-primary-600 font-medium"
                      >
                        Create Account
                      </motion.span>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
