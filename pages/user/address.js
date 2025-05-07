// pages/user/address.js
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { useUserContext } from '../../lib/UserContext'
import styles from '../../styles/user-address.module.css'

export default function AddressBook() {
  const router = useRouter()
  const { user, loading } = useUserContext()

  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ name: '', address: '', phone: '' })
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (user === null) {
      router.replace('/signin')
      return
    }
    if (user.role === 'admin') {
      router.replace('/admin/dashboard')
      return
    }

    ;(async () => {
      try {
        const res = await fetch('/api/addresses', { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/signin')
          return
        }
        if (!res.ok) throw new Error()
        const data = await res.json()
        setAddresses(data)
      } catch {
        setError('Failed to load addresses')
      } finally {
        setLoadingAddresses(false)
      }
    })()
  }, [loading, user, router])

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleAdd = async () => {
    if (!form.name || !form.address) return
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const newAddr = await res.json()
      setAddresses(prev => [...prev, newAddr])
      setForm({ name: '', address: '', phone: '' })
    } catch {
      setError('Could not add address')
    }
  }

  const handleDelete = async idx => {
    try {
      const res = await fetch(`/api/addresses/${idx}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      setAddresses(a => a.filter((_, i) => i !== idx))
    } catch {
      setError('Could not delete address')
    }
  }

  if (loading || user?.role !== 'user') return null

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>Manage Shipping Addresses</h2>
          <Link href="/user/dashboard">
            <button className={styles.backBtn}>Back to Dashboard</button>
          </Link>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.grid}>
          <section className={styles.formSection}>
            <h3>Add New Address</h3>
            <input
              name="name"
              placeholder="Recipient Name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="address"
              placeholder="Shipping Address"
              value={form.address}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />
            <button
              onClick={handleAdd}
              className={`${styles.btnPrimary} ${styles.fullBtn}`}
            >
              Add Address
            </button>
          </section>

          <section className={styles.listSection}>
            <h3>Your Addresses</h3>
            {loadingAddresses ? (
              <p>Loading…</p>
            ) : addresses.length === 0 ? (
              <p>No addresses found.</p>
            ) : (
              <ul className={styles.list}>
                {addresses
                  .filter(a => a?.name && a.address && a.phone)
                  .map((addr, idx) => (
                    <li key={idx} className={styles.item}>
                      <div className={styles.addressInfo}>
                        <strong className={styles.name}>{addr.name}</strong>
                        <p className={styles.line}>{addr.address}</p>
                        <p className={styles.line}>{addr.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(idx)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}
