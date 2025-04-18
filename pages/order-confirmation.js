import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <Layout>
      <div style={{ maxWidth: "600px", margin: "40px auto", padding:"20px", textAlign: "center" }}>
        <h1>Order Confirmed!</h1>
        <p>Your order ID is <strong>{orderId}</strong>.</p>
        <p>Thank you for your purchase.</p>
      </div>
    </Layout>
  );
}