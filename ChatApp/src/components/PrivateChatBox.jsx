import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import socket from "../socket";

const audio = new Audio("/audio.mp3");
audio.preload = "auto";

const PrivateChatBox = () => {
  const { receiver } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverAvatar, setReceiverAvatar] = useState("default.png");
  const [isOnline, setIsOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const username = localStorage.getItem("username") || "";
  const avatar = localStorage.getItem("avatar") || "default.png";
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPreviousMessages = useCallback(() => {
    if (!username || !receiver) return;
    fetch(`http://localhost:5000/private-message/between/${username}/${receiver}`)
      .then((res) => res.json())
      .then(setMessages)
      .catch((err) => console.error("❌ Failed to load messages:", err));
  }, [username, receiver]);

  const fetchAvatar = useCallback(() => {
    fetch(`http://localhost:5000/avatar/${receiver}`)
      .then((res) => res.json())
      .then((data) => setReceiverAvatar(data?.avatar || "default.png"))
      .catch(() => setReceiverAvatar("default.png"));
  }, [receiver]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const message = {
      sender: username,
      receiver,
      message: trimmed,
      avatar,
      timestamp: new Date().toISOString(),
    };

    socket.emit("privateMessage", message);
    socket.emit("typing", { to: receiver, isTyping: false });

    try {
      await fetch("http://localhost:5000/private-message/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }

    setInput("");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit("typing", { to: receiver, isTyping: true });
  };

  // 🔁 Load messages on mount
  useEffect(() => {
    fetchPreviousMessages();
  }, [fetchPreviousMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (receiver) fetchAvatar();
  }, [fetchAvatar]);

  useEffect(() => {
    socket.emit("checkOnline", receiver);
    const handleOnlineStatus = ({ user, online }) => {
      if (user === receiver) setIsOnline(online);
    };
    socket.on("onlineStatus", handleOnlineStatus);
    return () => socket.off("onlineStatus", handleOnlineStatus);
  }, [receiver]);

  useEffect(() => {
    const handleTyping = ({ from, isTyping }) => {
      if (from === receiver) setTyping(isTyping);
    };
    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [receiver]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      const isRelevant =
        (data.sender === receiver && data.receiver === username) ||
        (data.sender === username && data.receiver === receiver);

      if (isRelevant) {
        setMessages((prev) => [...prev, data]);
        if (data.sender !== username) audio.play();
      }
    };

    socket.on("receivePrivateMessage", handleReceiveMessage);
    return () => socket.off("receivePrivateMessage", handleReceiveMessage);
  }, [receiver, username]);

  return (
    <div className="flex flex-col h-full w-full bg-white shadow rounded-xl overflow-hidden">
      {/* 🔷 Header */}
      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white sticky top-0 z-10">
        <img
          src={`http://localhost:5000/uploads/${receiverAvatar}`}
          onError={(e) => (e.target.src = "http://localhost:5000/uploads/default.png")}
          alt={receiver}
          className="w-10 h-10 rounded-full mr-3 border border-white object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{receiver}</span>
          {isOnline && <span className="text-sm text-green-300">Online</span>}
        </div>
      </div>

      {/* ✍️ Typing Indicator */}
      {typing && (
        <div className="px-4 py-1 text-sm text-gray-600 italic bg-gray-100">
          {receiver} is typing...
        </div>
      )}

      {/* 💬 Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            text={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            avatar={msg.avatar}
            isOwnMessage={msg.sender === username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 📥 Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-centre border-t border-gray-300 p-3 bg-white"
      >
        <input
          type="text"
          placeholder={`Message ${receiver || "..."}`}
          value={input}
          onChange={handleInputChange}
          disabled={!receiver}
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!receiver || !input.trim()}
          className="ml-3 bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default PrivateChatBox;
