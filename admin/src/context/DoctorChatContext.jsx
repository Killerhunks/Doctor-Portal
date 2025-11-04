import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { DoctorContext } from './DoctorContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export const DoctorChatContext = createContext(null);

export const DoctorChatContextProvider = ({ children }) => {
    const { dToken, BACKEND_URL, profileData } = useContext(DoctorContext);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userChats, setUserChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [loadingChat, setLoadingChat] = useState(false);

    // Effect 1: Initialize socket with the doctor's token
    useEffect(() => {
        if (dToken) {
            const newSocket = io(BACKEND_URL, {
                auth: { token: dToken }
            });
            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
    }, [dToken, BACKEND_URL]);

    // Effect 2: Handle incoming messages (Corrected)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (currentChat && currentChat.appointmentId === newMessage.appointmentId) {
                setMessages(prev => [...prev, newMessage]);
            }
            fetchDoctorChats();
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, currentChat]); // <-- THE SAME FIX: Add currentChat to the dependency array

    const fetchDoctorChats = async () => {
        if (!dToken) return;
        try {
            const response = await axios.get(`${BACKEND_URL}/api/messages/my-chats`, {
                headers: { dtoken: dToken }
            });
            if (response.data.success) {
                setUserChats(response.data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch doctor's chats:", error);
        }
    };

    const getChat = async (appointmentId) => {
        if (!dToken) return;
        setLoadingChat(true);
        setMessages([]);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/messages/appointment/${appointmentId}`, {
                headers: { dtoken: dToken }
            });
            if (response.data.success) {
                setCurrentChat(response.data.chat);
                setMessages(response.data.chat.messages);
                socket?.emit('joinChat', appointmentId);
            }
        } catch (error) {
            toast.error("Failed to load chat.");
        } finally {
            setLoadingChat(false);
        }
    };

    const value = {
        socket,
        messages,
        setMessages,
        userChats,
        fetchUserChats: fetchDoctorChats,
        getChat,
        loadingChat,
        currentChat,
        loggedInUser: profileData
    };

    return (
        <DoctorChatContext.Provider value={value}>
            {children}
        </DoctorChatContext.Provider>
    );
};
