import Link from 'next/link'
import Layout from '../../components/Layout'
import styles from '../../styles/user-dashboard.module.css'

export async function getServerSideProps({ req }) {
  // Forward the cookie so Express can read the token
  const cookie = req.headers.cookie || ''
  const host = req.headers.host
  const url = `http://localhost:3000/api/profile`

  const res = await fetch(url, {
    headers: { cookie }
  })
  if (!res.ok) {
    // not logged in or no profile → redirect
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    }
  }
  const profile = await res.json()
  return { props: { profile } }
}

export default function UserProfile({ profile }) {
  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2>User Profile</h2>
        <p><strong>Name:</strong> {profile.fullName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Delivery Address:</strong> {profile.deliveryAddress}</p>
        <p><strong>Billing Address:</strong> {profile.billingAddress}</p>
        <p>
          <strong>Card on File:</strong>{' '}
          {'*'.repeat(12) + profile.cardLast4}
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/user/dashboard">
            <button className={styles.manageBtn}>Back to Dashboard</button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}