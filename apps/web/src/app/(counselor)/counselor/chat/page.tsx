"use client";

import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Mock student conversations list
const CONVERSATIONS = [
  {
    id: "stu_1",
    name: "Alex Johnson",
    initials: "AJ",
    lastMessage: "The exams are starting to feel overwhelming.",
    time: "10:32 AM",
    unread: 2,
    risk: "YELLOW",
  },
  {
    id: "stu_2",
    name: "Rohan Kapoor",
    initials: "RK",
    lastMessage: "Thanks for the support today.",
    time: "Yesterday",
    unread: 0,
    risk: "RED",
  },
  {
    id: "stu_3",
    name: "Sanya Gupta",
    initials: "SG",
    lastMessage: "Can we reschedule our session?",
    time: "2 days ago",
    unread: 0,
    risk: "GREEN",
  },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  stu_1: [
    { id: "m1", sender: "COUNSELOR", text: "Hello Alex, how have you been since our last session?", timestamp: "10:30 AM" },
    { id: "m2", sender: "STUDENT", text: "I've been feeling a bit better, but the exams are starting to feel overwhelming.", timestamp: "10:32 AM" },
  ],
  stu_2: [
    { id: "m3", sender: "STUDENT", text: "Thanks for the support today.", timestamp: "Yesterday" },
  ],
  stu_3: [
    { id: "m4", sender: "STUDENT", text: "Can we reschedule our session?", timestamp: "2 days ago" },
  ],
};

export default function CounselorChatPage() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [messages, setMessages] = useState(MOCK_MESSAGES[selectedId]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(MOCK_MESSAGES[selectedId] || []);
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: "COUNSELOR" as const,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    MOCK_MESSAGES[selectedId] = updated; // Mock persistence
    setInputValue("");
  };

  const selectedStudent = CONVERSATIONS.find(c => c.id === selectedId);

  return (
    <div className="flex bg-white rounded-2xl border border-[#E8F2EE] h-[calc(100vh-140px)] overflow-hidden">
      {/* Sidebar: Student List */}
      <div className="w-80 border-r border-[#E8F2EE] flex flex-col bg-[#FAFCFA]">
        <div className="p-6 border-b border-[#E8F2EE]">
          <h1 className="font-serif text-2xl text-[#3D5A54]">Messages</h1>
          <div className="mt-4 relative">
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full bg-white border border-[#B8D4C0] rounded-xl px-4 py-2 font-sans text-xs focus:outline-none focus:border-[#7BA89A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "w-full p-4 flex gap-4 transition-all hover:bg-[#E8F2EE]/50",
                selectedId === c.id ? "bg-white border-r-2 border-r-[#7BA89A]" : ""
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">
                  {c.initials}
                </div>
                {c.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7BA89A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {c.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-sans text-sm font-medium text-[#3D5A54] truncate">{c.name}</p>
                  <span className="font-sans text-[10px] text-[#3D5A54]/30">{c.time}</span>
                </div>
                <p className="font-sans text-xs text-[#3D5A54]/60 truncate">{c.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Chat Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Thread Header */}
        <div className="p-5 border-b border-[#E8F2EE] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">
              {selectedStudent?.initials}
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#3D5A54]">{selectedStudent?.name}</h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-full font-sans text-[10px] font-medium border",
                  selectedStudent?.risk === "RED" ? "bg-[#FDEAEA] text-[#B03030] border-[#F5B8B8]" :
                  selectedStudent?.risk === "YELLOW" ? "bg-[#FEF4E0] text-[#D4900A] border-[#E8D4B0]" :
                  "bg-[#E8F2EE] text-[#7BA89A] border-[#B8D4C0]"
                )}>
                  {selectedStudent?.risk} RISK
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Case File</Button>
            <Button variant="ghost" size="sm">Schedule</Button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#FAFCFA]/50"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col max-w-[70%] gap-1 animate-fade-up",
                m.sender === "COUNSELOR" ? "self-end items-end" : "self-start items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl font-sans text-sm leading-relaxed",
                  m.sender === "COUNSELOR"
                    ? "bg-[#3D5A54] text-white rounded-tr-none"
                    : "bg-white border border-[#E8F2EE] text-[#3D5A54] rounded-tl-none shadow-sm"
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

        {/* Input */}
        <div className="p-5 border-t border-[#E8F2EE] bg-white">
          <div className="flex gap-2">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Write a message to the student..."
              className="flex-1 bg-[#FAFCFA] border border-[#B8D4C0] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 focus:outline-none focus:border-[#7BA89A] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="rounded-xl px-6 self-end"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
