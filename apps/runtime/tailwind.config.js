/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        'bg-primary': "var(--bg-primary)",
        'bg-secondary': "var(--bg-secondary)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        'text-muted': "var(--text-muted)",
        'border-color': "var(--border-color)",
        'accent-primary': "var(--accent-primary)",
        'accent-hover': "var(--accent-hover)",
      },
    },
  },
  plugins: [],
};
