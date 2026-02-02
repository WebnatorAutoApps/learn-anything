import type { Message } from "../types";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  return (
    <>
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`chat-message flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
              msg.role === "system"
                ? "bg-theme-surface-hover text-theme-primary border border-theme-border"
                : "bg-theme-accent/20 text-theme-primary border border-theme-border-strong"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-theme-surface-hover text-theme-secondary border border-theme-border rounded-lg px-4 py-2.5">
            <span className="typing-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
