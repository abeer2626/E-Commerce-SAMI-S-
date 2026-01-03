import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Get vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs', vendor.id);
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/\s/g, '_')}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      // Store file path relative to public
      const publicUrl = `/uploads/payment-proofs/${vendor.id}/${filename}`;

      uploadedFiles.push({
        url: publicUrl,
        date: new Date().toISOString(),
        status: 'PENDING',
      });
    }

    // Update vendor with new payment proofs
    const existingProofs = vendor.paymentProofs ? JSON.parse(vendor.paymentProofs) : [];
    const updatedProofs = [...existingProofs, ...uploadedFiles];

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        paymentProofs: JSON.stringify(updatedProofs),
      },
    });

    return NextResponse.json({
      success: true,
      proofs: uploadedFiles,
      total: updatedProofs.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { paymentProofs: true, badges: true, trustScore: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  return NextResponse.json({
    proofs: vendor.paymentProofs ? JSON.parse(vendor.paymentProofs) : [],
    badges: vendor.badges ? JSON.parse(vendor.badges) : [],
    trustScore: vendor.trustScore,
  });
}
