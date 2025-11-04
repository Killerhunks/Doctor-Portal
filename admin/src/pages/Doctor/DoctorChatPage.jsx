import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DoctorChatContext, DoctorChatContextProvider } from '../../context/DoctorChatContext';
import DoctorChatList from '../../components/Doctor/DoctorChatList';     
import DoctorChatWindow from '../../components/Doctor/DoctorChatWindow'; 
import { FaComments } from 'react-icons/fa';

const DoctorChatPage = () => (
    <DoctorChatContextProvider>
        <ChatPageContent />
    </DoctorChatContextProvider>
);

const ChatPageContent = () => {
    const [searchParams] = useSearchParams();
    const { getChat } = useContext(DoctorChatContext);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

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
        <div className="w-full h-[calc(100vh-80px)] p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className={`lg:col-span-1 h-full ${selectedAppointmentId ? 'hidden lg:block' : 'block'}`}>
                    <DoctorChatList
                        onChatSelect={setSelectedAppointmentId}
                        selectedAppointmentId={selectedAppointmentId}
                    />
                </div>

                <div className={`lg:col-span-2 h-full ${selectedAppointmentId ? 'block' : 'hidden lg:block'}`}>
                    {selectedAppointmentId ? (
                        <DoctorChatWindow onBack={() => setSelectedAppointmentId(null)} />
                    ) : (
                        <div className="bg-white rounded-lg shadow-md border h-full flex items-center justify-center text-center p-4">
                            <div>
                                <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700">Select a Conversation</h3>
                                <p className="text-gray-500 mt-1">Choose a patient from the list to start messaging.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorChatPage;
