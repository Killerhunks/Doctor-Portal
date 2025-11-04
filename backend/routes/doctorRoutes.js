import express from 'express';
import upload from '../middlewares/multer.js';
import {getAllAvailableDoctors,updateDoctorProfile,getDoctorProfile,doctorDashboard,loginDoctor,appointmentsDoctor,changeAppointmentStatus,cancelAppointmentDoctor} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter=express.Router();

doctorRouter.get('/get-all-available-doctors',getAllAvailableDoctors);
doctorRouter.post('/login',loginDoctor);
doctorRouter.get('/appointmentsDoctor',authDoctor,appointmentsDoctor);
doctorRouter.post('/change-appointment-status',authDoctor,changeAppointmentStatus);
doctorRouter.post('/cancel-appointment', authDoctor, cancelAppointmentDoctor);
doctorRouter.get('/dashboard', authDoctor, doctorDashboard);
doctorRouter.get('/profile', authDoctor, getDoctorProfile);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

export default doctorRouter