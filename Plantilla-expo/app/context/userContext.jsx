import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`https://67310dbe7aaf2a9aff0fb8c5.mockapi.io/Datos-Usuario/${userId}`);
        const user = await response.json();
        setUserData(user);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem('userId', newUserData.id.toString());
      setUserData(newUserData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserData(null);
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user: userData, 
        loading,
        updateUser,
        clearUser,
        refreshUser: fetchUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;