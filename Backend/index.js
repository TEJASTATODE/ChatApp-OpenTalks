const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

const Message = require('./models/messages');
const User = require('./models/users');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const privateMessageRoutes = require('./routes/privateMessages');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.use('/', userRoutes);
app.use('/', messageRoutes);
app.use('/', privateMessageRoutes);

// ✅ FIXED Avatar route (from MongoDB)
app.get('/avatar/:username', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });

    if (!user || !user.avatar) {
      return res.json({ avatar: 'default.png' });
    }

    return res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return res.status(500).json({ avatar: 'default.png' });
  }
});

// Socket.io logic
let activeUsers = [];

io.on('connection', (socket) => {
  socket.on('join', async (username) => {
    if (!username) return;

    socket.username = username;

    try {
      const user = await User.findOne({ name: username });
      if (!user) return;

      const alreadyConnected = activeUsers.some(u => u.name === username);
      if (!alreadyConnected) {
        activeUsers.push({
          name: user.name,
          avatar: user.avatar || 'default.png',
          socketId: socket.id
        });

        io.emit('activeUsers', activeUsers);
        console.log(`✅ ${username} joined`);
      }
    } catch (err) {
      console.error('Error on join:', err);
    }
  });

  socket.on('sendMessage', async (data) => {
    const user = await User.findOne({ name: data.sender });
    const avatar = user?.avatar || 'default.png';

    const newMessage = new Message({
      message: data.message,
      sender: data.sender,
      avatar,
      timestamp: new Date().toISOString(),
      reactions: [],
    });

    await newMessage.save();

    io.emit('receiveMessage', {
      message: data.message,
      sender: data.sender,
      timestamp: new Date().toISOString(),
      avatar,
    });
  });

  socket.on('privateMessage', async ({ sender, receiver, message }) => {
    try {
      const user = await User.findOne({ name: sender });
      const avatar = user?.avatar || 'default.png';

      const newMessage = new Message({
        message,
        sender,
        receiver,
        avatar,
        timestamp: new Date().toISOString(),
        reactions: [],
      });

      await newMessage.save();

      const receiverUser = activeUsers.find(u => u.name === receiver);

      const payload = {
        message,
        sender,
        receiver,
        avatar,
        timestamp: new Date().toISOString()
      };

      if (receiverUser?.socketId) {
        io.to(receiverUser.socketId).emit('receivePrivateMessage', payload);
      }

      socket.emit('receivePrivateMessage', payload);
    } catch (err) {
      console.error('Error in privateMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      const stillConnected = Array.from(io.sockets.sockets.values())
        .some(s => s.username === socket.username);

      if (!stillConnected) {
        activeUsers = activeUsers.filter(u => u.name !== socket.username);
        io.emit('activeUsers', activeUsers);
        console.log(`❌ ${socket.username} disconnected`);
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
