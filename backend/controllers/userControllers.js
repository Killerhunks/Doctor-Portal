import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import uploadToCloudinary from "../config/uploadToCloudinary.js"
import Appointment from '../models/AppointmentModel.js'
import Doctor from '../models/doctorModel.js'
import razorpay from 'razorpay'
import crypto from 'crypto'
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        console.log(req.body)
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            })
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            })
        }
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            token
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const getuserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const userData = await User.findById(userId).select("-password");

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const editUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('User ID:', userId);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        let { name, email, gender, dob, address, phone } = req.body;
        const image = req.file;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address);
            } catch (e) {
                console.error('Error parsing address:', e);
                address = user.address;
            }
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (image) {
            try {
                const uploadResult = await uploadToCloudinary(image.buffer, {
                    resource_type: "image",
                    folder: "doctusers",
                    public_id: `user_${Date.now()}`
                });
                user.image = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image"
                });
            }
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: userResponse
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime } = req.body
        const userId = req.user.id
        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const docData = await Doctor.findById(docId).select("-password")
        if (!docData || docData.available === false) {
            return res.status(400).json({
                success: false,
                message: "Doctor not found or not available"
            })
        }
        let slots_booked = docData.slots_booked

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.status(400).json({
                    success: false,
                    message: "Slot already booked"
                })
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }
        
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        } 
        delete docData.slots_booked
        const appointmentData = {
            userId,
            docId,
            userData:user,
            docData,
            amount:docData.fees,
            slotDate,
            slotTime,
            date:Date.now()
        }
        const appointment = await Appointment.create(appointmentData)
        await appointment.save()
        await Doctor.findByIdAndUpdate(docId,{slots_booked})
        res.status(200).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const userAppointments=async(req,res)=>{
    try {
        const userId=req.user.id
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        const appointments=await Appointment.find({userId})
        res.status(200).json({
            success:true,
            message:"Appointments fetched successfully",
            data:appointments
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false , message: error.message });
    }
}

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;
        const appointment = await Appointment.findById(appointmentId);
        if(appointment.userId!== userId){
            return res.status(400).json({
                success: false,
                message: "You are not authorized to cancel this appointment"
            })
        }
        await Appointment.findByIdAndUpdate(appointmentId, { cancelled: true });
        const {docId,slotDate,slotTime} = appointment;
        const docData = await Doctor.findById(docId);
        let slots_booked = docData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter((time) => time !== slotTime);
        await Doctor.findByIdAndUpdate(docId, { slots_booked });
        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentRazorPay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment || appointment.cancelled) {
            return res.status(400).json({
                success: false, 
                message: "Appointment not found or cancelled"
            });
        }

        const options = {
            amount: appointment.amount * 100, 
            currency: process.env.CURRENCY || "INR",
            receipt: appointmentId, 
            notes: {
                appointmentId: appointmentId,
                doctorId: appointment.docId,
                userId: appointment.userId
            }
        };

        const order = await razorpayInstance.orders.create(options);
        
        return res.status(200).json({
            success: true, 
            order
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false, 
            message: error.message 
        });
    }
};
const verifyPayment = async (req, res) => {
    try {
        const { 
            appointmentId, 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature 
        } = req.body;

        console.log('Payment verification request:', {
            appointmentId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        });

        if (!appointmentId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment verification data"
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to verify this payment"
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log('Signature verification:', {
            expected: expectedSignature,
            received: razorpay_signature,
            match: expectedSignature === razorpay_signature
        });

        if (expectedSignature === razorpay_signature) {
            const updatedAppointment = await Appointment.findByIdAndUpdate(
                appointmentId,
                { 
                    payment: true,
                    paymentId: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    razorpay_signature: razorpay_signature
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                appointment: updatedAppointment
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - Invalid signature"
            });
        }

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed: " + error.message
        });
    }
};


export { 
    registerUser,
    paymentRazorPay,
    loginUser,
    verifyPayment,
    getuserProfile,
    editUserProfile,
    bookAppointment,
    userAppointments,
    cancelAppointment
}