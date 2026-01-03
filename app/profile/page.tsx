import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const orderCount = await prisma.order.count({
    where: { userId: user.id },
  });

  const reviewCount = await prisma.review.count({
    where: { userId: user.id },
  });

  const wishlistCount = await prisma.wishlistItem.count({
    where: { userId: user.id },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{orderCount}</p>
              <p className="text-gray-600">Orders</p>
            </div>
          </Link>
          <Link
            href="/wishlist"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{wishlistCount}</p>
              <p className="text-gray-600">Wishlist Items</p>
            </div>
          </Link>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{reviewCount}</p>
              <p className="text-gray-600">Reviews</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Account Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>
            <div className="p-6">
              <ProfileForm user={user} />
            </div>
          </div>
        </div>

        {/* Recent Orders Preview */}
        {orderCount > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link
                href="/orders"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                You have {orderCount} {orderCount === 1 ? 'order' : 'orders'} in your history.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
