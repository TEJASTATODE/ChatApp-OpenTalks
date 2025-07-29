import React, { useState, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import socket from "../socket";

const ChatBox = ({ username }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("reactionAdded", handleReactionUpdate);

    return () => {
      socket.off("chatMessage");
      socket.off("reactionAdded");
    };
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const message = {
      _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ✅ UNIQUE ID
      sender: username,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
    };

    socket.emit("chatMessage", message);
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  // ✅ Reaction toggle with user tracking
  const toggleReaction = (reactions, emoji, userId) => {
    const newReactions = reactions.map(r => ({
      ...r,
      reactedUsers: [...(r.reactedUsers || [])]
    }));

    const index = newReactions.findIndex((r) => r.emoji === emoji);

    if (index > -1) {
      if (!newReactions[index].reactedUsers.includes(userId)) {
        newReactions[index].count += 1;
        newReactions[index].reactedUsers.push(userId);
      }
    } else {
      newReactions.push({
        emoji,
        count: 1,
        reactedUsers: [userId],
      });
    }

    return newReactions;
  };

  const handleReaction = (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: toggleReaction(msg.reactions || [], emoji, username),
            }
          : msg
      )
    );

    socket.emit("addReaction", {
      messageId,
      emoji,
      userId: username,
    });
  };

  const handleReactionUpdate = (data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId
          ? {
              ...msg,
              reactions: toggleReaction(msg.reactions || [], data.emoji, data.userId),
            }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            messageId={msg._id}
            sender={msg.sender}
            text={msg.text}
            avatar={msg.avatar || "default.png"}
            isOwnMessage={msg.sender === username}
            timestamp={msg.timestamp}
            messageReactions={msg.reactions || []}
            onReact={handleReaction}
          />
        ))}
      </div>

      <div className="flex p-4 border-t bg-white">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
