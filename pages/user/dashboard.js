import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";

export default function Dashboard() {
  // Sample order history data (will be replaced with API later)
  const [orders, setOrders] = useState([
    { id: 101, date: "2025-03-20", total: 99.99, status: "Shipped" },
    { id: 102, date: "2025-03-25", total: 59.49, status: "Delivered" },
    { id: 103, date: "2025-03-30", total: 129.00, status: "Processing" }
  ]);

  return (
    <Layout>
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center", color: "green" }}>User Dashboard</h2>

        {/* Order history section */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>Order History</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {orders.map(order => (
              <li key={order.id} style={orderItemStyle}>
                <div>
                  <div><strong>Order #{order.id}</strong></div>
                  <div>Date: {order.date}</div>
                  <div>Status: {order.status}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>Total: ${order.total.toFixed(2)}</div>
                  {/* View details button that links to /orders/:id */}
                  <Link href={`/orders/${order.id}`}>
                    <button style={buttonStyle}>View Details</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Address management entry point */}
        <div style={{ textAlign: "center" }}>
          <Link href="/user/address">
            <button style={buttonStyle}>
              Manage Addresses
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

// Styles
const containerStyle = {
  maxWidth: "800px",
  margin: "40px auto",
  padding: "20px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  fontFamily: "Arial"
};

const orderItemStyle = {
  padding: "16px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};
