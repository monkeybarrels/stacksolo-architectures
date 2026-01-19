/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../packages/shell/src/**/*.{vue,js,ts,jsx,tsx}',
    '../packages/shared/src/**/*.{vue,js,ts,jsx,tsx}',
    '../packages/feature-*/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
