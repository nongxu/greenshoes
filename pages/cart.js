import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useUserContext } from '../lib/UserContext'

export default function CartPage() {
  const router            = useRouter()
  const { user, loading } = useUserContext()
  const [cartItems, setCartItems] = useState([])

  // compute a cookie key per user (or “guest”)
  const cookieKey = user ? `cart:${user.id}` : 'cart:guest'

  // Redirect admins away from the cart
  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  // Whenever the user (or cookieKey) changes, reload the correct cart
  useEffect(() => {
    const cookieCart = Cookies.get(cookieKey)
    if (cookieCart) {
      try {
        setCartItems(JSON.parse(cookieCart))
      } catch (err) {
        console.error("Cart parse error:", err)
      }
    } else {
      setCartItems([])  // no cookie ⇒ empty cart
    }
  }, [cookieKey])

  // central update fn uses the same key
  const updateCart = items => {
    setCartItems(items)
    Cookies.set(cookieKey, JSON.stringify(items), { expires: 7 })
  }

  // qty +/-
  const handleQuantityChange = (pid, vid, delta) => {
    const updated = cartItems.map(i => {
      if (i.productId === pid && i.variantId === vid) {
        const q = Math.max(1, Math.min(i.stock, i.quantity + delta))
        return { ...i, quantity: q }
      }
      return i
    })
    updateCart(updated)
  }

  // Remove item
  const handleRemove = id => {
    updateCart(cartItems.filter(i => i.id !== id))
  }

  // Total
  const calculateTotal = () =>
    cartItems
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
      .toFixed(2)

  return (
    <Layout>
      <div style={{ padding: '20px', minHeight: '70vh' }}>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {cartItems.map(item => (
              <div key={item.id} style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '8px' }} />
                <h3 style={{ marginTop: '12px' }}>{item.name}</h3>
                <p>Price: ${item.price}</p>
                <p>Size: {item.size}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.variantId, -1)}
                    style={quantityButtonStyle}
                  >-</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.variantId, 1)}
                    style={quantityButtonStyle}
                  >+</button>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={removeButtonStyle}
                >Remove</button>
              </div>
            ))}
          </div>
        )}

        <hr style={{ marginTop: '30px' }} />
        <h3 style={{ textAlign: 'center' }}>Total: ${calculateTotal()}</h3>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {cartItems.length > 0 ? (
            <Link href="/checkout">
              <button style={checkoutButtonStyle}>Proceed to Checkout</button>
            </Link>
          ) : (
            <button
              style={{ ...checkoutButtonStyle, opacity: 0.5, cursor: 'not-allowed' }}
              disabled
            >
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}

// Styles...
const quantityButtonStyle = { /* … */ }
const removeButtonStyle   = { /* … */ }
const checkoutButtonStyle = { /* … */ }
