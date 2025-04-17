module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',  // base blue can be replaced with your brand accent color
        background: '#ffffff',
        accent: '#28a745',   // for buttons and call-to-actions
      },
      spacing: {
        '128': '32rem', // if you need custom spacing
      },
    },
  },
  plugins: [],
}