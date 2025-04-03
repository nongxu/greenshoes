import { useState } from "react";
import Layout from "../../components/Layout";

export default function Shipping() {
  // State to store the list of saved addresses
  const [addresses, setAddresses] = useState([
    { id: 1, name: "Alice", address: "123 Green Street, NY" },
    { id: 2, name: "Bob", address: "456 Blue Ave, LA" }
  ]);

  // State for new address form input
  const [newAddress, setNewAddress] = useState({ name: "", address: "" });

  // Add a new address to the list
  const handleAdd = () => {
    if (!newAddress.name || !newAddress.address) return;
    const id = Date.now(); // Use timestamp as unique ID
    setAddresses([...addresses, { id, ...newAddress }]);
    setNewAddress({ name: "", address: "" });
  };

  // Delete address by ID
  const handleDelete = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  return (
    <Layout>
      <div style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial"
      }}>
        <h2 style={{ textAlign: "center", color: "green" }}>Manage Shipping Addresses</h2>

        {/* Add new address form */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Add New Address</h3>
          <input
            type="text"
            name="name"
            value={newAddress.name}
            onChange={handleChange}
            placeholder="Recipient Name"
            style={inputStyle}
          />
          <input
            type="text"
            name="address"
            value={newAddress.address}
            onChange={handleChange}
            placeholder="Shipping Address"
            style={inputStyle}
          />
          <button
            onClick={handleAdd}
            style={buttonStyle}
          >
            Add Address
          </button>
        </div>

        {/* Saved address list */}
        <div>
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Your Addresses</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {addresses.map(addr => (
              <li key={addr.id} style={listItemStyle}>
                <div>
                  <div><strong>{addr.name}</strong></div>
                  <div>{addr.address}</div>
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  background: "green",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const deleteButtonStyle = {
  background: "green",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

const listItemStyle = {
  padding: "16px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};
