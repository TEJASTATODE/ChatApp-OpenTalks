import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import socket from "../socket";

const audio = new Audio("/audio.mp3");

const ChatBox = ({ selectedUser, setSelectedUser }) => {
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && username) {
      const newMessage = {
        _id: Date.now().toString(),
        message: input,
        sender: username,
        avatar: localStorage.getItem("avatar") || "default.png",
        timestamp: new Date().toISOString(),
        reactions: [],
        receiver: selectedUser ? selectedUser.name : null,
      };

      socket.emit("sendMessage", newMessage);

      await fetch("https://chatapp-opentalks.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      setInput("");
    }
  };

  const handleReaction = (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: toggleReaction(msg.reactions || [], emoji),
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

  const toggleReaction = (reactions, emoji) => {
    const index = reactions.findIndex((r) => r.emoji === emoji);
    if (index > -1) {
      const newReactions = [...reactions];
      newReactions[index].count += 1;
      return newReactions;
    } else {
      return [...reactions, { emoji, count: 1 }];
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      socket.emit("setUsername", {
        name: storedUsername,
        avatar: localStorage.getItem("avatar") || "default.png",
      });
    }

    const loadMessages = async () => {
      const res = await fetch("http://localhost:5000/chat");
      const data = await res.json();
      const relevantMessages = data.filter((msg) => {
        if (!selectedUser) return !msg.receiver;
        return (
          (msg.sender === username && msg.receiver === selectedUser.name) ||
          (msg.sender === selectedUser.name && msg.receiver === username)
        );
      });
      setMessages(relevantMessages.reverse());
    };

    loadMessages();

    const handleIncomingMessage = (data) => {
      const isFromMe = data.sender === username;
      const isToMe = data.receiver === username;
      const isToSelectedUser = selectedUser && data.receiver === selectedUser.name;
      const isFromSelectedUser = selectedUser && data.sender === selectedUser.name;

      const isGlobalMessage = !data.receiver;
      const isPrivateMessage = data.receiver && (isFromMe || isToMe);

      const isInGlobalView = !selectedUser && isGlobalMessage;
      const isInPrivateView = selectedUser && ((isFromMe && isToSelectedUser) || (isToMe && isFromSelectedUser));

      const shouldShow = isInGlobalView || isInPrivateView;

      if (shouldShow) {
        setMessages((prev) => [...prev, data]);
        if (!isFromMe) audio.play();
      }
    };

    const handleReactionUpdate = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? {
                ...msg,
                reactions: toggleReaction(msg.reactions || [], data.emoji),
              }
            : msg
        )
      );
    };

    socket.on("receiveMessage", handleIncomingMessage);
    socket.on("receiveReaction", handleReactionUpdate);

    return () => {
      socket.off("receiveMessage", handleIncomingMessage);
      socket.off("receiveReaction", handleReactionUpdate);
    };
  }, [selectedUser, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      {selectedUser && (
        <div className="flex items-center p-3 bg-white bg-opacity-80 backdrop-blur border-b border-gray-200 shadow-sm">
          <button onClick={() => setSelectedUser(null)} className="mr-3 text-xl hover:text-blue-500 transition">
            ⬅
          </button>
          <img
            src={`http://localhost:5000/uploads/${selectedUser.avatar || "default.png"}`}
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{selectedUser.name}</p>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            text={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            avatar={msg.avatar || "default.png"}
            messageId={msg._id}
            messageReactions={msg.reactions || []}
            isOwnMessage={msg.sender === username}
            onReact={handleReaction}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center p-3 bg-white bg-opacity-90 backdrop-blur-md border-t border-gray-200 shadow-md"
      >
        <input
          type="text"
          placeholder="Type something sweet..."
          className="flex-1 px-5 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-3 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:opacity-90 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
