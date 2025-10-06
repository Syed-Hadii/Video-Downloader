"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UrlInput from "./components/UrlInput";
import VideoInfo from "./components/VideoInfo";
import LoadingSpinner from "./components/LoadingSpinner";
import { fetchInfo, downloadVideo } from "./services/api";
import logo from "./assets/close-logo.png";

const THEME = {
  primary: "#f25c05",
  white: "#ffffff",
  bg: "#fafafa",
};

export default function App() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFetch = async (u, p) => {
    setError(null);
    setInfo(null);
    setLoadingInfo(true);
    setDownloadProgress(0);
    try {
      const data = await fetchInfo(u, p);
      setInfo(data);
      setUrl(u);
      setPlatform(p);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch info");
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownload = async (options = {}) => {
    // options: { format, captionLang, captions: [...], audioId? }
    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      await downloadVideo({
        url,
        platform,
        format: options.format,
        captionLang: options.captionLang || null,
        audioId: options.audioId || null,
        onProgress: (pct) => {
          setDownloadProgress(pct);
        },
        filename: options.filename, // optional
      });
      // success -> browser saved file via blob download
    } catch (err) {
      console.error(err);
      setError(err?.message || "Download failed");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 800);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ffffff 0%, #fff5f0 50%, #ffe8dc 100%)",
        padding: "0",
      }}
    >
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(242, 92, 5, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
            }}
          >
            {/* Brand Section */}
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Gexton"
                  style={{
                    width: "48px",
                    height: "48px",
                    filter: "drop-shadow(0 4px 12px rgba(242, 92, 5, 0.2))",
                  }}
                />
              </motion.div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    background:
                      "linear-gradient(135deg, #1a1a1a 0%, #f25c05 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Gexton
                </h1>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "600",
                    margin: 0,
                    letterSpacing: "0.5px",
                    // fontSize: "28px",
                    // fontWeight: "800",
                    // background:
                    //   "linear-gradient(135deg, #1a1a1a 0%, #f25c05 100%)",
                    // WebkitBackgroundClip: "text",
                    // WebkitTextFillColor: "transparent",
                    // margin: 0,
                    // letterSpacing: "-0.5px",
                  }}
                >
                  Video Downloader Pro
                </p>
              </div>
            </motion.div>

            {/* Platform Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%)",
                color: "#f25c05",
                padding: "10px 20px",
                borderRadius: "50px",
                border: "2px solid rgba(242, 92, 5, 0.2)",
                boxShadow: "0 4px 12px rgba(242, 92, 5, 0.1)",
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "700" }}>
                Multi-Platform
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(242, 92, 5, 0.08)",
          }}
        >
          <UrlInput
            defaultUrl={url}
            defaultPlatform={platform}
            onFetch={handleFetch}
            theme={THEME}
            disabled={loadingInfo || isDownloading}
          />

          <div style={{ marginTop: "24px" }}>
            {loadingInfo && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px 24px",
                }}
              >
                <LoadingSpinner theme={THEME} text="Fetching video info..." />
              </div>
            )}

            {!loadingInfo && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: "#fff5f5",
                  color: "#dc2626",
                  marginBottom: "16px",
                  border: "1px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontWeight: "500",
                }}
              >
                <svg
                  style={{ width: "20px", height: "20px", flexShrink: 0 }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </motion.div>
            )}

            <AnimatePresence>
              {info && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <VideoInfo
                    info={info}
                    platform={platform}
                    onDownload={handleDownload}
                    downloading={isDownloading}
                    progress={downloadProgress}
                    theme={THEME}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
