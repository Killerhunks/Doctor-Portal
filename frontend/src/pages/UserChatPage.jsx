import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatContext, ChatContextProvider } from '../context/ChatContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { FaComments } from 'react-icons/fa';

const UserChatPage = () => (
    <ChatContextProvider>
        <ChatPageContent />
    </ChatContextProvider>
);

const ChatPageContent = () => {
    const [searchParams] = useSearchParams();
    const { getChat } = useContext(ChatContext);
    
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    // When the page loads, check if an appointmentId was passed in the URL
    useEffect(() => {
        const appointmentIdFromUrl = searchParams.get('appointmentId');
        if (appointmentIdFromUrl) {
            setSelectedAppointmentId(appointmentIdFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (selectedAppointmentId) {
            getChat(selectedAppointmentId);
        }
    }, [selectedAppointmentId]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Chat List - always visible on large screens */}
                <div className={`lg:col-span-1 h-full ${selectedAppointmentId ? 'hidden lg:block' : 'block'}`}>
                    <ChatList
                        onChatSelect={setSelectedAppointmentId}
                        selectedAppointmentId={selectedAppointmentId}
                    />
                </div>

                {/* Chat Window - takes up full screen on mobile when a chat is selected */}
                <div className={`lg:col-span-2 h-full ${selectedAppointmentId ? 'block' : 'hidden lg:block'}`}>
                    {selectedAppointmentId ? (
                        <ChatWindow
                            onBack={() => setSelectedAppointmentId(null)}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-md border h-full flex items-center justify-center text-center p-4">
                            <div>
                                <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700">Select a Conversation</h3>
                                <p className="text-gray-500 mt-1">Choose a chat from the left to start messaging.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserChatPage;
