import plugin from 'tailwindcss/plugin';

export default {
  darkMode: 'class', // still needed for the mechanism
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', '.light &');
    }),
  ],
}