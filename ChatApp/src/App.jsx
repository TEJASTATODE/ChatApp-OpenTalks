import React  from 'react';
import {  Routes,Route} from 'react-router-dom';
import ChatRoom from './pages/ChatRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateChatBox from './components/PrivateChatBox';

function App() {
  return (
    
      <Routes>
       
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/" element={<Register />} />
        <Route path="/private/:receiver" element={<PrivateChatBox />}/>
        
      </Routes>
  );
}
export default App;
