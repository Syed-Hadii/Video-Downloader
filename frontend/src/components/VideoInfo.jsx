"use client";
import YoutubeOptions from "./YoutubeOptions";
import SimpleDownload from "./SimpleDownload";
import { motion } from "framer-motion";

export default function VideoInfo({
  info,
  platform,
  onDownload,
  downloading,
  progress,
  theme,
}) {
  const { title, thumbnail, duration } = info;

  return (
    <motion.div
      layout
      style={{
        marginTop: "24px",
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          minWidth: "240px",
          maxWidth: "360px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          border: "2px solid #f0f0f0",
        }}
      >
        {thumbnail ? (
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={title}
            style={{ width: "100%", display: "block" }}
          />
        ) : (
          <div
            style={{
              padding: "48px 24px",
              background: "#fafafa",
              color: "#999",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            No thumbnail available
          </div>
        )}
      </motion.div>

      <div style={{ flex: "1 1 420px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1.4",
          }}
        >
          {title}
        </h2>
        {typeof duration !== "undefined" && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "12px",
              padding: "6px 12px",
              background: "#fff5f0",
              borderRadius: "8px",
              border: "1px solid rgba(242, 92, 5, 0.2)",
            }}
          >
            <svg
              style={{ width: "16px", height: "16px", color: theme.primary }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span
              style={{
                color: theme.primary,
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {formatDuration(duration)}
            </span>
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          {platform === "youtube" ? (
            <YoutubeOptions
              info={info}
              onDownload={onDownload}
              downloading={downloading}
              progress={progress}
              theme={theme}
            />
          ) : (
            <SimpleDownload
              info={info}
              onDownload={onDownload}
              downloading={downloading}
              progress={progress}
              theme={theme}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatDuration(sec) {
  if (!sec && sec !== 0) return "N/A";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
