"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function YoutubeOptions({
  info,
  onDownload,
  downloading,
  progress,
  theme,
}) {
  // info.formats is array of { itag, resolution, ... }
  const { formats = [], best_combined_itag = null } = info;
  // default selected is the best_combined_itag (if present) else first format itag
  const [selectedItag, setSelectedItag] = useState(
    best_combined_itag || (formats[0] && String(formats[0].itag)) || "best"
  );
  const [visible, setVisible] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (best_combined_itag) setSelectedItag(String(best_combined_itag));
    else if (formats.length) setSelectedItag(String(formats[0].itag));
  }, [formats, best_combined_itag]);

  useEffect(() => {
    let interval;
    if (downloading) {
      setVisible(true);
      setDisplayProgress(0);
      interval = setInterval(() => {
        setDisplayProgress((prev) => (prev < 90 ? prev + 1 : prev));
      }, 200);
    } else if (!downloading && progress === 100) {
      setDisplayProgress((prev) => (prev < 100 ? 100 : prev));
      setTimeout(() => setVisible(false), 1000);
    }
    return () => clearInterval(interval);
  }, [downloading, progress]);

  const handleDownload = () => {
    // pass numeric itag string (or "best")
    onDownload({ format: selectedItag });
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            color: "#666",
            marginBottom: "12px",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            style={{ width: "16px", height: "16px" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          Quality
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {formats.length ? (
            formats.map((f) => (
              <motion.button
                key={String(f.itag)}
                onClick={() => setSelectedItag(String(f.itag))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border:
                    selectedItag === String(f.itag)
                      ? `2px solid ${theme.primary}`
                      : "2px solid #e5e5e5",
                  background:
                    selectedItag === String(f.itag)
                      ? "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)"
                      : "#ffffff",
                  color: selectedItag === String(f.itag) ? "#fff" : "#1a1a1a",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow:
                    selectedItag === String(f.itag)
                      ? "0 4px 12px rgba(242, 92, 5, 0.25)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {f.resolution}
              </motion.button>
            ))
          ) : (
            <motion.button
              onClick={() => setSelectedItag("best")}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: `2px solid ${theme.primary}`,
                background: "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              Best
            </motion.button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <motion.button
          onClick={handleDownload}
          whileHover={{ scale: downloading ? 1 : 1.03 }}
          whileTap={{ scale: downloading ? 1 : 0.97 }}
          disabled={downloading}
          style={{
            padding: "14px 32px",
            borderRadius: "12px",
            border: "none",
            background: downloading
              ? "#d1d5db"
              : "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)",
            color: "#fff",
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
          {downloading ? "Downloading..." : "Download Video"}
        </motion.button>

        {visible && (
          <div style={{ flex: "1 1 300px", minWidth: "250px" }}>
            <LoadingBar progress={displayProgress} color={theme.primary} />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingBar({ progress = 0, color = "#f25c05" }) {
  return (
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
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
          style={{
            height: "100%",
            borderRadius: "999px",
            background: `linear-gradient(90deg, ${color}, #ff7a2f)`,
          }}
        />
      </div>
    </div>
  );
}
