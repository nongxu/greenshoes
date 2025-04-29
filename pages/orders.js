// pages/orders.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Cookies from 'js-cookie';

export default function OrderPage() {
  const router = useRouter();

  // Simulated login state (you can replace with real auth later)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Order ID input field (used when not logged in)
  const [orderIdInput, setOrderIdInput] = useState("");

  // Stores order details if found
  const [orderResult, setOrderResult] = useState(null);

  // Error message if order not found
  const [errorMsg, setErrorMsg] = useState("");

  // List of user's orders if logged in
  const [userOrders, setUserOrders] = useState([]);

  // Loading state for fetching user orders
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Check if user is logged in by checking token in cookies
  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch user order history when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await fetch('/api/orders_api');
          const data = await res.json();
          if (res.ok) {
            setUserOrders(data.orders);
          } else {
            console.error('Failed to load orders:', data.message);
          }
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [isLoggedIn]);


  // Search for order by ID (guest mode)
  const handleSearch = async () => {
    setErrorMsg("");
    if (!orderIdInput) return;

    try {
      const token = Cookies.get('token');
      if (!token) {
        // If no token (guest), clear token from cookie just in case
        Cookies.remove('token');
      }

      const res = await fetch(`/api/orders_api/${orderIdInput}`);
      if (!res.ok) throw new Error("Order not found");

      // ✅ If order exists, redirect to details page
      router.push(`/user/order-details?orderId=${orderIdInput}`);
    } catch (err) {
      setErrorMsg("Order not found. Please check the order ID.");
    }
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center", color: "green" }}>Order Lookup</h2>

        {/* Show order list if user is logged in */}
        {isLoggedIn ? (
          <>
            <h3 style={{ margin: "20px 0" }}>Your Order History</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {userOrders.map(order => (
                <li key={order.id} style={orderItemStyle}>
                  <div>
                    <div><strong>Order #{order.id}</strong></div>
                    <div>Date: {order.date}</div>
                    <div>Status: {order.status}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>Total: ${order.total.toFixed(2)}</div>
                    <button
                      onClick={() => router.push(`/user/order-details?orderId=${order.id}`)}
                      style={buttonStyle}
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            {/* Guest mode: search by order ID */}
            <h3 style={{ marginBottom: "10px" }}>Enter Order ID to Lookup</h3>
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="e.g. 101"
              style={inputStyle}
            />
            <button onClick={handleSearch} style={searchButtonStyle}>
              Search Order
            </button>
            {errorMsg && <p style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>}
          </>
        )}

        {/* No need to render inline result since we redirect on success */}
      </div>
    </Layout>
  );
}

// Styles
const containerStyle = {
  maxWidth: "700px",
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
  justifyContent: "space-between"
};

const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px"
};

const searchButtonStyle = {
  width: "100%",
  background: "green",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};
