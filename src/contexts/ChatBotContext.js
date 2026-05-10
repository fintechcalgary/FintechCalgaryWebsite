"use client";

import { createContext, useContext, useState } from "react";

const ChatBotContext = createContext();

export function ChatBotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const openChatWithArticle = (article) => {
    setSelectedArticle(article);
    setIsMinimized(false);
    setIsOpen(true);
  };

  return (
    <ChatBotContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isMinimized,
        setIsMinimized,
        selectedArticle,
        setSelectedArticle,
        openChatWithArticle,
      }}
    >
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within ChatBotProvider");
  }
  return context;
}
