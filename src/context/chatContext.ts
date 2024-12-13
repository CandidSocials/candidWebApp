import React, { createContext, useContext, useState } from 'react';

interface ChatContextProps {
  currentRoom: string | null;
  setCurrentRoom: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ currentRoom, setCurrentRoom }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatProvider.');
  return context;
};