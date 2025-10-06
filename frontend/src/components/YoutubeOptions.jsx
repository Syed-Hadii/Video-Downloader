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
  const { formats = [], captions = [], audioTracks = [] } = info;
  const [selectedFormat, setSelectedFormat] = useState(
    formats.length ? formats[0].resolution : "720p"
  );
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(
    audioTracks.length ? audioTracks[0].id : null
  );

  useEffect(() => {
    if (formats && formats.length) {
      setSelectedFormat(formats[0].resolution);
    }
    if (audioTracks && audioTracks.length && !selectedAudio) {
      setSelectedAudio(audioTracks[0].id);
    }
  }, [formats, audioTracks]);

  const handleDownload = () => {
    const captionLang = selectedCaption || null;
    onDownload({ format: selectedFormat, captionLang, audioId: selectedAudio });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {/* Resolutions */}
        <div style={{ minWidth: "200px" }}>
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
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {formats.map((f) => (
              <motion.button
                key={f.itag || f.resolution}
                onClick={() => setSelectedFormat(f.resolution)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border:
                    selectedFormat === f.resolution
                      ? `2px solid ${theme.primary}`
                      : "2px solid #e5e5e5",
                  background:
                    selectedFormat === f.resolution
                      ? "linear-gradient(135deg, #f25c05 0%, #ff7a2f 100%)"
                      : "#ffffff",
                  color:
                    selectedFormat === f.resolution ? "#ffffff" : "#1a1a1a",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow:
                    selectedFormat === f.resolution
                      ? "0 4px 12px rgba(242, 92, 5, 0.25)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {f.resolution}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Subtitles (owner-provided) */}
        <div style={{ minWidth: "200px" }}>
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
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            Subtitles (owner-provided)
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {captions.length ? (
              captions.map((c) => (
                <label
                  key={c.lang}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background:
                      selectedCaption === c.lang ? "#fff5f0" : "#fafafa",
                    border:
                      selectedCaption === c.lang
                        ? `2px solid ${theme.primary}`
                        : "2px solid #e5e5e5",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name="captions"
                    checked={selectedCaption === c.lang}
                    onChange={() => setSelectedCaption(c.lang)}
                    style={{ accentColor: theme.primary }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                    }}
                  >
                    {c.name ? `${c.name} (${c.lang})` : c.lang}
                  </span>
                </label>
              ))
            ) : (
              <div
                style={{
                  color: "#999",
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                No official subtitles available
              </div>
            )}
          </div>
        </div>

        {/* Audio / Owner-set audio tracks (dubs) */}
        <div style={{ minWidth: "180px" }}>
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
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
            Audio Track (owner / dub)
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {audioTracks.length ? (
              audioTracks.map((a) => (
                <label
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: selectedAudio === a.id ? "#fff5f0" : "#fafafa",
                    border:
                      selectedAudio === a.id
                        ? `2px solid ${theme.primary}`
                        : "2px solid #e5e5e5",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name="audio"
                    checked={selectedAudio === a.id}
                    onChange={() => setSelectedAudio(a.id)}
                    style={{ accentColor: theme.primary }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                    }}
                  >
                    {a.label ||
                      (a.language_name
                        ? `${a.language_name} (${a.lang || a.language})`
                        : a.lang || a.language)}
                  </span>
                </label>
              ))
            ) : (
              <div
                style={{
                  color: "#999",
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                Default audio (no additional audio tracks)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button and Progress */}
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
          {downloading ? "Downloading..." : "Download Video"}
        </motion.button>

        <div style={{ flex: "1 1 300px", minWidth: "250px" }}>
          {downloading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <LoadingBar progress={progress} color={theme.primary} />
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
              Select your preferred options above
            </div>
          )}
        </div>
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
          style={{
            height: "100%",
            borderRadius: "999px",
            background: `linear-gradient(90deg, ${color}, #ff7a2f)`,
            transition: "width 200ms linear",
          }}
        />
      </div>
    </div>
  );
}
