import React,{ createContext, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify'
import { useEffect } from "react";

export const AdminContext = createContext();

const AdminContextProvider=(props)=>{
    const [aToken,setAToken]=useState(localStorage.getItem('aToken') ?  localStorage.getItem('aToken')  : '');
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;
    const [appointments, setAppointments]=useState([]);
    const [dashDaata, setDashData]=useState({});
    const fetchDashboardData=async()=>{
            try {
                const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard`, {
                    headers: { 'atoken': aToken }
                });
                if(response.data.success){
                    setDashData(response.data.data);
                }
                else{
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
            }
    }
    
    const value={
        BACKEND_URL,
        aToken,
        setAToken,
        appointments,setAppointments,
        fetchDashboardData,
        dashDaata,setDashData
        
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
        
    )
}
export default AdminContextProvider