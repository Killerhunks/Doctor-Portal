// App.jsx - Simplified
import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorChatPage from './pages/Doctor/DoctorChatPage';
import Pharmacy from './pages/Admin/Pharmacy';
import PharmacyOrders from './pages/Admin/PharmacyOrders';
function App() {
  const { aToken } = useContext(AdminContext);
  const {dToken}=useContext(DoctorContext)
  
  return (
    <>
      <ToastContainer />
      {aToken || dToken ? (
        <div className='bg-[#F8F9FD]'>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              <Route path='/admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appointments' element={<AllAppointments />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<DoctorsList />} />
              <Route path='/pharmacy'  element={<Pharmacy/>}/>
              <Route path='/orders'  element={<PharmacyOrders/>}/>
              {/* Doctor Routes */}
              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointments />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/doctor-chat' element={<DoctorChatPage />} />

            </Routes>
          </div>
        </div>
      ) : (
        <>
        <Login />
        <ToastContainer />
        </>
      )}
    </>
  )
}

export default App;
