import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

export const AppContext = createContext();

const UserProvider = ({ children }) => {
  const currencySymbol = '$';
  // Fixed: Initialize token from localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState({
      name: "",
      image: assets.upload_area,
      email: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
      },
      gender: "male",
      dob: "",
    });
  // Normalize backend URL: remove any trailing slashes to avoid double-slash when building paths
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
  const BACKEND_URL = rawBackendUrl ? String(rawBackendUrl).replace(/\/+$/, '') : '';

  const getAvailableDoctors = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/doctor/get-all-available-doctors`);
      if (response.data.success) {
        console.log(response.data);
        setDoctors(response.data.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  };
  
  const getUserProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'token': token }
      });
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem('userImage', response.data.data.image);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };
  useEffect(() => {
    getAvailableDoctors();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      getUserProfile();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const value = {
    getAvailableDoctors,
    BACKEND_URL,
    currencySymbol,
    token,
    doctors,
    setToken,
    userData,
    setUserData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default UserProvider;
