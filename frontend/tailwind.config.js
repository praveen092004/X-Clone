const daisyui = require('daisyui');

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#1d9bf0",
          secondary: "#16181c",
          accent: "#1da1f2",
          neutral: "#0f1419",
          "base-100": "#000000",      
          "base-content": "#ffffff",  
          info: "#3abff8",
          success: "#00ba7c",
          warning: "#fbbc05",
          error: "#e0245e",
        },
      },
    ],
    defaultTheme: "twitterdark",
  },
};
