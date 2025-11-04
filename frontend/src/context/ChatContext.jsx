import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from './AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

export const ChatContext = createContext(null);

export const ChatContextProvider = ({ children }) => {
    const { token, BACKEND_URL, userData } = useContext(AppContext);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userChats, setUserChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [loadingChat, setLoadingChat] = useState(false);

    useEffect(() => {
        if (token) {
            const newSocket = io(BACKEND_URL, {
                auth: { token }
            });
            setSocket(newSocket);

            return () => newSocket.disconnect();
        }
    }, [token, BACKEND_URL]);
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (currentChat && currentChat.appointmentId === newMessage.appointmentId) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
            fetchUserChats();
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, currentChat]);

    const fetchUserChats = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${BACKEND_URL}/api/messages/my-chats`, { headers: { token } });
            if (response.data.success) {
                setUserChats(response.data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch user chats:", error);
        }
    };

    const getChat = async (appointmentId) => {
        if (!token) return;
        setLoadingChat(true);
        setMessages([]);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/messages/appointment/${appointmentId}`, { headers: { token } });
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
        fetchUserChats,
        getChat,
        loadingChat,
        currentChat,
        loggedInUser: userData
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
