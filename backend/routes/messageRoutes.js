import express from 'express';
import { getChatByAppointment, sendMessage ,getUserChats} from '../controllers/messageController.js';
import authCombined from '../middlewares/authCombined.js'; // <-- Import the middleware

const messageRouter = express.Router();

messageRouter.get('/appointment/:appointmentId', authCombined, getChatByAppointment);

messageRouter.post('/appointment/:appointmentId/message', authCombined, sendMessage);
messageRouter.get('/my-chats', authCombined, getUserChats);

export default messageRouter;
