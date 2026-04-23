import { FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types/chat";

const animatedCache = new Set<string>();

interface ChatMessageProps {
  message: Message;
  index?: number;
  isNew?: boolean;
  onQuickReply?: (text: string) => void;
  onAnimationComplete?: () => void;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, isNew = false, index = 0, onQuickReply, onAnimationComplete }) => {
  const isBot = message.sender === "bot";
  const rawText = typeof message.text === "string" ? message.text : String(message.text ?? "");
  const cacheKey = `${message.sender}-${message.timestamp ?? index}`;
  const isAlreadyAnimated = !isNew || (isBot && animatedCache.has(cacheKey));
  const [displayedText, setDisplayedText] = useState(isAlreadyAnimated ? rawText : isBot ? "" : rawText);

  useEffect(() => {
    if (isBot && !isAlreadyAnimated) {
      if (displayedText.length < rawText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(rawText.slice(0, displayedText.length + 1));
        }, 5);
        return () => clearTimeout(timeout);
      } else {
        animatedCache.add(cacheKey);
        onAnimationComplete?.();
      }
    }
  }, [displayedText, rawText, isBot, isAlreadyAnimated]);

  return (
    <div className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} mb-6`}>
      {message.sender === "bot" ? (
        <div className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          <img src="/oblation.png" alt="UP" className="w-10 h-10 object-contain" />
        </div>
      ) : (
        <div className="shrink-0 w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-md font-bold">
          Me
        </div>
      )}
      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-left ${message.sender === "user" ? "bg-[#7b1113] text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"}`}>
        <div className="prose prose-sm max-w-none prose-p:my-3 prose-p:leading-relaxed prose-li:my-1.5 prose-ul:my-3 prose-ol:my-3 prose-headings:text-[#7b1113] prose-headings:mt-4 prose-headings:mb-2 prose-strong:font-semibold prose-strong:text-gray-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-thead:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:text-gray-600 prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:text-sm prose-td:align-top prose-tr:even:bg-gray-50 overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }: any) => {
                if (href === "#action") {
                  return (
                    <button onClick={() => onQuickReply?.(String(children))} className="text-[#7b1113] underline font-bold bg-transparent border-none p-0 cursor-pointer hover:text-red-900 transition-colors text-left inline-block">
                      {children}
                    </button>
                  );
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium hover:text-blue-800">
                    {children}
                  </a>
                );
              },
            } as any}
          >
            {displayedText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;