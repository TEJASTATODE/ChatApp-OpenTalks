import React, { useState } from "react";

const emojiReactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const MessageBubble = ({
  text,
  sender,
  avatar,
  isOwnMessage,
  timestamp,
  onReact,
  messageReactions = [],
  messageId,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  let pressTimer = null;

  const handleMouseEnter = () => setShowReactions(true);
  const handleMouseLeave = () => setShowReactions(false);
  const handleTouchStart = () => {
    pressTimer = setTimeout(() => setShowReactions(true), 200);
  };
  const handleTouchEnd = () => clearTimeout(pressTimer);

  const handleReaction = (emoji) => {
    onReact(messageId, emoji);
    setShowReactions(false);
  };

  return (
    <div
      className={`flex items-end mb-3 px-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isOwnMessage && (
        <img
          src={`https://chatapp-opentalks.onrender.com/uploads/${avatar}`}
          alt={sender}
          className="w-9 h-9 rounded-full object-cover mr-2 border shadow-sm"
        />
      )}

      <div className="relative max-w-[75%]">
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm transition-all ${
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-900 rounded-bl-none"
          }`}
        >
          {!isOwnMessage && (
            <p className="text-xs font-semibold text-gray-500">{sender}</p>
          )}

          <p>{text}</p>

          {timestamp && (
            <span className="text-[10px] mt-1 block text-right text-gray-400">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {/* 💬 Reactions */}
          {messageReactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {messageReactions.map((r, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white/70 backdrop-blur text-gray-800 border px-2 py-0.5 rounded-full shadow-sm"
                >
                  {r.emoji} {r.count}
                </span>
              ))}
            </div>
          )}

          {/* 😊 Emoji Reaction Bar */}
          {showReactions && (
            <div className="absolute -top-10 left-2 bg-white border shadow-md rounded-full px-3 py-1 flex gap-2 z-20 transition-all">
              {emojiReactions.map((emoji) => (
                <span
                  key={emoji}
                  className="cursor-pointer hover:scale-125 transition text-xl"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
