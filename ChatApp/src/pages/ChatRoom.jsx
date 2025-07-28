import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";
import Navbar from "../components/Navbar";
import React, { useState } from "react";

export default function ChatRoom() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md h-16 flex items-center px-4">
        <Navbar />
      </header>

      {/* Main Content Area (starts below Navbar) */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* User List - Fixed width sidebar */}
        <aside className="w-[25%] min-w-[250px] bg-white border-r shadow-inner overflow-y-auto">
          <UserList onSelectUser={setSelectedUser} />
        </aside>

        {/* Chat Box - Full remaining space */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <ChatBox selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        </main>
      </div>
    </div>
  );
}
