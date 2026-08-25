import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Loader2,
  FileText,
  Bot,
  RefreshCw,
  Sparkles,
  HeartPulse,
  User, // ✅ FIX: Import User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AIHealthReportSummarizer = () => {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // ✅ More natural summary cleanup
  const cleanAIResponse = (text) => {
    const formatted = text
      .replace(/\*\*/g, "")
      .replace(/^- /gm, "• ")
      .replace(/\n{2,}/g, "\n")
      .replace(/Patient/gi, "The patient")
      .trim();

    return `🩺 **Doctor’s Insight**\n\n${formatted}\n\n💬 _This summary is simplified for better understanding of your health report._`;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSummarize = async () => {
    if (!file) return alert("Please upload a health report first!");

    setLoading(true);
    const formData = new FormData();
    formData.append("report", file);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `📄 Uploaded: ${file.name}` },
    ]);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reportsummary/summarize`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const aiText = cleanAIResponse(data.summary || "No summary generated.");

      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      let index = 0;
      const typingInterval = setInterval(() => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (!lastMsg) return prev;

          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + aiText.charAt(index),
          };
          return updated;
        });
        index++;
        if (index >= aiText.length) clearInterval(typingInterval);
      }, 15);
    } catch (err) {
      console.error(err);
      alert("⚠️ Error: Could not summarize the report. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMessages([]);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 p-6 overflow-hidden font-inter">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.08),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_70%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.1)] rounded-3xl p-8"
      >
        <div className="flex justify-center items-center gap-3 mb-5">
          <HeartPulse className="text-green-600 w-8 h-8 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-gray-800 text-center">
            AI Health Report Summarizer
          </h2>
          <Sparkles className="text-blue-500 w-5 h-5 animate-pulse" />
        </div>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Upload your medical report and get a **doctor-style natural explanation** ✨
        </p>

        {/* Upload Box */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-white/60 transition-all duration-300 shadow-inner"
        >
          <UploadCloud className="text-green-500 mx-auto" size={45} />
          <p className="text-gray-700 mt-2 font-medium">
            Drop or upload your health report (.pdf / .txt)
          </p>

          <input
            type="file"
            accept=".pdf,.txt"
            className="mt-3 text-sm text-gray-700 cursor-pointer"
            onChange={handleFileChange}
          />

          <div className="flex justify-center gap-3 mt-6">
            <motion.button
              onClick={handleSummarize}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              animate={
                loading
                  ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } }
                  : {}
              }
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Summarizing...
                </>
              ) : (
                <>✨ Generate Summary</>
              )}
            </motion.button>

            {messages.length > 0 && (
              <motion.button
                onClick={handleReset}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Reset
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          layout
          className="mt-6 space-y-4 max-h-[420px] overflow-y-auto p-4 rounded-2xl bg-white/70 border border-gray-200 shadow-inner backdrop-blur-md"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-2 ${
                  msg.role === "ai" ? "justify-start" : "justify-end"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="bg-green-100 p-2 rounded-full shadow-sm">
                    <Bot className="text-green-700" size={20} />
                  </div>
                )}

                <motion.div
                  layout
                  className={`p-3 rounded-2xl max-w-[75%] text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.role === "ai"
                      ? "bg-white text-gray-800 border border-gray-200"
                      : "bg-green-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </motion.div>

                {msg.role === "user" && (
                  <div className="bg-green-200 p-2 rounded-full shadow-sm">
                    <User className="text-green-700" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 justify-start mt-3"
            >
              <div className="bg-green-100 p-2 rounded-full shadow-sm">
                <Bot className="text-green-700" size={20} />
              </div>
              <div className="p-3 rounded-2xl bg-white text-gray-700 border border-gray-200 shadow-sm text-sm">
                Analyzing your report with medical precision... 🔬
                <div className="flex gap-1 mt-1">
                  <span className="animate-bounce delay-0">•</span>
                  <span className="animate-bounce delay-150">•</span>
                  <span className="animate-bounce delay-300">•</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef}></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIHealthReportSummarizer;
