// pages/_app.js
import '../styles/globals.css';
import { UserProvider } from '../lib/UserContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
