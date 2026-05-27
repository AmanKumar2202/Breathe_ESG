/** @type {import('tailwindcss').Config} */

export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {

    extend: {

      /* ========================================
         COLORS
      ======================================== */

      colors: {

        /* Text */

        text: {

          primary:
            "#0f172a",

          secondary:
            "#64748b",

          muted:
            "#94a3b8",
        },

        /* Brand */

        primary: {

          DEFAULT:
            "#2563eb",

          hover:
            "#1d4ed8",

          soft:
            "#dbeafe",
        },

        /* Accent */

        accent: {

          blue:
            "#2563eb",

          cyan:
            "#06b6d4",

          purple:
            "#8b5cf6",

          emerald:
            "#10b981",

          amber:
            "#f59e0b",

          red:
            "#ef4444",
        },

        /* ESG Scope */

        scope1:
          "#f97316",

        scope2:
          "#8b5cf6",

        scope3:
          "#0ea5e9",

        /* Surfaces */

        surface: {

          DEFAULT:
            "#ffffff",

          secondary:
            "#f8fafc",

          elevated:
            "#f1f5f9",

          dark:
            "#0f172a",
        },

        /* Borders */

        border: {

          DEFAULT:
            "#e2e8f0",

          soft:
            "#f1f5f9",

          strong:
            "#cbd5e1",
        },

        /* Status */

        success:
          "#10b981",

        warning:
          "#f59e0b",

        danger:
          "#ef4444",

        info:
          "#3b82f6",
      },

      /* ========================================
         FONT
      ======================================== */

      fontFamily: {

        sans: [
          "Inter",
          "sans-serif",
        ],
      },

      /* ========================================
         BORDER RADIUS
      ======================================== */

      borderRadius: {

        "2xl":
          "1.25rem",

        "3xl":
          "1.75rem",

        "4xl":
          "2rem",
      },

      /* ========================================
         SHADOWS
      ======================================== */

      boxShadow: {

        soft:
          "0 4px 12px rgba(15,23,42,0.04)",

        card:
          "0 10px 30px rgba(15,23,42,0.06)",

        elevated:
          "0 20px 60px rgba(15,23,42,0.10)",

        glass:
          "0 8px 32px rgba(15,23,42,0.08)",

        blue:
          "0 20px 50px rgba(37,99,235,0.18)",

        emerald:
          "0 20px 50px rgba(16,185,129,0.18)",

        red:
          "0 20px 50px rgba(239,68,68,0.18)",
      },

      /* ========================================
         BACKGROUND GRADIENTS
      ======================================== */

      backgroundImage: {

        "gradient-primary":
          "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",

        "gradient-success":
          "linear-gradient(135deg, #10b981 0%, #34d399 100%)",

        "gradient-purple":
          "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",

        "gradient-dark":
          "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",

        "gradient-surface":
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      },

      /* ========================================
         ANIMATIONS
      ======================================== */

      keyframes: {

        fadeIn: {

          "0%": {
            opacity: "0",
            transform:
              "translateY(10px)",
          },

          "100%": {
            opacity: "1",
            transform:
              "translateY(0)",
          },
        },

        float: {

          "0%, 100%": {
            transform:
              "translateY(0px)",
          },

          "50%": {
            transform:
              "translateY(-6px)",
          },
        },

        pulseGlow: {

          "0%, 100%": {
            boxShadow:
              "0 0 0 rgba(37,99,235,0)",
          },

          "50%": {
            boxShadow:
              "0 0 35px rgba(37,99,235,0.18)",
          },
        },

        shimmer: {

          "0%": {
            backgroundPosition:
              "-200% 0",
          },

          "100%": {
            backgroundPosition:
              "200% 0",
          },
        },

        slideUp: {

          "0%": {
            opacity: "0",
            transform:
              "translateY(20px)",
          },

          "100%": {
            opacity: "1",
            transform:
              "translateY(0)",
          },
        },
      },

      animation: {

        fadeIn:
          "fadeIn 0.4s ease forwards",

        float:
          "float 4s ease-in-out infinite",

        glow:
          "pulseGlow 3s infinite",

        shimmer:
          "shimmer 2s linear infinite",

        slideUp:
          "slideUp 0.5s ease forwards",
      },

      /* ========================================
         BLUR
      ======================================== */

      backdropBlur: {

        xs:
          "2px",
      },

      /* ========================================
         SPACING
      ======================================== */

      spacing: {

        18:
          "4.5rem",

        22:
          "5.5rem",

        26:
          "6.5rem",

        30:
          "7.5rem",
      },

      /* ========================================
         MAX WIDTH
      ======================================== */

      maxWidth: {

        "8xl":
          "96rem",
      },

      /* ========================================
         TRANSITIONS
      ======================================== */

      transitionTimingFunction: {

        smooth:
          "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },

  plugins: [],
};