/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: {
      'primary': '#23272a',
      'secondary': '#2c2f33',
      'inputs' : ' 	#4e4e4e',
      'white': '#ffffff',
      'purple': '#3f3cbb',
      'midnight': '#121063',
      'metal': '#565584',
      'tahiti': '#3ab7bf',
      'silver': '#ecebff',
      'bubble-gum': '#ff77e9',
      'bermuda': '#78dcca',
      'accent-engage': '#00B755',
      'text-engage': '#00d061',
      'yellow': '#E5C617',
      'red': '#D81A0E'
    },
    extend: {}
  },
  plugins: []
};
