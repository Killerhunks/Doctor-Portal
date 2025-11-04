import Doctor from "../models/doctorModel.js"
import Appointment from "../models/AppointmentModel.js"
import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import uploadToCloudinary from "../config/uploadToCloudinary.js"
import validator from "validator"
import jwt from "jsonwebtoken"
//api for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, about, fees, experience, address } = req.body 
        const imageFile = req.file;
        console.log({ name, email, password, speciality, degree, about, fees, experience, address,imageFile })
        if (!name || !email || !password || !speciality || !degree || !about || !fees || !experience || !address || !imageFile) {
            return res.status(400).json({success: false,   message: "All fields are required for adding a doctor" });
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({success: false,  message: "Invalid email" });
        }
        if(password.length < 8){
            return res.status(400).json({success: false,  message: "Password must be at least 8 characters long" });
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ success: false, message: "Doctor already exists" });
        } 
        const uploadResult = await uploadToCloudinary(imageFile.buffer, {
            resource_type: "image",
            folder: "doctors",
            public_id: `doctor_${Date.now()}`
        });

        const doctor = new Doctor({
            name,
            email,
            password: hashedPassword,
            speciality,
            degree,
            about,
            fees,
            experience,
            address:JSON.parse(address),
            image: uploadResult.secure_url,
            date: Date.now()
        })
        
        await doctor.save()
        res.status(201).json({ 
            success: true, 
            message: "Doctor added successfully",
            data: doctor 
        })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { 
                    email: email,
                    role: 'admin',
                    adminId: process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD 
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            return res.status(200).json({ 
                success: true,
                message: "Admin logged in successfully",
                token 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: "Invalid email or password" 
        });
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
}

const getAllDoctors=async(req,res)=>{
    try {
        const doctors=await Doctor.find({}).select("-password")
        res.status(200).json({ 
            success: true,
            message: "Doctors fetched successfully",
            data: doctors
        });
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
}
const getAllAppointments=async(req,res)=>{
    try {
        const appointments=await Appointment.find()
        res.status(200).json({ 
            success: true,
            message: "Appointments fetched successfully",
            data: appointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
}

const cancelAppointment=async(req,res)=>{
    try {
        const {appointmentId}=req.body
        await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
        res.status(200).json({ 
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
}

const adminDashboard=async(req,res)=>{
    try {
        const doctors=await Doctor.find({}).select("-password")
        const users=await User.find({}).select("-password")
        const appointments=await Appointment.find()
        const dashData={
            doctors:doctors.length,
            users:users.length,
            appointments:appointments.length,
            latestAppointments:appointments.reverse().slice(0,5) 
        }
        return res.status(200).json({ 
            success: true,
            message: "Dashboard data fetched successfully",
            data:dashData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
        
    }
}
export {addDoctor,loginAdmin,getAllDoctors,getAllAppointments,cancelAppointment,adminDashboard}