// frontend/src/components/ChatMessage.tsx
import { FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types/chat";

// 1. THE MODULE CACHE: This sits outside the component.
// It survives route changes and remembers exactly what has been animated.
const animatedCache = new Set<string>();

interface ChatMessageProps {
  message: Message;
  onQuickReply?: (text: string) => void;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, onQuickReply }) => {
  const isBot = message.sender === "bot";
  const rawText =
    typeof message.text === "string"
      ? message.text
      : String(message.text ?? "");

  // 1. Check if we already finished animating this exact text before
  const isAlreadyAnimated = isBot && animatedCache.has(rawText);

  // 2. IMPORTANT: If already animated, start with the FULL text immediately.
  // This prevents the "only showing first character" bug on route change.
  const [displayedText, setSetDisplayedText] = useState(
    isAlreadyAnimated ? rawText : isBot ? "" : rawText,
  );

  useEffect(() => {
    // 3. Only run the typing animation if it's a bot message AND NOT in cache
    if (isBot && !isAlreadyAnimated) {
      if (displayedText.length < rawText.length) {
        const timeout = setTimeout(() => {
          setSetDisplayedText(rawText.slice(0, displayedText.length + 1));
        }, 5);
        return () => clearTimeout(timeout);
      } else {
        // 4. Once finished, add to cache so it doesn't repeat on navigation
        animatedCache.add(rawText);
      }
    }
  }, [displayedText, rawText, isBot, isAlreadyAnimated]);

  return (
    <div
      className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} mb-6`}
    >
      <div
        className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-left ${
          message.sender === "user"
            ? "bg-[#7b1113] text-white rounded-tr-none"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        <div
          className="prose prose-sm max-w-none
  prose-p:my-2 prose-p:leading-relaxed
  prose-headings:text-[#7b1113] prose-headings:mt-4 prose-headings:mb-2
  prose-strong:font-semibold prose-strong:text-gray-900
  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
  prose-table:w-full prose-table:border-collapse prose-table:my-3
  prose-thead:bg-gray-50
  prose-th:border prose-th:border-gray-200 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:text-gray-600
  prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:text-sm prose-td:align-top
  prose-tr:even:bg-gray-50
  overflow-x-auto"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...props }) => {
                if (href === "#action") {
                  return (
                    <button
                      onClick={() => onQuickReply?.(String(children))}
                      className="text-[#7b1113] underline font-bold bg-transparent border-none p-0 cursor-pointer hover:text-red-900 transition-colors text-left inline-block"
                    >
                      {children}
                    </button>
                  );
                }
                return (
                  <a
                    {...props}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium hover:text-blue-800"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {displayedText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
