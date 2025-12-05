import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { format } from "date-fns";

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

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#C5A572",
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C5A572",
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 10,
    color: "#666666",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  label: {
    fontSize: 10,
    color: "#666666",
  },
  value: {
    fontSize: 11,
    color: "#333333",
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
    fontSize: 10,
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C5A572",
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#C5A572",
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#666666",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statusBadge: {
    padding: "5 10",
    borderRadius: 3,
    fontSize: 10,
    fontWeight: "bold",
  },
});

// Helper function to format currency
// Prices in database are stored in smallest unit (paise/cents), so divide by 100
const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    INR: "₹",
    SGD: "S$",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
  };
  const symbol = symbols[currency.toUpperCase()] || currency;
  // Convert from smallest unit (paise/cents) to main unit (rupees/dollars)
  const displayAmount = amount / 100;
  return `${symbol}${displayAmount.toFixed(2)}`;
};

// Helper function to get status color
const getStatusColor = (
  status: string
): { backgroundColor: string; color: string } => {
  const colors: Record<string, { backgroundColor: string; color: string }> = {
    pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
    processing: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    shipped: { backgroundColor: "#E0E7FF", color: "#3730A3" },
    delivered: { backgroundColor: "#D1FAE5", color: "#065F46" },
    cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  };
  return (
    colors[status.toLowerCase()] || {
      backgroundColor: "#F3F4F6",
      color: "#4B5563",
    }
  );
};

// Invoice PDF Component
const InvoicePDF: React.FC<{ order: Order }> = ({ order }) => {
  const statusColors = getStatusColor(order.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>🐴 FoalRider</Text>
          <Text style={styles.companyTagline}>Premium Equestrian Apparel</Text>
        </View>

        {/* Invoice Title */}
        <View style={styles.row}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.value}>Order #{order.order_number}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.statusBadge, statusColors]}>
              {order.status.toUpperCase()}
            </Text>
            <Text style={[styles.label, { marginTop: 5 }]}>
              {format(new Date(order.created_at), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>

        {/* Customer & Shipping Info */}
        <View style={[styles.row, { marginTop: 30 }]}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.value}>
              {order.shipping_address?.name || "N/A"}
            </Text>
            <Text style={styles.value}>{order.email}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ship To:</Text>
            <Text style={styles.value}>
              {order.shipping_address?.line1 || "N/A"}
            </Text>
            {order.shipping_address?.line2 && (
              <Text style={styles.value}>{order.shipping_address.line2}</Text>
            )}
            <Text style={styles.value}>
              {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
              {order.shipping_address?.postal_code}
            </Text>
            <Text style={styles.value}>
              {order.shipping_address?.country || "N/A"}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>Price</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>Total</Text>
          </View>
          {order.order_items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.products.name}</Text>
              <Text style={styles.col2}>
                {formatCurrency(item.price, order.currency)}
              </Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>
                {formatCurrency(item.subtotal, order.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(order.subtotal, order.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Shipping:</Text>
            <Text>
              {order.shipping_cost === 0
                ? "FREE"
                : formatCurrency(order.shipping_cost, order.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax (18% GST):</Text>
            <Text>{formatCurrency(order.tax, order.currency)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrency(order.total_amount, order.currency)}</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.label}>
            Payment Status:{" "}
            <Text style={styles.value}>{order.payment_status}</Text>
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your order!</Text>
          <Text style={{ marginTop: 5 }}>
            FoalRider • 123 Equestrian Way • Horse Valley, HV 12345
          </Text>
          <Text style={{ marginTop: 5 }}>
            Generated by: Pooven • {format(new Date(), "MMM dd, yyyy")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Generate PDF Buffer
export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  try {
    const doc = <InvoicePDF order={order} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF invoice");
  }
}
