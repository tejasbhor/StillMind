"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { tokenStore } from "@/services/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "") : "");

interface UseSocketOptions {
  allocationId?: string;
  onMessage?: (msg: any) => void;
  onUserJoined?: (data: any) => void;
  onTyping?: (data: any) => void;
  onMessageEdited?: (data: any) => void;
  onMessageDeleted?: (data: any) => void;
  onMessagesRead?: (data: any) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (content: string, clientMessageId?: string) => void;
  joinRoom: (roomId: string) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  markRead: (roomId: string, messageId?: string) => void;
  editMessage: (roomId: string, messageId: string, newContent: string) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
}

// Track sent messages for deduplication: clientMessageId -> server messageId
const _sentMessages: Map<string, string> = new Map();

function generateClientMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useSocket({
  allocationId,
  onMessage,
  onUserJoined,
  onTyping,
  onMessageEdited,
  onMessageDeleted,
  onMessagesRead,
}: UseSocketOptions = {}): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("[Socket.IO] Connected");
      
      // Re-join room on reconnect
      if (allocationId) {
        newSocket.emit("join_chat", { room: allocationId });
      }
    });

    newSocket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("[Socket.IO] Disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket.IO] connect_error:", err.message);
      setConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("[Socket.IO] Reconnected after", attemptNumber, "attempts");
      setConnected(true);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[Socket.IO] Reconnect attempt:", attemptNumber);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("[Socket.IO] Reconnect failed");
    });

    // Message handlers
    if (onMessage) {
      newSocket.on("chat_message", (msg) => {
        // Deduplicate by message ID
        if (_sentMessages.has(msg.id)) {
          _sentMessages.delete(msg.id);
          return;
        }
        onMessage(msg);
      });
    }

    if (onUserJoined) {
      newSocket.on("user_joined", onUserJoined);
    }

    if (onTyping) {
      newSocket.on("typing", onTyping);
    }

    if (onMessageEdited) {
      newSocket.on("message_edited", onMessageEdited);
    }

    if (onMessageDeleted) {
      newSocket.on("message_deleted", onMessageDeleted);
    }

    if (onMessagesRead) {
      newSocket.on("messages_read", onMessagesRead);
    }

    // Auto-join room if allocationId provided
    if (allocationId) {
      newSocket.on("connect", () => {
        newSocket.emit("join_chat", { room: allocationId });
      });
    }

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [allocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    (content: string, clientMessageId?: string) => {
      if (!socketRef.current || !allocationId) return;
      
      const msgId = clientMessageId || generateClientMessageId();
      
      socketRef.current.emit("chat_message", {
        room: allocationId,
        content,
        client_message_id: msgId,
        idempotency_key: msgId,
      });
    },
    [allocationId]
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("join_chat", { room: roomId });
    },
    []
  );

  const sendTyping = useCallback(
    (roomId: string, isTyping: boolean) => {
      if (!socketRef.current) return;
      
      // Debounce typing events
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      socketRef.current.emit("typing", {
        room: roomId,
        is_typing: isTyping,
      });
    },
    []
  );

  const markRead = useCallback(
    (roomId: string, messageId?: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("mark_read", {
        room: roomId,
        message_id: messageId,
      });
    },
    []
  );

  const editMessage = useCallback(
    (roomId: string, messageId: string, newContent: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("edit_message", {
        room: roomId,
        message_id: messageId,
        new_content: newContent,
      });
    },
    []
  );

  const deleteMessage = useCallback(
    (roomId: string, messageId: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("delete_message", {
        room: roomId,
        message_id: messageId,
      });
    },
    []
  );

  return {
    socket,
    connected,
    sendMessage,
    joinRoom,
    sendTyping,
    markRead,
    editMessage,
    deleteMessage,
  };
}

