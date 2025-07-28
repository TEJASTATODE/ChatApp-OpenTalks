import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assuming you have a CSS file for styling

export default function Login() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

  try {
    const response = await axios.post("https://chatapp-opentalks.onrender.com/login", {
      withCredentials: true,
      email,
      password,
    });

    console.log("Login response:", response.data); // For debug

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.user.name);

    alert("✅ Login successful");
    navigate('/chat');
  } catch (error) {
    if (error.response && error.response.data) {
      alert(error.response.data.message || "❌ Login failed");
    } else {
      alert("❌ Network error or server is down");
    }
  }
};
  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label><br />
          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setemail(e.target.value)}
            required
            
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label><br />
          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setpassword(e.target.value)}
            required
            
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

