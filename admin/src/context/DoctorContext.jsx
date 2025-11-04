import React, { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const [dToken, setDToken] = useState(
        localStorage.getItem('dToken') ? localStorage.getItem('dToken') : ''
    );  
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [doctorDashboard, setDoctorDashboard] = useState({});
    const [profileData, setProfileData] = useState(false)
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const getDoctorsAppointments = async () => {
        if (!dToken) {
            return;
        }
        try {
            const response = await axios.get(`${BACKEND_URL}/api/doctor/appointmentsDoctor`, {
                headers: { 'dtoken': dToken }
            });
            
            if (response.data.success) {
                setDoctorAppointments(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        }
    };
    const fetchDoctorDashboard = async () => {
        if (!dToken) {
            return;
        }
        try {
            const response = await axios.get(`${BACKEND_URL}/api/doctor/dashboard`, {
                headers: { 'dtoken': dToken }
            });
            
            if (response.data.success) {
                console.log(response.data.data);
                setDoctorDashboard(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        }
    };  
    useEffect(() => {
        if (dToken) {
            fetchDoctorDashboard();
        }
    }, [dToken]);


    const getProfileData=async()=>{
        try {
            const response=await axios.get(`${BACKEND_URL}/api/doctor/profile`,{
                headers:{'dtoken':dToken}
            });
            if(response.data.success){
                console.log(response.data.data);
                setProfileData(response.data.data);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        }
    }
    const updateProfile = async (profileData) => {
  try {
    const { data } = await axios.post(
      `${BACKEND_URL}/api/doctor/update-profile`,
      profileData,
      {
        headers: { dToken }
      }
    )
    
    if (data.success) {
      return true
    } else {
      toast.error(data.message)
      return false
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Something went wrong')
    return false
  }
}

    

    const value = {
        dToken,
        setDToken,
        getDoctorsAppointments,
        doctorAppointments,
        setDoctorAppointments,
        BACKEND_URL,
        fetchDoctorDashboard,
        doctorDashboard,
        setDoctorDashboard,
        profileData,
        setProfileData,
        getProfileData,
        updateProfile
    };   

    useEffect(() => {
        if (dToken) {
            getDoctorsAppointments();
        }
    }, [dToken]);

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;
