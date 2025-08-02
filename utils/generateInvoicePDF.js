const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Order = require("../models/orderModel");

const generateInvoicePDF = async (orderId, res) => {
  const order = await Order.findById(orderId).populate("user", "name email");

  if (!order) throw new Error("Order not found");

  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename = Rick-Dresses-Invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  const logoPath = path.resolve(__dirname, "../assets/rdlogo.png");
  const ganeshPath = path.resolve(__dirname, "../assets/ganesh.jpg");

  try {
    doc.image(logoPath, 50, 30, { width: 80 }); // Left Logo
    doc.image(ganeshPath, 460, 30, { width: 80 }); // Right Ganesh Image
  } catch (err) {
    console.log("❌ Image load error:", err.message);
  }

  // Title
  doc
    .fontSize(18)
    .fillColor("#ff6600")
    .font("Helvetica-Bold")
    .text("RICK DRESSES INVOICE", 0, 130, { align: "center" });

  // Shop Address
  doc
    .fontSize(10)
    .fillColor("#000")
    .text("Makhaltore, Murshidabad, Pin - 742401 (W.B)", {
      align: "center",
    });

  doc.moveDown(1.5);
  doc.fontSize(12).font("Helvetica").fillColor("black");

  // Order Info
  const leftX = 60;
  doc.text(`Order ID: ${order._id}`, leftX);
  doc.text(`Name: ${order.name}`, leftX);
  doc.text(`Phone: ${order.phone}`, leftX);
  doc.text(`Address: ${order.address}`, leftX);
  doc.text(`Status: ${order.status}`, leftX);
  doc.text(
    `Payment: ${order.payment?.method || "N/A"}, Status: ${
      order.payment?.status || "Pending"
    }`,
    leftX
  );
  if (order.payment?.transactionId) {
    doc.text(`Transaction ID: ${order.payment.transactionId}`, leftX);
  }

  // Item List
  doc.moveDown();
  doc.font("Helvetica-Bold").fontSize(14).text("Items:", leftX);
  doc.font("Helvetica").fontSize(12);

  order.items.forEach((item, index) => {
    const itemText = `${index + 1}. ${item.name} - Rs ${item.price} x ${
      item.quantity
    }`;
    doc.text(itemText, leftX);

    // Handle page break
    if (doc.y > 700) {
      addFooter(doc); // Add footer before page break
      doc.addPage();
    }
  });

  // Total
  doc.moveDown();
  doc.font("Helvetica-Bold").fontSize(14).text(`Total: Rs ${order.total}`, {
    align: "right",
  });

  // Final footer
  addFooter(doc);

  doc.end();
};

// 🔶 Footer Function
function addFooter(doc) {
  const bottomY = doc.page.height - 50;

  doc
    .fontSize(10)
    .fillColor("#ff6600")
    .text("Thanks for shopping at Rick Dresses", 50, bottomY, {
      align: "center",
    });

  doc.fillColor("black"); // Reset color
}

module.exports = generateInvoicePDF;
