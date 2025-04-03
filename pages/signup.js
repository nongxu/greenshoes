import { useState } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || "Signup failed");
        return;
      }

      // ✅ Store token in cookie
      Cookies.set("token", data.token, { expires: 7 });

      // ✅ Redirect to user dashboard
      router.push("/user/dashboard");

    } catch (err) {
      setLoading(false);
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <h2 style={{ textAlign: "center", color: "green" }}>Sign Up</h2>

        {error && (
          <p style={{ color: "red", marginBottom: "20px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {["name", "email", "password", "confirmPassword"].map((field) => (
            <div key={field} style={{ marginBottom: "16px" }}>
              <label
                htmlFor={field}
                style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}
              >
                {field === "confirmPassword"
                  ? "Confirm Password"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={
                  field.includes("password")
                    ? "password"
                    : field === "email"
                    ? "email"
                    : "text"
                }
                name={field}
                id={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Enter your ${
                  field === "confirmPassword" ? "password again" : field
                }`}
                required
                style={inputStyle}
              />
            </div>
          ))}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "green", textDecoration: "underline" }}>
            Log in here
          </Link>
        </p>
      </div>
    </Layout>
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

// api/auth/signup The backend should return the following structure:
//{
//"success": true,
//"token": "your-jwt-or-session-token"
//}