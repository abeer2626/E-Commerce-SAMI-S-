import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendVendorAlert } from '@/lib/whatsapp';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { businessName, description } = await request.json();

  // Check if user already has a vendor profile
  const existingVendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (existingVendor) {
    return NextResponse.json(
      { error: 'You already have a vendor profile' },
      { status: 400 }
    );
  }

  // Update user role to VENDOR
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: 'VENDOR' },
  });

  // Create vendor profile
  const vendor = await prisma.vendor.create({
    data: {
      userId: session.user.id,
      businessName,
      description,
      isApproved: false, // Requires admin approval
    },
  });

  // Send WhatsApp alert to admin for new vendor application
  try {
    await sendVendorAlert({
      businessName,
      ownerName: session.user.name || 'Vendor',
      email: session.user.email || 'N/A',
      description: description || 'No description',
    });
  } catch (whatsappError) {
    // Log error but don't fail the vendor creation
    console.error('WhatsApp vendor alert failed:', whatsappError);
  }

  return NextResponse.json({
    vendor,
    message: 'Vendor application submitted successfully',
  });
}
