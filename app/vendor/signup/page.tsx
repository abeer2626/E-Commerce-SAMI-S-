import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import VendorSignupForm from '@/components/VendorSignupForm';

export default async function VendorSignupPage() {
  const session = await getServerSession(authOptions);

  // Check if user already has a vendor profile
  if (session?.user?.role === 'VENDOR') {
    const { prisma } = await import('@/lib/prisma');
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (vendor) {
      redirect('/vendor/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a Vendor
          </h1>
          <p className="text-gray-600">
            Start selling your products on StoreHub and reach thousands of customers
          </p>
        </div>

        {!session?.user ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Create an Account First
            </h2>
            <p className="text-gray-600 mb-6">
              You need to sign up for a customer account before becoming a vendor.
            </p>
            <a
              href="/auth/signup"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Sign Up Now
            </a>
          </div>
        ) : (
          <VendorSignupForm userId={session.user.id} />
        )}
      </main>
    </div>
  );
}
