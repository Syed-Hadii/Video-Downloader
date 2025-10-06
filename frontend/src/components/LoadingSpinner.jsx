"use client";
import { motion } from "framer-motion";

export default function LoadingSpinner({ theme, text = "Loading..." }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 1,
          ease: "linear",
        }}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "4px solid #f0f0f0",
          borderTop: `4px solid ${theme.primary}`,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          color: "#1a1a1a",
          fontWeight: "600",
          fontSize: "15px",
        }}
      >
        {text}
      </div>
    </div>
  );
}
