"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UrlInput({
  defaultUrl = "",
  defaultPlatform = "youtube",
  onFetch,
  theme,
  disabled,
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [platform, setPlatform] = useState(defaultPlatform);
  const [status, setStatus] = useState("idle"); 

  const handleFetch = async () => {
    if (!url) return alert("Please paste a video URL first");
    try {
      setStatus("fetching");
      await onFetch(url.trim(), platform);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: "#fafafa",
        borderRadius: "16px",
        padding: "24px",
        border: "2px solid #f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* URL Input */}
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "16px",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <svg
              style={{ width: "20px", height: "20px", color: "#999" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="Paste video URL here..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              border: "2px solid #e5e5e5",
              borderRadius: "12px",
              fontSize: "15px",
              outline: "none",
              transition: "all 0.2s",
              background: "#ffffff",
              color: "#1a1a1a",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary;
              e.target.style.boxShadow = `0 0 0 3px rgba(242, 92, 5, 0.1)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e5e5";
              e.target.style.boxShadow = "none";
            }}
            disabled={disabled || status === "fetching"}
          />
        </div>

        {/* Platform Dropdown */}
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{
            padding: "14px 16px",
            border: "2px solid #e5e5e5",
            borderRadius: "12px",
            fontSize: "15px",
            outline: "none",
            background: "#ffffff",
            color: "#1a1a1a",
            fontWeight: "600",
            cursor: "pointer",
            minWidth: "140px",
          }}
          disabled={disabled || status === "fetching"}
        >
          <option value="youtube">YouTube</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
        </select>

        {/* Fetch Button */}
        <motion.button
          whileHover={{ scale: status !== "fetching" ? 1.03 : 1 }}
          whileTap={{ scale: status !== "fetching" ? 0.97 : 1 }}
          onClick={handleFetch}
          disabled={disabled || status === "fetching" || !url}
          style={{
            background:
              disabled || status === "fetching" || !url
                ? "#d1d5db"
                : "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)",
            color: "#ffffff",
            padding: "14px 32px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "15px",
            border: "none",
            cursor:
              disabled || status === "fetching" || !url
                ? "not-allowed"
                : "pointer",
            boxShadow:
              disabled || status === "fetching" || !url
                ? "none"
                : "0 4px 14px rgba(242, 92, 5, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minWidth: "160px",
            transition: "all 0.2s",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "fetching" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "3px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Analyzing...</span>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  style={{ width: "20px", height: "20px" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Get Info</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </motion.div>
  );
}
