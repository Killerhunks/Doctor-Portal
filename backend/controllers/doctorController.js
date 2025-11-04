import Doctor from '../models/doctorModel.js'
import Appointment from '../models/AppointmentModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const changeAvailability=async(req,res)=>{
    try {
        const {docId}=req.body
        const docData=await Doctor.findById(docId)
        await Doctor.findByIdAndUpdate(docId,{available:!docData.available})
        return res.status(200).json({success:true , message:"Availability changed successfully"})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
const getAllAvailableDoctors=async(req,res)=>{
    try {
        const availableDocData=await Doctor.find({available:true}).select("-password -email")
        return res.status(200).json({success:true , data:availableDocData})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const loginDoctor=async(req,res)=>{
    const {email,password}=req.body;
    try {
        if(!email  || !password){
            return res.status(400).json({success:false , message:"Email and password are required"})
        }
        const doctor=await Doctor.findOne({email})
        if(!doctor){
            return res.status(400).json({success:false , message:"Doctor not found"})
        }
        const isMatch=await bcrypt.compare(password,doctor.password)
        if(!isMatch){
            return res.status(400).json({success:false , message:"Invalid password"})
        }
        const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET,{expiresIn:"24h"})
        return res.status(200).json({success:true ,token})
  
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.doctor.id; // Don't destructure, just get the id directly
        
        if (!docId) {
            return res.status(400).json({
                success: false, 
                message: "Not Authorized"
            });
        }

        const appointments = await Appointment.find({ docId })
            .populate('userData', 'name email image phone address gender dob')
            .populate('docData', 'name speciality image degree experience')
            .sort({ date: -1 }); // Sort by most recent first

        return res.status(200).json({
            success: true, 
            data: appointments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const changeAppointmentStatus = async (req, res) => {
    try {
        const docId = req.doctor.id; // Fix destructuring
        const { appointmentId } = req.body; // Get appointmentId from request body
        
        if (!docId) {
            return res.status(400).json({
                success: false, 
                message: "Not Authorized"
            });
        }

        if (!appointmentId) {
            return res.status(400).json({
                success: false, 
                message: "Appointment ID is required"
            });
        }

        // Find appointment by appointmentId and ensure it belongs to this doctor
        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            docId: docId 
        });

        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: "Appointment not found or not authorized"
            });
        }

        // Update appointment status
        appointment.isCompleted = true;
        await appointment.save();

        return res.status(200).json({
            success: true, 
            message: "Appointment marked as completed",
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const cancelAppointmentDoctor = async (req, res) => {
    try {
        const docId = req.doctor.id;
        const { appointmentId } = req.body;
        
        if (!docId) {
            return res.status(400).json({
                success: false, 
                message: "Not Authorized"
            });
        }

        if (!appointmentId) {
            return res.status(400).json({
                success: false, 
                message: "Appointment ID is required"
            });
        }

        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            docId: docId 
        });

        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: "Appointment not found or not authorized"
            });
        }

        appointment.cancelled = true;
        await appointment.save();

        return res.status(200).json({
            success: true, 
            message: "Appointment cancelled successfully",
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const doctorDashboard = async (req, res) => {
    try {
        const docId = req.doctor.id;
        if(!docId){
            return res.status(400).json({
                success: false, 
                message: "Not Authorized"
            });
        }
        const appointments=await Appointment.find({docId})
        let earnings=0;
        appointments.map((appointment)=>{
            if(appointment.isCompleted || appointment.payment) {
                earnings+=appointment.amount
            }
        })
        let patients=[];
        appointments.map((appointment)=>{
            if(appointment.isCompleted && !patients.includes(appointment.userId)){
                patients.push(appointment.userId)
            }
        })
        const dashData={
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments:appointments.reverse().slice(0,5) 
        }
        return res.status(200).json({ 
            success: true,
            message: "Dashboard data fetched successfully",
            data:dashData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false, 
            message: error.message
        })
    }
}
const getDoctorProfile=async(req,res)=>{
    try {
        const docId = req.doctor.id;
        const doctor=await Doctor.findById(docId).select('-password');
        return res.status(200).json({ 
            success: true,
            data:doctor
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

const updateDoctorProfile=async(req,res)=>{
    try {
        const docId = req.doctor.id;
         const {fees,address,available}=req.body;
         await Doctor.findByIdAndUpdate(docId,{fees,address,available});
        return res.status(200).json({ 
            success: true,
            message:"Profile updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}


export {updateDoctorProfile,getDoctorProfile,doctorDashboard,changeAvailability,getAllAvailableDoctors,loginDoctor,appointmentsDoctor,cancelAppointmentDoctor,changeAppointmentStatus}