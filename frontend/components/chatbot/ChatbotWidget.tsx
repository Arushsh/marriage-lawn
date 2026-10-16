"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, ExternalLink } from "lucide-react";
import { SiteSettings } from "@/types/api";
import { queryChatbot, getChatbotSuggestions } from "@/lib/api";
import { buildWhatsAppUrl, buildGeneralInquiryMessage } from "@/lib/whatsapp";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestions?: string[];
  timestamp: string;
}

interface ChatbotWidgetProps {
  site: SiteSettings;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ site }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Namaste! Welcome to ${site.venue_name || "Shree Palace Lawn"}. I am your automated AI Concierge. Ask me anything about our packages, live date availability, capacity, or booking policies!`,
      suggestions: [
        "💰 View Packages & Pricing",
        "📅 Check Date Availability",
        "🏰 View Halls & Capacity",
        "💬 Chat on WhatsApp",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Math.random().toString(36).substring(2, 10)}`;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!textToSend) {
      setInput("");
    }

    // If suggestion is WhatsApp
    if (query.includes("WhatsApp")) {
      const waUrl = buildWhatsAppUrl(
        site.whatsapp_number,
        buildGeneralInquiryMessage(site.venue_name)
      );
      window.open(waUrl, "_blank");
      return;
    }

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await queryChatbot(query, sessionIdRef.current);
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: res.reply,
        suggestions: res.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        sender: "bot",
        text: "I'm having a brief connection delay. Please feel free to chat directly with our event manager on WhatsApp!",
        suggestions: ["💬 Chat on WhatsApp"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const whatsappHref = buildWhatsAppUrl(
    site.whatsapp_number,
    buildGeneralInquiryMessage(site.venue_name)
  );

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl bg-primary text-white hover:bg-primaryDark border-2 border-accent transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-accent/40"
            aria-label="Open AI Assistant Chatbot"
          >
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <span className="font-semibold text-sm tracking-wide">Ask AI Concierge</span>
          </button>
        )}
      </div>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-20 left-4 z-40 md:hidden">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="p-3.5 rounded-full shadow-2xl bg-primary text-white border border-accent transition-transform active:scale-95 cursor-pointer focus:outline-none"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-5 h-5 text-accent" />
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Venue AI Chatbot"
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[550px] max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3.5 flex items-center justify-between border-b border-accent/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-sm tracking-wide flex items-center gap-1.5">
                  {site.venue_name || "Shree Palace Lawn"}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-white/80">AI Concierge • Instant Answers</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-bg/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-accent/50 flex-shrink-0 flex items-center justify-center text-primary text-xs mt-1">
                    <Bot className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-surface border border-border text-text rounded-tl-none whitespace-pre-line leading-relaxed"
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      m.sender === "user" ? "text-white/70 text-right" : "text-muted"
                    }`}
                  >
                    {m.timestamp}
                  </span>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/60 flex flex-wrap gap-1.5">
                      {m.suggestions.map((sugg, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sugg)}
                          className="text-xs bg-card hover:bg-accent/15 text-primary border border-accent/40 rounded-full px-2.5 py-1 transition-colors font-medium cursor-pointer"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted text-xs p-2">
                <Bot className="w-4 h-4 text-accent animate-spin" />
                <span>AI Concierge is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Link Banner */}
          <div className="px-3.5 py-1.5 bg-surface/90 border-t border-border flex items-center justify-between text-[11px] text-muted">
            <span>Need human coordinator?</span>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              Transfer to WhatsApp <ExternalLink className="w-3 h-3 text-accent" />
            </a>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-card border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about dates, prices, lawn capacity..."
              className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primaryDark disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
