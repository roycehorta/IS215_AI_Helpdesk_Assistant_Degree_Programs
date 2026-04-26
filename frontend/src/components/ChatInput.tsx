// frontend/src/components/ChatInput.tsx
import React from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean; // This comes from isTyping in your parent component
}

export const ChatInput: React.FC<Props> = ({ onSend, disabled }) => {
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="p-3 bg-white border-t flex items-center gap-2">
      <input
        type="text"
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        // 1. Dynamic Placeholder
        placeholder={disabled ? "Advisor is thinking..." : "Type a message..."}
        // 2. Conditional Styling for "Greyed Out" effect
        className={`flex-1 border rounded-full px-4 py-2 text-sm outline-none transition-all ${
          disabled 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
            : "bg-white border-gray-300 focus:ring-2 focus:ring-[#7b1113]"
        }`}
      />
      <button 
        onClick={handleSend} 
        disabled={disabled || !input.trim()}
        // 3. Button Lock styling
        className={`p-2 rounded-full transition-colors ${
          disabled || !input.trim()
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-[#7b1113] text-white hover:bg-[#5a0d0e] shadow-md"
        }`}
      >
        {/* Simple Send Icon or Text */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  );
};