"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { chatApi, type ChatConversation, type ChatMessageItem } from "@/services/api";
import { useSocket } from "@/hooks/use-socket";
import { useAuthStore } from "@/hooks/auth-store";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function StudentChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userId = user?.id ?? "";

  // Fetch conversations on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await chatApi.getConversations();
        const convos = res.data as ChatConversation[];
        setConversations(convos);
        if (convos.length > 0) {
          setActiveConversationId(convos[0].conversation_id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch message history when active room changes
  useEffect(() => {
    if (!activeConversationId) return;
    (async () => {
      try {
        const res = await chatApi.getHistory(activeConversationId);
        setMessages(res.data as ChatMessageItem[]);
      } catch {
        // silently ignore — socket will deliver new messages
      }
    })();
  }, [activeConversationId]);

  // Socket.IO connection
  const handleIncomingMessage = useCallback((msg: ChatMessageItem) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { connected, sendMessage } = useSocket({
    conversationId: activeConversationId ?? undefined,
    onMessage: (msg) => handleIncomingMessage(msg as unknown as ChatMessageItem),
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const MAX_MESSAGE_LENGTH = 3000;

  const handleSend = () => {
    if (!inputValue.trim() || !activeConversationId) return;
    
    // Validate message length
    if (inputValue.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }
    
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  const activeConvo = conversations.find(
    (c) => c.conversation_id === activeConversationId
  );

  if (loading) {
    return (
      <LoadingState 
        text="Loading conversations..." 
        className="h-[calc(100vh-160px)]" 
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load conversations"
        message={error}
        onRetry={() => window.location.reload()}
        className="h-[calc(100vh-160px)]"
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.289 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="No conversations yet"
        description="Chat becomes available once you are assigned a counselor. You'll be notified when that happens."
        className="h-[calc(100vh-160px)]"
      />
    );
  }

  const counselorName = activeConvo?.other_party_name || "Care Team";
  const initials = counselorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up bg-white rounded-t-2xl border-x border-t border-[#E8F2EE] p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#B8D4C0] flex items-center justify-center font-serif text-[#3D5A54] font-medium">
            {initials}
          </div>
          <div>
            <h1 className="font-serif text-xl text-[#3D5A54]">{counselorName}</h1>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-[#7BA89A]" : "bg-[#D4900A]"
              )} />
              <span className="font-sans text-xs text-[#3D5A54]/60">
                {connected ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white border-x border-[#E8F2EE] p-6 flex flex-col gap-4 scroll-smooth"
      >
        <div className="text-center py-4">
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#3D5A54]/20 bg-[#F5F3EF] px-3 py-1 rounded-full">
            Conversation
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex flex-col max-w-[80%] gap-1 animate-fade-up",
              m.sender_id === userId ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={cn(
                "px-5 py-3 rounded-2xl font-sans text-sm leading-relaxed",
                m.sender_id === userId
                  ? "bg-[#3D5A54] text-white rounded-tr-none"
                  : "bg-[#E8F2EE] text-[#3D5A54] rounded-tl-none"
              )}
            >
              {m.content}
            </div>
            <span className="font-sans text-[10px] text-[#3D5A54]/30 px-1">
              {formatTime(m.created_at)}
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
            disabled={!connected}
            className="flex-1 bg-[#FAFCFA] border border-[#B8D4C0] rounded-xl px-4 py-3 font-sans text-sm text-[#3D5A54] placeholder:text-[#3D5A54]/30 focus:outline-none focus:border-[#7BA89A] focus:ring-2 focus:ring-[#7BA89A]/20 transition-all disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || !connected}
            className="rounded-xl px-5"
          >
            Send
          </Button>
        </div>
        <p className="mt-3 text-center font-sans text-[10px] text-[#3D5A54]/40 flex items-center justify-between px-2">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7BA89A]" />
            Conversations include authorized members of your care team.
          </span>
          <span className={inputValue.length > MAX_MESSAGE_LENGTH ? "text-[#B03030]" : ""}>
            {inputValue.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </p>
      </div>
    </div>
  );
}

