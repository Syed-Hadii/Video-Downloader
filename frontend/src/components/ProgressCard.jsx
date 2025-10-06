import { motion } from "framer-motion";

export function ProgressCard({ progress, status, onCancel }) {
  const getStatusMessage = () => {
    if (progress < 30) return "Initializing download...";
    if (progress < 70) return "Downloading your video...";
    if (progress < 95) return "Finalizing download...";
    return "Almost done!";
  };

  const getSpeedIndicator = () => {
    if (progress < 20) return "🔄 Starting";
    if (progress < 50) return "⚡ Fast";
    if (progress < 80) return "📊 Steady";
    return "🎉 Finishing";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Downloading Video
          </h4>
          <p className="text-sm text-gray-600 mt-1">{getStatusMessage()}</p>
        </div>
        <motion.span
          key={progress}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-primary-600"
        >
          {Math.min(progress, 100).toFixed(0)}%
        </motion.span>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{getSpeedIndicator()}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
            }}
            className="h-full bg-gradient-to-r from-primary-500 to-orange-500 relative"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />

            {/* Progress dots */}
            {progress > 10 && progress < 95 && (
              <motion.div
                animate={{
                  x: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-0 w-4 h-full bg-white/30 rounded-full"
              />
            )}
          </motion.div>

          {/* Progress steps */}
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {[0, 25, 50, 75, 100].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  progress >= step ? "bg-white/50" : "bg-gray-300/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Loading Animation */}
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>

          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-2 border-primary-200 border-t-primary-500 rounded-full"
          />
        </motion.div>

        <div className="text-center space-y-2">
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-600 font-medium"
          >
            {getStatusMessage()}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            Your video will download automatically when ready
          </motion.p>
        </div>

        {/* Cancel Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onCancel}
          className="px-6 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Cancel Download</span>
        </motion.button>
      </div>

      {/* Download Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 text-center"
      >
        <div>
          <div className="text-2xl font-bold text-primary-600">
            {Math.min(progress, 100)}%
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {progress < 50 ? "🔄" : progress < 80 ? "⚡" : "📊"}
          </div>
          <div className="text-xs text-gray-600">Status</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {progress < 30 ? "..." : progress < 70 ? "⏳" : "🎯"}
          </div>
          <div className="text-xs text-gray-600">Phase</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
