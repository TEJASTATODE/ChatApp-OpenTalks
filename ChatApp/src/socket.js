import { io } from "socket.io-client";
const socket = io("https://chatapp-opentalks.onrender.com");
export default socket;