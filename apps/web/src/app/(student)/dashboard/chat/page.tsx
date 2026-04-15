"use client";

import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Mock conversation and message data
const COUNSELOR = {
  id: "cou_1",
  name: "Dr. Priya Menon",
  status: "Online",
  initials: "PM",
};

const INITIAL_MESSAGES = [
  {
    id: "m1",
    sender: "COUNSELOR",
    text: "Hello Alex, how have you been since our last session?",
    timestamp: "10:30 AM",
  },
  {
    id: "m2",
    sender: "STUDENT",
    text: "I've been feeling a bit better, but the exams are starting to feel overwhelming.",
    timestamp: "10:32 AM",
  },
  {
    id: "m3",
    sender: "COUNSELOR",
    text: "That's understandable. It's perfectly normal to feel some pressure. Have you tried the breathing exercises we discussed?",
    timestamp: "10:35 AM",
  },
];

export default function StudentChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: "STUDENT" as const,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate counselor reply
    setTimeout(() => {
      const reply = {
          id: (Date.now() + 1).toString(),
          sender: "COUNSELOR" as const,
          text: "I'm glad you're trying. We can discuss more strategies for managing exam stress in our next session.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up bg-white rounded-t-2xl border-x border-t border-[#E8F2EE] p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">
            {COUNSELOR.initials}
          </div>
          <div>
            <h1 className="font-serif text-xl text-[#3D5A54]">{COUNSELOR.name}</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7BA89A]" />
              <span className="font-sans text-xs text-[#3D5A54]/60">{COUNSELOR.status}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          View Case Details
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white border-x border-[#E8F2EE] p-6 flex flex-col gap-4 scroll-smooth"
      >
        <div className="text-center py-4">
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#3D5A54]/20 bg-[#F5F3EF] px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex flex-col max-w-[80%] gap-1 animate-fade-up",
              m.sender === "STUDENT" ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={cn(
                "px-5 py-3 rounded-2xl font-sans text-sm leading-relaxed",
                m.sender === "STUDENT"
                  ? "bg-[#3D5A54] text-white rounded-tr-none"
                  : "bg-[#E8F2EE] text-[#3D5A54] rounded-tl-none"
              )}
            >
              {m.text}
            </div>
            <span className="font-sans text-[10px] text-[#3D5A54]/30 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="animate-fade-up bg-white rounded-b-2xl border border-[#E8F2EE] p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-[#FAFCFA] border border-[#B8D4C0] rounded-xl px-4 py-3 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 focus:outline-none focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="rounded-xl px-5"
          >
            Send
          </Button>
        </div>
        <p className="mt-3 text-center font-sans text-[10px] text-[#3D5A54]/40 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7BA89A]" />
          This chat is only visible to you and your assigned counsellor.
        </p>
      </div>
    </div>
  );
}
