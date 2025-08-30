// utils/emailTemplates.js
const currency = (n) => `₹${Number(n || 0).toFixed(2)}`;

exports.adminNewOrder = (order, user) => `
  <h2>🆕 New Order Received</h2>
  <p><b>Order ID:</b> ${order._id}</p>
  <p><b>Customer:</b> ${user?.name} (${user?.email})</p>
  <p><b>Phone:</b> ${order.phone}</p>
  <p><b>Address:</b> ${order.address}</p>
  <p><b>Total:</b> ${currency(order.total)}</p>
  <p><b>Payment Mode:</b> ${order.payment?.method}</p>
  <hr/>
  <h3>Items</h3>
  <ul>
    ${order.items
      .map(
        (i) =>
          `<li>${i.name || i.productName} × ${i.quantity} = ${currency(
            i.price * i.quantity
          )}</li>`
      )
      .join("")}
  </ul>
`;

exports.adminPaymentSubmitted = ({ order, payment, user }) => `
  <h2>📥 Payment Submitted</h2>
  <p><b>Order ID:</b> ${order._id}</p>
  <p><b>Customer:</b> ${user?.name} (${user?.email})</p>
  <p><b>Transaction ID:</b> ${payment.transactionId || "-"}</p>
  <p><b>Amount:</b> ${currency(payment.paymentAmount)}</p>
  <p><b>Payment Mode:</b> ${payment.paymentMode}</p>
  <p>🖼️ Screenshot attached (if provided).</p>
`;

exports.userPaymentDecision = ({ user, order, status }) => `
  <h2>💳 Payment ${status === "approved" ? "Approved" : "Rejected"}</h2>
  <p>Hi ${user?.name || "there"},</p>
  <p>Your payment for <b>Order ${order._id}</b> has been <b>${status}</b>.</p>
  <p><b>Total:</b> ${currency(order.total)}</p>
  <p><b>Order Status:</b> ${order.paymentStatus || order.status}</p>
  <p>Thanks for shopping with ${process.env.APP_NAME || "us"}!</p>
`;

exports.userOrderDelivered = ({ user, order }) => `
  <h2>📦 Order Delivered</h2>
  <p>Hi ${user?.name || "there"},</p>
  <p>Your order <b>${order._id}</b> has been marked as <b>Delivered</b>.</p>
  <p>We hope you enjoy your purchase!</p>
`;

exports.userOrderCancelled = ({ user, order }) => `
  <h2>❌ Order Cancelled</h2>
  <p>Hi ${user?.name || "there"},</p>
  <p>Your order <b>${order._id}</b> has been <b>Cancelled</b>.</p>
  ${order.cancelReason ? `<p><b>Reason:</b> ${order.cancelReason}</p>` : ""}
  <p>If you think this was a mistake, please contact support.</p>
`;
