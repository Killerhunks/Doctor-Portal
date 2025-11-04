import Chat from '../models/chatModel.js';
import Appointment from '../models/AppointmentModel.js';
import mongoose from 'mongoose';

export const getChatByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const loggedInUserId = req.user?.id || req.doctor?.id;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid Appointment ID.' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        const isAuthorized = appointment.userId.toString() === loggedInUserId || appointment.docId.toString() === loggedInUserId;
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'You are not authorized to access this chat.' });
        }
        let chat = await Chat.findOne({ appointmentId })
            .populate({ path: 'messages.sender', select: 'name image' }); 

        if (!chat) {
            chat = new Chat({
                appointmentId,
                doctorId: appointment.docId,
                patientId: appointment.userId,
            });
            await chat.save();
        }

        res.status(200).json({ success: true, chat });

    } catch (error) {
        console.error("Error in getChatByAppointment:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching chat.' });
    }
};
export const sendMessage = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { message } = req.body;
        const senderId = req.user?.id || req.doctor?.id;
        const senderModel = req.user ? 'User' : 'Doctor';

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        }

        const chat = await Chat.findOne({ appointmentId });
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found. Please access the chat through the appointment first.' });
        }
        const isAuthorized = chat.patientId.toString() === senderId || chat.doctorId.toString() === senderId;
        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'You cannot send messages in this chat.' });
        }

        const newMessage = { sender: senderId, senderModel, message: message.trim() };
        chat.messages.push(newMessage);
        chat.lastMessage = message.trim();
        chat.lastMessageTime = new Date();
        await chat.save();
        
        const populatedChat = await chat.populate({ path: 'messages.sender', select: 'name image' });
        const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];

        res.status(201).json({ success: true, message: sentMessage });

    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: 'Server error while sending message.' });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user?.id || req.doctor?.id;
        const userRole = req.user ? 'User' : 'Doctor';
        const query = userRole === 'User' ? { patientId: userId } : { doctorId: userId };

        const chats = await Chat.find(query)
            .populate({ path: 'appointmentId', select: 'slotDate slotTime docData userData' })
            .sort({ lastMessageTime: -1 });

        res.status(200).json({ success: true, chats });

    } catch (error) {
        console.error("Error in getUserChats:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching user chats.' });
    }
};
