interface OrderItem {
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface NewOrderEmailData {
  vendorName: string;
  orderNumber: string;
  customerName: string;
  shippingAddress: string;
  items: OrderItem[];
  total: number;
  platformUrl: string;
}

export function generateNewOrderEmail(data: NewOrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.product.name}</strong><br>
        <span style="color: #6b7280;">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: semibold;">
        $${(item.quantity * item.price).toFixed(2)}
      </td>
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
        <title>New Order Received - StoreHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 New Order Received!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hello <strong>${data.vendorName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
                Great news! You've received a new order on StoreHub. Please review the details below and prepare the items for shipment.
              </p>

              <!-- Order Details Box -->
              <table style="width: 100%; background-color: #f9fafb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Number:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111827;">${data.orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Customer:</td>
                        <td style="padding: 8pxpx 0; text-align: right; font-weight: 600; color: #111827;">${data.customerName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <p style="color: #374151; font-size: 15px; margin: 0 0 8px 0; font-weight: 600;">Shipping Address:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">${data.shippingAddress}</p>

              <!-- Order Items -->
              <table style="width: 100%; margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Total -->
              <table style="width: 100%; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="color: #92400e; font-size: 16px; font-weight: 600;">Total Earnings:</span>
                  </td>
                  <td style="padding: 16px 20px; text-align: right;">
                    <span style="color: #92400e; font-size: 24px; font-weight: 700;">$${data.total.toFixed(2)}</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table style="width: 100%; margin-top: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.platformUrl}/vendor/orders" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      View Order in Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
                This notification was sent by StoreHub
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Please do not reply to this email. For support, contact our team.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

interface CustomerOrderEmailData {
  customerName: string;
  orderNumber: string;
  orderId: string;
  shippingAddress: string;
  items: OrderItem[];
  total: number;
  platformUrl: string;
}

export function generateCustomerOrderEmail(data: CustomerOrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">${item.product.name}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</p>
      </td>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">
        $${(item.quantity * item.price).toFixed(2)}
      </td>
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
        <title>Order Confirmation - StoreHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Order Confirmed!</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hi <strong>${data.customerName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
                Great news! Your order has been successfully placed. We've received your order and will notify you once it ships.
              </p>

              <!-- Order Details Box -->
              <table style="width: 100%; background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #15803d; font-size: 14px; font-weight: 600;">Order Number:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827; font-size: 16px;">${data.orderNumber}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <p style="color: #374151; font-size: 15px; margin: 0 0 8px 0; font-weight: 600;">Shipping To:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">${data.shippingAddress}</p>

              <!-- Order Items -->
              <p style="color: #374151; font-size: 15px; margin: 0 0 12px 0; font-weight: 600;">Your Items:</p>
              <table style="width: 100%; margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Total -->
              <table style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <span style="color: #ffffff; font-size: 16px;">Total Paid:</span>
                  </td>
                  <td style="padding: 20px; text-align: right;">
                    <span style="color: #ffffff; font-size: 28px; font-weight: 700;">$${data.total.toFixed(2)}</span>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <table style="width: 100%; background-color: #fef3c7; border-radius: 8px; margin-top: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                      <strong>📧 Order Updates:</strong> You'll receive email notifications when your order status changes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table style="width: 100%; margin-top: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.platformUrl}/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                      Track Your Order →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
                Questions? Contact our support team
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This email was sent by StoreHub. Thank you for shopping with us!
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
