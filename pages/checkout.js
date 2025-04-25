import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Checkout() {
  // Store user input for checkout
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    address: "",
    billingAddress: "",
    cardNumber: "",
    expiration: "",
    cvc: ""
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [successMessage, setSuccessMessage] = useState(""); // Display order ID

  // Load cart items from cookie (using Cookies from cart.js)
  useEffect(() => {
    const cookieCart = Cookies.get("cart");
    if (cookieCart) {
      try {
        setCartItems(JSON.parse(cookieCart));
      } catch (err) {
        console.error("Cart parse error:", err);
      }
    }
  }, []);

  // Calculate total cart value
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cartItems]);

  // Read current user's saved address from the DB through API call
  useEffect(() => {
    const token = Cookies.get("token"); 
    if (!token) return; 
  
    fetch("/api/addresses", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setSavedAddresses(data))
      .catch((err) => console.error("Failed to fetch addresses:", err));
  }, []);

  // Sync billing address if checkbox is checked
  useEffect(() => {
    if (billingSameAsShipping) {
      setUserData((prev) => ({
        ...prev,
        billingAddress: prev.address
      }));
    }
  }, [billingSameAsShipping, userData.address]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Handle checkout submit: submits user's order, stores it in the DB, and returns a unique order ID.
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare payload to send
    const payload = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };    

  // /api/orders
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (res.ok) {
        
        // ✅ Send to inventory_api, reduce inventory
        for (const item of cartItems) {
          try {
            await fetch("/api/inventory", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.id,
                quantity: item.quantity,
              }),
            });
          } catch (err) {
            console.error("Failed to update inventory for product:", item.id);
          }
        }

        // Clear cart and redirect to order confirmation page
        Cookies.remove("cart");
        setCartItems([]);
        router.push(`/order-confirmation?orderId=${data.order.id}`);
      } else {
        alert("Checkout failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again later.");
    }
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center", color: "green" }}>Checkout</h2>

        {/* Success message if order confirmed */}
        {successMessage && (
          <div
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
              textAlign: "center"
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Order item list */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Your Items:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cartItems.map((item) => (
              <li key={item.id} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Checkout form */}
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <Input label="Name" name="name" value={userData.name} onChange={handleChange} />

          {/* Saved address selector */}
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Select Saved Shipping Address</label>
              <select
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected) {
                    setUserData((prev) => ({
                      ...prev,
                      address: selected,
                      billingAddress: billingSameAsShipping ? selected : prev.billingAddress
                    }));
                  }
                }}
                defaultValue=""
                style={inputStyle}
              >
                <option value="">-- Choose an address --</option>
                {savedAddresses.map((addr, idx) => (
                  <option key={idx} value={addr}>
                    {addr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Address inputs */}
          <Input label="Shipping Address" name="address" value={userData.address} onChange={handleChange} />
          <Checkbox
            checked={billingSameAsShipping}
            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
            label="Billing address same as shipping"
          />
          <Input
            label="Billing Address"
            name="billingAddress"
            value={userData.billingAddress}
            onChange={handleChange}
            disabled={billingSameAsShipping}
          />

          <Input label="Phone Number" name="phone" value={userData.phone} onChange={handleChange} />


          {/* Payment section */}
          <Input label="Card Number" name="cardNumber" value={userData.cardNumber} onChange={handleChange} />
          <Input label="Expiration" name="expiration" value={userData.expiration} onChange={handleChange} />
          <Input label="CVC" name="cvc" value={userData.cvc} onChange={handleChange} />

          {/* Total amount */}
          <div style={{ textAlign: "right", marginBottom: "20px", fontWeight: "bold" }}>
            Total: ${totalAmount.toFixed(2)} (excluding tax & shipping)
          </div>

          {/* Submit button */}
          <button type="submit" style={buttonStyle}>
            Confirm Checkout
          </button>
        </form>
      </div>
    </Layout>
  );
}

// Reusable input component
function Input({ label, name, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        style={inputStyle}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  );
}

// Checkbox component
function Checkbox({ checked, onChange, label }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontWeight: "bold" }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ marginRight: "8px" }} />
        {label}
      </label>
    </div>
  );
}

// Styles
const containerStyle = {
  maxWidth: "600px",
  margin: "40px auto",
  padding: "20px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  fontFamily: "Arial"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "bold"
};

const buttonStyle = {
  width: "100%",
  background: "green",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer"
};
