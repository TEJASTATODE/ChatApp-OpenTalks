import axios from "axios";
const instance = axios.create({
  baseURL: "http://localhost:5000", // 🔗 Your backend API base
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`, // 🔗 Token for authentication
  }
});

// You can also add interceptors here if needed

export default instance;