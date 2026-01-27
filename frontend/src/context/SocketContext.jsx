import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the server
        const newSocket = io(import.meta.env.VITE_BASE_URL || 'http://localhost:3000'); // Use VITE env or default

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Helper to join room/identify user
    const joinIdentity = (userId, userType) => {
        if (socket) {
            socket.emit('join', { userId, userType });
        }
    }

    return (
        <SocketContext.Provider value={{ socket, joinIdentity }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;