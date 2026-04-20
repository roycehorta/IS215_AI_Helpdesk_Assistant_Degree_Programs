// frontend/src/pages/ChatPage.tsx
import { FC } from 'react';
import ChatBot from '../components/Chatbot';

interface ChatPageProps {
  chatState: any; // Using 'any' here briefly to save type space, but it holds the hook return values
}

const ChatPage: FC<ChatPageProps> = ({ chatState }) => {
  return (
    <div className="flex items-center justify-center h-full animate-fade-in">
      <ChatBot {...chatState} />
    </div>
  );
};

export default ChatPage;