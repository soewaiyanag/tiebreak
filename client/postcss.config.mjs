// Tailwind v4 runs as a PostCSS plugin (the Vite-plugin path is gone now that
// this is a plain Vite SPA consuming tokens.css).
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
