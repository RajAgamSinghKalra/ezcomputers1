"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cannedResponses = [
  {
    keywords: ["shipping", "deliver", "ship"],
    reply:
      "Most pre-built systems ship within 3 business days. Custom builds leave the lab within 7 business days after QA. You'll receive tracking updates via email at each milestone.",
  },
  {
    keywords: ["warranty", "return"],
    reply:
      "Every EZComputers system includes a 3-year warranty with lifetime support. Extended on-site coverage up to 5 years is available during checkout or via our support team.",
  },
  {
    keywords: ["support", "help", "contact"],
    reply:
      "You can email support@ezcomputers.com or call (800) 555-3821. For priority help, share your build ID and our technicians will jump in.",
  },
  {
    keywords: ["financing", "payment"],
    reply:
      "We support credit card, ACH, and financing through Affirm or PayPal. All payments are processed securely without leaving EZComputers.",
  },
];

type ChatMessage = {
  id: number;
  author: "user" | "assistant";
  text: string;
};

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now(),
      author: "assistant",
      text: "Hi there! I'm EZBot. Ask anything about builds, shipping, or support and I'll point you in the right direction.",
    },
  ]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const container = document.querySelector("#ezc-chat-scroll");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isOpen]);

  const assistantReply = useMemo(() => {
    return (input: string) => {
      const normalized = input.toLowerCase();
      const matched = cannedResponses.find((entry) =>
        entry.keywords.some((keyword) => normalized.includes(keyword)),
      );
      if (matched) {
        return matched.reply;
      }
      return "I've shared your question with our human technicians. Expect a response within a few minutes during business hours.";
    };
  }, []);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingMessage.trim()) return;

    const messageText = pendingMessage.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: "user", text: messageText },
    ]);
    setPendingMessage("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, author: "assistant", text: assistantReply(messageText) },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <div className="mb-3 w-80 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated shadow-[var(--shadow-strong)]">
          <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">EZBot</p>
              <p className="text-xs text-foreground-muted">Live product specialist</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="gap-2 rounded-full border border-border-soft px-3 text-xs text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
              <span>Close</span>
            </Button>
          </div>
          <div id="ezc-chat-scroll" className="h-64 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2",
                  message.author === "assistant"
                    ? "bg-background-muted text-foreground"
                    : "ml-auto bg-brand-500 text-white",
                )}
              >
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                Typing...
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border-soft px-4 py-3">
            <input
              type="text"
              value={pendingMessage}
              onChange={(event) => setPendingMessage(event.target.value)}
              placeholder="Ask about builds, shipping, etc."
              className="flex-1 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
            <Button type="submit" size="sm" variant="secondary" className="gap-2 px-3">
              <Send className="h-4 w-4" aria-hidden />
              <span>Send message</span>
            </Button>
          </form>
        </div>
      )}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="lg"
        className="shadow-[var(--shadow-soft)]"
      >
        <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
        {isOpen ? "Hide chat" : "Chat with EZBot"}
      </Button>
    </div>
  );
}
