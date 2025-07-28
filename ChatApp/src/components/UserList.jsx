import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../socket';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { userName: activeUser } = useParams();
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      socket.emit('join', username);
    }

    socket.on('activeUsers', (userlist) => {
      const filteredUsers = userlist.filter(user => user.name !== username);
      setUsers(filteredUsers);
    });

    return () => {
      socket.off('activeUsers');
    };
  }, [username]);

  const handleUserClick = (userName) => {
    navigate(`/private/${userName}`);
  };

  return (
    <div className="p-4 bg-gray backdrop-blur-md h-full shadow-lg rounded-3xl border border-gray-200">
      {/* Gradient Title */}
      <div className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 border-b pb-3">
        💬Online Users:
      </div>

      <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 border-b border-gray-300 pb-2 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent hover:scrollbar-thumb-pink-400">
        {users.map((user, index) => (
          <li
            key={index}
            onClick={() => handleUserClick(user.name)}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 group ${
              activeUser === user.name
                ? 'bg-gradient-to-r from-blue-50 to-purple-100 border-purple-300 shadow-md'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md'
            }`}
          >
            <div className="relative">
              <img
                src={`https://chatapp-opentalks.onrender.com/uploads/${user.avatar || 'default.png'}`}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-md" />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-base">{user.name}</span>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
