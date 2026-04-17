"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { chatApi, type ChatConversation, type ChatMessageItem } from "@/services/api";
import { useSocket } from "@/hooks/use-socket";

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return formatTime(iso);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString();
  } catch { return iso; }
}

export default function CounselorChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeAllocationId, setActiveAllocationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userId = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("sm_user") || "{}").id; } catch { return ""; } })()
    : "";

  useEffect(() => {
    (async () => {
      try {
        const res = await chatApi.getConversations();
        const convos = (res as any).data as ChatConversation[];
        setConversations(convos);
        if (convos.length > 0) setActiveAllocationId(convos[0].allocation_id);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!activeAllocationId) return;
    (async () => {
      try {
        const res = await chatApi.getHistory(activeAllocationId);
        setMessages((res as any).data as ChatMessageItem[]);
      } catch {}
    })();
  }, [activeAllocationId]);

  const handleIncoming = useCallback((msg: ChatMessageItem) => {
    setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
  }, []);

  const { connected, sendMessage, joinRoom } = useSocket({
    allocationId: activeAllocationId ?? undefined,
    onMessage: handleIncoming,
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeAllocationId) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleSelectConvo = (allocationId: string) => {
    setActiveAllocationId(allocationId);
    joinRoom(allocationId);
  };

  const activeConvo = conversations.find((c) => c.allocation_id === activeAllocationId);
  const studentName = activeConvo?.other_party_name || "Student";
  const initials = studentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <p className="font-sans text-sm text-[#3D5A54]/50">Loading messages...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F2EE] flex items-center justify-center">
          <span className="font-serif text-2xl text-[#7BA89A]">💬</span>
        </div>
        <h2 className="font-serif text-xl text-[#3D5A54]">No conversations yet</h2>
        <p className="font-sans text-sm text-[#3D5A54]/50 text-center max-w-sm">
          Messages will appear here when you are assigned students.
        </p>
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-2xl border border-[#E8F2EE] h-[calc(100vh-140px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#E8F2EE] flex flex-col bg-[#FAFCFA]">
        <div className="p-6 border-b border-[#E8F2EE]">
          <h1 className="font-serif text-2xl text-[#3D5A54]">Messages</h1>
          <div className="mt-4">
            <input type="text" placeholder="Search students..." className="w-full bg-white border border-[#B8D4C0] rounded-xl px-4 py-2 font-sans text-xs focus:outline-none focus:border-[#7BA89A]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const cInitials = (c.other_party_name || "S").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <button key={c.allocation_id} onClick={() => handleSelectConvo(c.allocation_id)}
                className={cn("w-full p-4 flex gap-4 transition-all hover:bg-[#E8F2EE]/50", activeAllocationId === c.allocation_id ? "bg-white border-r-2 border-r-[#7BA89A]" : "")}>
                <div className="w-12 h-12 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">{cInitials}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-sans text-sm font-medium text-[#3D5A54] truncate">{c.other_party_name || "Student"}</p>
                    {c.last_message && <span className="font-sans text-[10px] text-[#3D5A54]/30">{formatDate(c.last_message.created_at)}</span>}
                  </div>
                  <p className="font-sans text-xs text-[#3D5A54]/60 truncate">{c.last_message?.content || "No messages yet"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Thread Header */}
        <div className="p-5 border-b border-[#E8F2EE] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">{initials}</div>
            <div>
              <h2 className="font-serif text-lg text-[#3D5A54]">{studentName}</h2>
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", connected ? "bg-[#7BA89A]" : "bg-[#D4900A]")} />
                <span className="font-sans text-xs text-[#3D5A54]/60">{connected ? "Online" : "Connecting..."}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#FAFCFA]/50">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col max-w-[70%] gap-1 animate-fade-up", m.sender_id === userId ? "self-end items-end" : "self-start items-start")}>
              <div className={cn("px-4 py-2.5 rounded-2xl font-sans text-sm leading-relaxed", m.sender_id === userId ? "bg-[#3D5A54] text-white rounded-tr-none" : "bg-white border border-[#E8F2EE] text-[#3D5A54] rounded-tl-none shadow-sm")}>
                {m.content}
              </div>
              <span className="font-sans text-[10px] text-[#3D5A54]/30 px-1">{formatTime(m.created_at)}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-5 border-t border-[#E8F2EE] bg-white">
          <div className="flex gap-2">
            <textarea rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Write a message to the student..." disabled={!connected}
              className="flex-1 bg-[#FAFCFA] border border-[#B8D4C0] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 focus:outline-none focus:border-[#7BA89A] resize-none disabled:opacity-50" />
            <Button onClick={handleSend} disabled={!inputValue.trim() || !connected} className="rounded-xl px-6 self-end">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

