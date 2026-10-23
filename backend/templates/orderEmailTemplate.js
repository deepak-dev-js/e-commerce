const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const statusConfig = {
  confirmed: {
    title: "Order Confirmed!",
    message: "Your payment was successful and your order is confirmed.",
    color: "#15803d",
  },
  shipped: {
    title: "Your Order Has Shipped!",
    message: "Great news! Your order is on its way.",
    color: "#2563eb",
  },
  delivered: {
    title: "Order Delivered!",
    message: "Your order has been delivered. We hope you enjoy your purchase!",
    color: "#15803d",
  },
  cancelled: {
    title: "Order Cancelled",
    message: "Your order has been cancelled.",
    color: "#dc2626",
  },
  refund_processing: {
    title: "Refund Processing",
    message: "Your refund is being processed.",
    color: "#d97706",
  },
  refunded: {
    title: "Refund Processed",
    message:
      "Your refund has been processed. The time taken for the amount to reflect depends on your payment provider.",
    color: "#15803d",
  },
};

const createOrderEmailTemplate = ({
  fullName,
  order,
  status = "confirmed",
  logoUrl = "",
  storeUrl = "",
}) => {
  const config = statusConfig[status] || statusConfig.confirmed;

  const customerName = escapeHtml(fullName || "Customer");
  const orderId = escapeHtml(order._id);
  const orderStatus = escapeHtml(status.replaceAll("_", " "));
  const totalAmount = formatPrice(order.totalAmount);

  const itemsHtml = (order.items || [])
    .map((item) => {
      const name = escapeHtml(item.name);
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const image = item.image
        ? escapeHtml(item.image)
        : "";

      return `
        <tr>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${
                  image
                    ? `
                      <td style="padding-right:12px;vertical-align:middle;">
                        <img
                          src="${image}"
                          alt="${name}"
                          width="56"
                          height="56"
                          style="display:block;width:56px;height:56px;object-fit:contain;border-radius:6px;"
                        />
                      </td>
                    `
                    : ""
                }
                <td style="vertical-align:middle;">
                  <span style="font-size:14px;font-weight:600;color:#111827;">
                    ${name}
                  </span>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:14px 8px;text-align:center;border-bottom:1px solid #e5e7eb;color:#374151;">
            ${quantity}
          </td>
          <td style="padding:14px 8px;text-align:right;border-bottom:1px solid #e5e7eb;color:#374151;white-space:nowrap;">
            ${formatPrice(price * quantity)}
          </td>
        </tr>
      `;
    })
    .join("");

  const logoHtml = logoUrl
    ? `
      <img
        src="${escapeHtml(logoUrl)}"
        alt="ApnaShop"
        width="150"
        style="display:block;max-width:150px;width:100%;height:auto;margin:0 auto;"
      />
    `
    : `
      <span style="font-size:28px;font-weight:800;letter-spacing:-1px;color:#111827;">
        Apna<span style="color:#16a34a;">Shop</span>
      </span>
    `;

  const storeButton = storeUrl
    ? `
      <p style="margin:24px 0;text-align:center;">
        <a
          href="${escapeHtml(storeUrl)}"
          style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:6px;font-size:14px;font-weight:600;"
        >
          Visit ApnaShop
        </a>
      </p>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(config.title)}</title>
      </head>

      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(config.message)} Order ID: ${orderId}
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;">
          <tr>
            <td align="center" style="padding:28px 12px;">

              <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">

                <tr>
                  <td align="center" style="padding:28px 24px;border-bottom:1px solid #e5e7eb;">
                    ${logoHtml}
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 24px 20px;">
                    <h1 style="margin:0 0 14px;font-size:25px;line-height:1.3;color:${config.color};">
                      ${escapeHtml(config.title)}
                    </h1>

                    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;">
                      Hi ${customerName},
                    </p>

                    <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
                      ${escapeHtml(config.message)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 24px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                            ORDER ID
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;word-break:break-all;">
                            ${orderId}
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 16px 16px;">
                          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                            ORDER STATUS
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;text-transform:capitalize;">
                            ${orderStatus}
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 16px 16px;">
                          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                            PAYMENT STATUS
                          </p>
                          <p style="margin:0;font-size:14px;font-weight:600;text-transform:capitalize;">
                            ${escapeHtml(order.paymentStatus || "pending")}
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 16px 16px;">
                          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                            TOTAL AMOUNT
                          </p>
                          <p style="margin:0;font-size:22px;font-weight:700;color:#111827;">
                            ${totalAmount}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${
                  order.items?.length
                    ? `
                      <tr>
                        <td style="padding:0 24px 28px;">
                          <h2 style="margin:0 0 14px;font-size:18px;">
                            Order Summary
                          </h2>

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <thead>
                              <tr style="background:#f9fafb;">
                                <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;">PRODUCT</th>
                                <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;">QTY</th>
                                <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;">PRICE</th>
                              </tr>
                            </thead>

                            <tbody>
                              ${itemsHtml}
                            </tbody>
                          </table>

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-top:18px;font-size:16px;font-weight:700;">
                                Total
                              </td>
                              <td style="padding-top:18px;text-align:right;font-size:18px;font-weight:700;">
                                ${totalAmount}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    `
                    : ""
                }

                <tr>
                  <td style="padding:0 24px 28px;">
                    <h2 style="margin:0 0 12px;font-size:18px;">
                      Shipping Address
                    </h2>

                    <p style="margin:0;font-size:14px;line-height:1.8;color:#4b5563;">
                      <strong style="color:#111827;">${customerName}</strong><br />
                      ${escapeHtml(order.shippingAddress?.addressLine || "")}<br />
                      ${escapeHtml(order.shippingAddress?.phone || "")}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 24px;">
                    ${storeButton}
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#111827;">
                      Thank you for choosing ApnaShop!
                    </p>

                    <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">
                      This is an automated email regarding your order.
                      Please do not reply directly to this message.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default createOrderEmailTemplate;

