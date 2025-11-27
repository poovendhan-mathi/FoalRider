import PDFDocument from "pdfkit";
import { format } from "date-fns";
import fs from "fs";
import path from "path";

interface OrderItem {
  products: {
    name: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface ShippingAddress {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: ShippingAddress | null;
  email: string;
  order_items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
}

export function generateInvoicePDF(order: Order): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Colors
      const goldColor = "#C5A572";
      const darkGray = "#333333";
      const lightGray = "#666666";
      const bgGray = "#f9f9f9";

      // Logo - using emoji as placeholder (you can load actual image file)
      const logoPath = path.join(process.cwd(), "public", "assets", "logo", "Gold.png");
      
      // Header with Logo and Company Info
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 100 });
        } else {
          doc.fontSize(28).fillColor(goldColor).text("🐴 FoalRider", 50, 50);
        }
      } catch {
        doc.fontSize(28).fillColor(goldColor).text("🐴 FoalRider", 50, 50);
      }

      doc
        .fontSize(10)
        .fillColor(lightGray)
        .text("Premium Equestrian Apparel", 50, 90, { align: "left" });

      // Company details (right side)
      doc
        .fontSize(9)
        .fillColor(darkGray)
        .text("FoalRider", 400, 50, { align: "right" })
        .text("123 Equestrian Way", 400, 65, { align: "right" })
        .text("Horse Valley, HV 12345", 400, 80, { align: "right" })
        .text("orders@foalrider.com", 400, 95, { align: "right" })
        .text("+1 (555) 123-4567", 400, 110, { align: "right" });

      // Horizontal line
      doc
        .strokeColor(goldColor)
        .lineWidth(3)
        .moveTo(50, 135)
        .lineTo(550, 135)
        .stroke();

      // INVOICE Title
      doc
        .fontSize(32)
        .fillColor(goldColor)
        .font("Helvetica-Bold")
        .text("INVOICE", 50, 160);

      // Invoice and Billing Info Boxes
      const boxY = 210;
      const boxHeight = 120;

      // Invoice Details Box
      doc
        .rect(50, boxY, 240, boxHeight)
        .fillAndStroke(bgGray, darkGray)
        .lineWidth(0.5);

      doc
        .fontSize(10)
        .fillColor(lightGray)
        .font("Helvetica-Bold")
        .text("INVOICE DETAILS", 65, boxY + 15);

      doc
        .fontSize(9)
        .fillColor(darkGray)
        .font("Helvetica")
        .text("Invoice Number:", 65, boxY + 35)
        .font("Helvetica-Bold")
        .text(order.order_number, 65, boxY + 50);

      doc
        .font("Helvetica")
        .text("Invoice Date:", 65, boxY + 70)
        .font("Helvetica-Bold")
        .text(format(new Date(order.created_at), "MMMM dd, yyyy"), 65, boxY + 85);

      // Status badges
      const statusY = boxY + 105;
      const statusColor = getStatusColor(order.status);
      const paymentColor = order.payment_status === "paid" ? "#4CAF50" : "#FF9800";

      doc
        .fontSize(8)
        .fillColor("white")
        .rect(65, statusY, 50, 16)
        .fill(statusColor)
        .fillColor("white")
        .text(
          order.status.charAt(0).toUpperCase() + order.status.slice(1),
          65,
          statusY + 4,
          { width: 50, align: "center" }
        );

      doc
        .rect(125, statusY, 50, 16)
        .fill(paymentColor)
        .fillColor("white")
        .text(
          order.payment_status === "paid" ? "PAID" : "PENDING",
          125,
          statusY + 4,
          { width: 50, align: "center" }
        );

      // Bill To Box
      doc
        .rect(310, boxY, 240, boxHeight)
        .fillAndStroke(bgGray, darkGray)
        .lineWidth(0.5);

      doc
        .fontSize(10)
        .fillColor(lightGray)
        .font("Helvetica-Bold")
        .text("BILL TO", 325, boxY + 15);

      const shippingAddr = order.shipping_address;
      doc
        .fontSize(9)
        .fillColor(darkGray)
        .font("Helvetica-Bold")
        .text(shippingAddr?.name || "Customer", 325, boxY + 35);

      let addressY = boxY + 50;
      if (shippingAddr?.line1) {
        doc.font("Helvetica").text(shippingAddr.line1, 325, addressY);
        addressY += 12;
      }
      if (shippingAddr?.line2) {
        doc.text(shippingAddr.line2, 325, addressY);
        addressY += 12;
      }
      doc.text(
        `${shippingAddr?.city || ""}, ${shippingAddr?.state || ""} ${shippingAddr?.postal_code || ""}`,
        325,
        addressY
      );
      addressY += 12;
      doc.text(shippingAddr?.country || "", 325, addressY);
      addressY += 15;
      if (order.email) {
        doc.font("Helvetica-Bold").text("Email: ", 325, addressY, { continued: true });
        doc.font("Helvetica").text(order.email);
      }

      // Items Table
      const tableTop = boxY + boxHeight + 40;
      const tableHeaders = ["Item", "Quantity", "Price", "Total"];
      const colWidths = [260, 80, 80, 80];
      let tableX = 50;

      // Table Header
      doc
        .rect(50, tableTop, 500, 30)
        .fill(goldColor);

      tableHeaders.forEach((header, i) => {
        doc
          .fontSize(10)
          .fillColor("white")
          .font("Helvetica-Bold")
          .text(header, tableX + 10, tableTop + 10, {
            width: colWidths[i],
            align: i === 0 ? "left" : "right",
          });
        tableX += colWidths[i];
      });

      // Table Rows
      let currentY = tableTop + 40;
      const currencySymbol = order.currency === "INR" ? "₹" : "$";

      order.order_items.forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 500, 30).fill(bgGray);
        }

        tableX = 50;
        doc
          .fontSize(9)
          .fillColor(darkGray)
          .font("Helvetica")
          .text(item.products.name, tableX + 10, currentY, {
            width: colWidths[0] - 20,
            align: "left",
          });

        tableX += colWidths[0];
        doc.text(item.quantity.toString(), tableX, currentY, {
          width: colWidths[1],
          align: "right",
        });

        tableX += colWidths[1];
        doc.text(`${currencySymbol}${(item.price / 100).toFixed(2)}`, tableX, currentY, {
          width: colWidths[2],
          align: "right",
        });

        tableX += colWidths[2];
        doc.text(`${currencySymbol}${(item.subtotal / 100).toFixed(2)}`, tableX, currentY, {
          width: colWidths[3],
          align: "right",
        });

        currentY += 30;
      });

      // Horizontal line after items
      doc
        .strokeColor(lightGray)
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

      // Totals Section
      currentY += 20;
      const totalsX = 350;
      const labelX = totalsX;
      const valueX = 470;

      doc
        .fontSize(9)
        .fillColor(darkGray)
        .font("Helvetica")
        .text("Subtotal:", labelX, currentY)
        .text(`${currencySymbol}${(order.subtotal / 100).toFixed(2)}`, valueX, currentY, {
          width: 80,
          align: "right",
        });

      currentY += 18;
      doc
        .text("Shipping:", labelX, currentY)
        .text(`${currencySymbol}${(order.shipping_cost / 100).toFixed(2)}`, valueX, currentY, {
          width: 80,
          align: "right",
        });

      currentY += 18;
      doc
        .text("Tax:", labelX, currentY)
        .text(`${currencySymbol}${(order.tax / 100).toFixed(2)}`, valueX, currentY, {
          width: 80,
          align: "right",
        });

      // Total Box
      currentY += 25;
      doc
        .rect(totalsX - 10, currentY - 5, 210, 35)
        .fillAndStroke(bgGray, goldColor)
        .lineWidth(2);

      doc
        .fontSize(14)
        .fillColor(goldColor)
        .font("Helvetica-Bold")
        .text("TOTAL:", labelX, currentY + 8)
        .text(
          `${currencySymbol}${(order.total_amount / 100).toFixed(2)}`,
          valueX,
          currentY + 8,
          { width: 80, align: "right" }
        );

      // Thank you message
      currentY += 60;
      doc
        .fontSize(14)
        .fillColor(goldColor)
        .font("Helvetica-Bold")
        .text("Thank you for your purchase!", 50, currentY, { align: "center", width: 500 });

      // Footer
      const footerY = 750;
      doc
        .strokeColor(lightGray)
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(550, footerY)
        .stroke();

      doc
        .fontSize(8)
        .fillColor(lightGray)
        .font("Helvetica")
        .text("FoalRider - Premium Equestrian Apparel", 50, footerY + 15, {
          align: "center",
          width: 500,
        });

      doc.text("For questions about this invoice, please contact orders@foalrider.com", 50, footerY + 28, {
        align: "center",
        width: 500,
      });

      doc.text("This is a computer-generated document. No signature is required.", 50, footerY + 41, {
        align: "center",
        width: 500,
      });

      // Generated by info at bottom
      doc
        .fontSize(7)
        .fillColor("#999999")
        .text(
          `Generated on ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")} | Name: Pooven`,
          50,
          footerY + 60,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#FF9800",
    processing: "#2196F3",
    shipped: "#9C27B0",
    delivered: "#4CAF50",
    cancelled: "#F44336",
  };
  return colors[status] || "#9E9E9E";
}
