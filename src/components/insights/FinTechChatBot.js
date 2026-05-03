"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX, FiSend, FiZap, FiMinimize2, FiMaximize2, FiTrendingUp, FiBook, FiBriefcase, FiTarget, FiBarChart2, FiRefreshCw, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { useChatBot } from "@/contexts/ChatBotContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { CostTracker } from "@/lib/costTracker";

const MAX_MESSAGE_LENGTH = 2000;
const STORAGE_KEY = "fintech_chat_messages";

export default function FinTechChatBot({ articles = [] }) {
  const { isOpen: contextIsOpen, setIsOpen: setContextIsOpen, isMinimized: contextIsMinimized, setIsMinimized: setContextIsMinimized, selectedArticle, setSelectedArticle } = useChatBot();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [costStatus, setCostStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { canSend, retryAfter, recordRequest } = useRateLimit(2, 60000);
  const costTracker = useRef(new CostTracker());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
      }
    }
  }, [messages]);

  useEffect(() => {
    setIsOpen(contextIsOpen);
    setIsMinimized(contextIsMinimized);
  }, [contextIsOpen, contextIsMinimized]);

  useEffect(() => {
    if (selectedArticle && contextIsOpen) {
      const analysisPrompt = `Analyze this article in detail:\n\nTitle: ${selectedArticle.title}\nSource: ${selectedArticle.source}\nDate: ${selectedArticle.date || selectedArticle.publishedAt}\nSummary: ${selectedArticle.summary || 'No summary available'}\n\nProvide a comprehensive analysis and be ready to answer questions about it.`;

      setMessages([
        {
          role: "assistant",
          content: `I've loaded the article "${selectedArticle.title}" for analysis. Ask me anything about it - I can provide deeper insights, explain key concepts, discuss implications, or answer specific questions.`,
        },
      ]);

      setTimeout(() => {
        sendQuickAction(analysisPrompt, selectedArticle);
      }, 500);

      setSelectedArticle(null);
    }
  }, [selectedArticle, contextIsOpen]);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      const welcomeMessage = selectedArticle 
        ? `Hi! I can help you analyze this article: "${selectedArticle.title}". Ask me any questions about it, and I'll provide detailed insights.`
        : "Hello! I'm your FinTech AI assistant. To get the most out of our conversation, navigate to an article you'd like to learn about or are curious about, then use the magnifying glass (🔍) to analyze it with AI. This helps me provide more targeted insights about specific articles and build your financial literacy. What would you like to explore?";
      
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage
        },
      ]);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, selectedArticle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen) {
      const status = costTracker.current.getStatus();
      setCostStatus(status);
    }
  }, [isOpen]);

  // ── Shared API call ──────────────────────────────────────────────────────
  // Both handleSend and sendQuickAction delegate here to avoid duplication.
  const callChatApi = async ({ userMessage, articlesToSend, onRetry }) => {
    setIsLoading(true);
    setIsTyping(true);
    setErrorMessage(null);
    recordRequest();

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: updatedMessages.slice(-10),
          articles: articlesToSend,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.response) {
        costTracker.current.trackChatRequest();
        setCostStatus(costTracker.current.getStatus());
        setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
      } else {
        setMessages([...updatedMessages, {
          role: "assistant",
          content: `Sorry, I encountered an error: ${data.error || "Unknown error"}. Click to retry.`,
          error: true,
          retry: onRetry,
        }]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === "AbortError";
      if (!isTimeout) console.error("Chat error:", error);
      setMessages([...updatedMessages, {
        role: "assistant",
        content: isTimeout
          ? "Request timed out. Please try a shorter question or click to retry."
          : "Connection error. Please check your connection and click to retry.",
        error: true,
        retry: onRetry,
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const checkLimits = () => {
    const currentStatus = costTracker.current.getStatus();
    setCostStatus(currentStatus);

    if (!costTracker.current.canMakeRequest("chat")) {
      setErrorMessage(
        currentStatus.isAtLimit
          ? `Monthly budget reached ($${currentStatus.costSoFar.toFixed(2)} / $${currentStatus.budget.toFixed(2)}). Resets next month.`
          : `Usage limit approaching. ${currentStatus.remainingChatRequests} requests remaining this month.`
      );
      setTimeout(() => setErrorMessage(null), 8000);
      return false;
    }

    if (!canSend) {
      setErrorMessage(`Rate limit: please wait ${retryAfter}s before sending another message.`);
      setTimeout(() => setErrorMessage(null), 5000);
      return false;
    }

    return true;
  };

  const handleSend = async (retryMessage = null) => {
    const messageToSend = (retryMessage || input).trim();
    if (!messageToSend || isLoading) return;

    if (messageToSend.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      setTimeout(() => setErrorMessage(null), 3000);
      setInput(messageToSend.substring(0, MAX_MESSAGE_LENGTH));
      return;
    }

    if (!checkLimits()) return;
    if (!retryMessage) setInput("");

    await callChatApi({
      userMessage: messageToSend,
      articlesToSend: articles.slice(0, 30),
      onRetry: () => handleSend(messageToSend),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend && !isLoading) handleSend();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setInput(value);
    } else {
      setInput(value.substring(0, MAX_MESSAGE_LENGTH));
      setErrorMessage(`Message limited to ${MAX_MESSAGE_LENGTH} characters.`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const sendQuickAction = async (prompt, articleContext = null) => {
    if (isLoading) return;
    if (!checkLimits()) return;

    const articlesToSend = articleContext
      ? [articleContext, ...articles.slice(0, 29)]
      : articles.slice(0, 30);

    await callChatApi({
      userMessage: prompt,
      articlesToSend,
      onRetry: () => sendQuickAction(prompt, articleContext),
    });
  };

  const quickActions = [
    { icon: FiZap, label: "Weekly Summary", prompt: "Give me a comprehensive weekly summary of the most important FinTech news and events.", color: "from-primary to-purple-600" },
    { icon: FiTrendingUp, label: "Top Trends", prompt: "What are the top FinTech trends I should be watching right now?", color: "from-purple-500 to-pink-500" },
    { icon: FiBook, label: "For Students", prompt: "I'm a student interested in FinTech. What should I learn, explore, and focus on? Give me advice on career paths, skills to develop, and trends to watch.", color: "from-blue-500 to-cyan-500" },
    { icon: FiBriefcase, label: "Career Advice", prompt: "What career opportunities and paths are available in FinTech? What skills are in demand?", color: "from-green-500 to-emerald-500" },
    { icon: FiTarget, label: "Explore Areas", prompt: "What are the most exciting areas in FinTech to explore right now? What should I focus on?", color: "from-orange-500 to-red-500" },
    { icon: FiBarChart2, label: "Market Insights", prompt: "What are the key market developments, funding rounds, and partnerships happening in FinTech?", color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            setContextIsOpen(true);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl shadow-2xl hover:shadow-primary/50 flex items-center justify-center text-white z-50 border-2 border-white/20 backdrop-blur-sm transition-all duration-300"
          style={{
            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <FiMessageCircle className="w-7 h-7 drop-shadow-lg" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed ${
              isMinimized ? "bottom-8 right-8 w-80 h-20" : "bottom-8 right-8 w-[420px] h-[680px]"
            } bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl z-50 flex flex-col overflow-hidden`}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 via-purple-600/10 to-pink-600/10 border-b border-primary/20 backdrop-blur-sm">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                    <FiZap className="w-5.5 h-5.5 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-sm"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] tracking-tight">FinTech AI Assistant</h3>
                  <p className="text-xs text-gray-400 font-medium">Powered by Groq</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const newMinimized = !isMinimized;
                    setIsMinimized(newMinimized);
                    setContextIsMinimized(newMinimized);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-gray-400 hover:text-primary hover:scale-110"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <FiMaximize2 className="w-4 h-4" /> : <FiMinimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setContextIsOpen(false);
                    setContextIsMinimized(false);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-200 text-gray-400 hover:text-red-400 hover:scale-110"
                  title="Close"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && costStatus && (
              <div className={`px-4 py-3 border-b border-gray-800/50 ${
                costStatus.isAtLimit 
                  ? 'bg-red-900/30 border-red-500/30' 
                  : costStatus.isNearLimit 
                    ? 'bg-yellow-900/30 border-yellow-500/30'
                    : 'bg-gradient-to-b from-gray-900/50 to-transparent'
              }`}>
                <div className="flex items-center gap-2 text-xs">
                  {costStatus.isAtLimit ? (
                    <FiAlertTriangle className="w-4 h-4 text-red-400" />
                  ) : costStatus.isNearLimit ? (
                    <FiAlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <FiInfo className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        costStatus.isAtLimit 
                          ? 'text-red-400' 
                          : costStatus.isNearLimit 
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                      }`}>
                        {costStatus.chatRequests || 0} / {(costStatus.remainingChatRequests || 0) + (costStatus.chatRequests || 0)} requests
                      </span>
                      <span className={`${
                        costStatus.isAtLimit 
                          ? 'text-red-400' 
                          : costStatus.isNearLimit 
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                      }`}>
                        $${(costStatus.costSoFar || 0).toFixed(3)} / $${(costStatus.budget || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            costStatus.isAtLimit 
                              ? 'bg-red-400' 
                              : costStatus.isNearLimit 
                                ? 'bg-yellow-400'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, costStatus.budgetUsed || 0)}%` }}
                        />
                      </div>
                    </div>
                    {costStatus.isNearLimit && (
                      <p className={`mt-1 text-xs ${
                        costStatus.isAtLimit ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {costStatus.isAtLimit 
                          ? 'Monthly budget reached. Resets next month.'
                          : `${costStatus.remainingChatRequests || 0} requests remaining this month.`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isMinimized && (
              <>
                <div className="px-4 py-4 border-b border-gray-800/50 bg-gradient-to-b from-gray-900/50 to-transparent">
                  <div className="grid grid-cols-2 gap-2.5">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => sendQuickAction(action.prompt)}
                          disabled={isLoading}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-3 text-xs font-semibold text-white bg-gradient-to-br ${action.color} hover:opacity-95 border border-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm`}
                          style={{
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Icon className="w-4 h-4 drop-shadow-sm" />
                          <span className="tracking-tight">{action.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-gray-950/50 via-gray-900/30 to-gray-950/50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3.5 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-primary/30 via-purple-600/30 to-pink-600/30 text-white border border-primary/40 shadow-lg"
                            : msg.error
                            ? "bg-gradient-to-br from-red-900/30 to-red-800/20 text-red-100 border border-red-500/40 shadow-lg backdrop-blur-sm"
                            : "bg-gradient-to-br from-gray-800/80 to-gray-800/60 text-gray-100 border border-gray-700/40 shadow-lg backdrop-blur-sm"
                        }`}
                        style={{
                          boxShadow: msg.role === "user"
                            ? "0 8px 16px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                            : "0 8px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div className="text-[14px] leading-relaxed font-normal">
                          {msg.error && msg.retry && (
                            <button
                              onClick={msg.retry}
                              className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs text-red-300 transition-all"
                            >
                              <FiRefreshCw className="w-3 h-3" />
                              Retry
                            </button>
                          )}
                          {(typeof msg.content === 'string' ? msg.content : String(msg.content || ''))
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/\*(.*?)\*/g, '$1')
                            .split('\n\n')
                            .map((paragraph, pIdx) => {
                              if (!paragraph.trim()) return null;
                              const lines = paragraph.split('\n');
                              const firstLine = lines[0]?.trim();
                              const restLines = lines.slice(1).filter(l => l.trim());
                              const isHeader = firstLine &&
                                                firstLine.length < 50 &&
                                                restLines.length > 0 &&
                                                !firstLine.endsWith('.') &&
                                                !firstLine.endsWith('!') &&
                                                !firstLine.endsWith('?');

                              return (
                                <div key={pIdx} className={pIdx > 0 ? "mt-4" : ""}>
                                  {isHeader ? (
                                    <>
                                      <h4 className="font-semibold text-white mb-1.5 text-[15px] tracking-tight">
                                        {firstLine}
                                      </h4>
                                      {restLines.map((line, lIdx) => (
                                        <p key={lIdx} className="text-gray-200 mb-1 leading-relaxed">
                                          {line.trim()}
                                        </p>
                                      ))}
                                    </>
                                  ) : (
                                    lines.map((line, lIdx) => {
                                      const trimmed = line.trim();
                                      if (!trimmed) return null;
                                      return (
                                        <p key={lIdx} className="text-gray-100 mb-1.5 leading-relaxed">
                                          {trimmed}
                                        </p>
                                      );
                                    })
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(isLoading || isTyping) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 text-gray-100 border border-gray-700/40 rounded-2xl px-4 py-3.5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 mr-2">AI is typing</span>
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-5 py-4 border-t border-gray-800/50 bg-gradient-to-t from-gray-900/80 to-gray-900/50 backdrop-blur-sm">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      {errorMessage && (
                        <div className="absolute -top-8 left-0 right-0 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-500/30">
                          {errorMessage}
                        </div>
                      )}
                      {!canSend && (
                        <div className="absolute -top-8 left-0 right-0 text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/30">
                          Rate limit: Please wait {retryAfter}s before sending another message.
                        </div>
                      )}
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about FinTech..."
                        className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none max-h-32 transition-all duration-200 backdrop-blur-sm"
                        style={{
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.05)",
                        }}
                        rows={1}
                        disabled={isLoading || !canSend}
                        maxLength={MAX_MESSAGE_LENGTH}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        {input.length}/{MAX_MESSAGE_LENGTH}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading || !canSend}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg hover:shadow-xl border border-white/20"
                      style={{
                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                      title={!canSend ? `Rate limit: wait ${retryAfter}s` : "Send message"}
                    >
                      <FiSend className="w-4.5 h-4.5 drop-shadow-sm" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center font-medium">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded text-[10px] border border-gray-700/50">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-gray-800/50 rounded text-[10px] border border-gray-700/50">Shift+Enter</kbd> for new line
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
