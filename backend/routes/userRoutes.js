import express from 'express';
import { registerUser, loginUser,verifyPayment, getuserProfile,paymentRazorPay, editUserProfile,cancelAppointment,bookAppointment,userAppointments } from '../controllers/userControllers.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', authUser, getuserProfile);
userRouter.post('/edit-profile', authUser, upload.single('image'), editUserProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/my-appointments', authUser, userAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/payment-razorpay', authUser, paymentRazorPay);
userRouter.post('/verify-payment', authUser, verifyPayment);

export default userRouter;
