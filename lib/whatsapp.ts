/**
 * WhatsApp Notification Service
 * Sends alerts for important events via WhatsApp
 */

interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * Send order notification to admin via WhatsApp
 */
export async function sendOrderAlert(orderData: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentMethod: string;
}) {
  const adminPhone = process.env.ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  let message = `🔔 *NEW ORDER ALERT*\n\n`;
  message += `📦 Order: ${orderData.orderNumber}\n`;
  message += `👤 Customer: ${orderData.customerName}\n`;
  message += `💰 Total: $${orderData.total.toFixed(2)}\n`;
  message += `💳 Payment: ${orderData.paymentMethod}\n\n`;

  message += `📝 *Items:*\n`;
  orderData.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity} = $${(item.quantity * item.price).toFixed(2)}\n`;
  });

  message += `\n⏰ ${new Date().toLocaleString()}\n`;
  message += `🔗 Check: ${process.env.NEXT_PUBLIC_APP_URL}/admin/orders`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

  // In production, use WhatsApp Business API
  // For now, return the URL for manual testing
  return { success: true, url: whatsappUrl, message };
}

/**
 * Send vendor application alert to admin
 */
export async function sendVendorAlert(vendorData: {
  businessName: string;
  ownerName: string;
  email: string;
  description: string;
}) {
  const adminPhone = process.env.ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  let message = `🏪 *NEW VENDOR APPLICATION*\n\n`;
  message += `📢 Business: ${vendorData.businessName}\n`;
  message += `👤 Owner: ${vendorData.ownerName}\n`;
  message += `📧 Email: ${vendorData.email}\n`;
  message += `📝 Description: ${vendorData.description}\n\n`;

  message += `⏰ ${new Date().toLocaleString()}\n`;
  message += `🔗 Approve: ${process.env.NEXT_PUBLIC_APP_URL}/admin/vendors?status=pending`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

  return { success: true, url: whatsappUrl, message };
}

/**
 * Send payment received alert to vendor
 */
export async function sendPaymentAlert(vendorData: {
  phone: string;
  businessName: string;
  amount: number;
  orderId: string;
}) {
  let message = `✅ *PAYMENT RECEIVED*\n\n`;
  message += `🏪 ${vendorData.businessName}\n`;
  message += `💰 Amount: Rs. ${vendorData.amount.toFixed(0)}\n`;
  message += `📦 Order: ${vendorData.orderId}\n\n`;

  message += `Thank you for your business!\n`;
  message += `⏰ ${new Date().toLocaleString()}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${vendorData.phone}?text=${encodedMessage}`;

  return { success: true, url: whatsappUrl, message };
}
