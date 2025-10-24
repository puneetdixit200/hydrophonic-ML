export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2a5298',
        secondary: '#7c86ff',
        accent: '#51f1c6',
        danger: '#d1625b',
        success: '#51d982',
        'bg-light': '#eaf0ff',
        'bg-light-2': '#c7ecee',
      },
      fontFamily: {
        sans: ["'Poppins'", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: '0 4px 18px rgba(98,112,177,0.16)',
        lg: '0 6px 24px rgba(45,67,120,0.18)',
      },
      borderRadius: {
        xl: '28px',
        lg: '24px',
        md: '14px',
      },
    },
  },
  plugins: [],
}
