import React, { createContext, useState } from 'react';

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
    const [user, setUser] = useState({
        email: '',
        fullName: {
            firstName: '',
            lastName: ''
        },
        phone: '', // Added for SKRRRT
        vibeProfile: { // Added for SKRRRT
            music: false,
            quiet: false,
            ac: false
        }
    });

    return (
        <div>
            <UserDataContext.Provider value={{ user, setUser }}>
                {children}
            </UserDataContext.Provider>
        </div>
    );
};

export default UserContext;