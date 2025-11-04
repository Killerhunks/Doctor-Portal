import React, { useContext, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';

const ChatList = ({ onChatSelect, selectedAppointmentId }) => {
    const { userChats, fetchUserChats } = useContext(ChatContext);

    useEffect(() => {
        fetchUserChats();
    }, []);

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="bg-white rounded-lg shadow-md border h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="overflow-y-auto">
                {userChats.length > 0 ? (
                    userChats.map(chat => (
                        <div
                            key={chat._id}
                            onClick={() => onChatSelect(chat.appointmentId._id)}
                            className={`p-4 cursor-pointer flex items-center gap-4 hover:bg-gray-50 transition-colors ${selectedAppointmentId === chat.appointmentId._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                            <img
                                src={chat.appointmentId.docData.image}
                                alt={chat.appointmentId.docData.name}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 truncate">{chat.appointmentId.docData.name}</h3>
                                    <p className="text-xs text-gray-500">{formatDate(chat.lastMessageTime)}</p>
                                </div>
                                <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage || "No messages yet"}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-500">No conversations found.</p>
                )}
            </div>
        </div>
    );
};

export default ChatList;
