import axios from "axios";
const instance = axios.create({
  baseURL: "https://chatapp-opentalks.onrender.com", // 🔗 Your backend API base
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`, // 🔗 Token for authentication
  }
});

// You can also add interceptors here if needed

export default instance;