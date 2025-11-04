
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
    senderModel: { type: String, required: true, enum: ['User', 'Doctor'] },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messages: [messageSchema],
    lastMessage: { type: String, default: '' },
    lastMessageTime: { type: Date, default: Date.now },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
