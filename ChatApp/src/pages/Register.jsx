import { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './Register.css';
import ProfilePhoto from '../components/ProfilePhoto';

export default function Register() {
  const navigate = useNavigate();
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (photo) {
      formData.append('photo', photo); // ✅ File object
    }

    try {
      const response = await axios.post("http://localhost:5000/register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("✅ User registered successfully!");
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(`❌ ${error.response.status}: ${error.response.data.message}`);
      } else {
        alert("❌ Something went wrong");
      }
    }
  };

  return (
    <div className="register">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label><br />
          <input
            id="name"
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setname(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label htmlFor="photo">Profile Photo:</label><br />
          {/* Custom ProfilePhoto component to handle file input */}
          <ProfilePhoto onSave={(file) => setPhoto(file)} />
        </div>
        <button type="submit">Register</button>
      </form>
      <span>Already have an account? <a href="/login">Login</a></span>
    </div>
  );
}
