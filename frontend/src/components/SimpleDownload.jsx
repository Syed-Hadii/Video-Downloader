"use client";
import { motion } from "framer-motion";

export default function SimpleDownload({
  info,
  onDownload,
  downloading,
  progress,
  theme,
}) {
  const handle = () => {
    onDownload({});
  };

  return (
    <div>
      <div
        style={{
          color: "#666",
          marginBottom: "16px",
          fontSize: "15px",
          lineHeight: "1.6",
          padding: "12px 16px",
          background: "#fafafa",
          borderRadius: "10px",
          border: "1px solid #e5e5e5",
        }}
      >
        This platform provides the original uploaded file. Click the button
        below to start downloading.
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <motion.button
          onClick={handle}
          whileHover={{ scale: downloading ? 1 : 1.03 }}
          whileTap={{ scale: downloading ? 1 : 0.97 }}
          style={{
            padding: "14px 32px",
            borderRadius: "12px",
            border: "none",
            background: downloading
              ? "#d1d5db"
              : "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "16px",
            cursor: downloading ? "not-allowed" : "pointer",
            boxShadow: downloading
              ? "none"
              : "0 6px 20px rgba(242, 92, 5, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          disabled={downloading}
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {downloading ? "Downloading..." : "Download Original"}
        </motion.button>

        <div style={{ flex: "1 1 300px", minWidth: "250px" }}>
          {downloading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "10px",
                    borderRadius: "999px",
                    background: "#f0f0f0",
                    overflow: "hidden",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                    }}
                    style={{
                      height: "100%",
                      borderRadius: "999px",
                      background: `linear-gradient(90deg, ${theme.primary}, #ff7a2f)`,
                      transition: "width 200ms linear",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  fontSize: "15px",
                  color: theme.primary,
                  fontWeight: "700",
                  minWidth: "45px",
                }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "#999",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Ready to download
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
