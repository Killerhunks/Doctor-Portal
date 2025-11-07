import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongoDb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import userRouter from './routes/userRoutes.js';
import pharmacyRouter from './routes/pharmacyRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from './models/chatModel.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "https://doctor-portal-frontend.onrender.com",
      "https://doctor-portal-admin-panel-8ilv.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware for socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} (ID: ${socket.userId})`);

  socket.on('joinChat', (appointmentId) => {
    socket.join(appointmentId);
    console.log(`User ${socket.userId} joined room: ${appointmentId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { appointmentId, message } = data;
      const senderId = socket.userId;

      const chat = await Chat.findOne({ appointmentId });
      const senderModel = chat.patientId.toString() === senderId ? 'User' : 'Doctor';

      const newMessage = { sender: senderId, senderModel, message };
      chat.messages.push(newMessage);
      chat.lastMessage = message;
      chat.lastMessageTime = new Date();
      await chat.save();

      const populatedChat = await chat.populate({ path: 'messages.sender', select: 'name image' });
      const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

      io.to(appointmentId).emit('newMessage', sentMessage);
    } catch (error) {
      console.error("Socket send message error:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect services
connectDB();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger (temporary) — helps debug 404s / routing issues
app.use((req, res, next) => {
  try {
    console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl} Host:${req.headers.host}`);
  } catch (e) {
    // ignore logging errors
  }
  next();
});

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/orders', orderRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from server');
});

// ✅ Listen on all interfaces (required for AWS)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
