/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2C35",      // Mirage      – text, dark sections, dark buttons
        paper: "#F6F7FA",    // page background (a lighter tint of Athens Gray)
        mist: "#ECECF3",     // Athens Gray – soft panels, icon chips, CTA band
        line: "#DADFE8",     // borders / dividers
        accent: "#4F7DAD",   // Wedgewood   – highlights, headline accents, outlines
        deep: "#46729F",     // Wedgewood, slightly darker so white text on buttons passes AA
        sky: "#78A9CE",      // Polo Blue   – highlights on dark backgrounds, 3D lines
        muted: "#5F7282",    // secondary text (blue-grey derived from Mirage)
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "sans-serif"],
        display: ["Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};