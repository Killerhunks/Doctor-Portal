// orderRoutes.js - Put specific routes BEFORE generic ones
import express from 'express';
import {paymentRazorPayMedicine,verifyPaymentMedicine,getAllOrders,getOrderById,getUserOrders} from '../controllers/orderController.js';
import authUser from '../middlewares/authUser.js';
import authAdmin from '../middlewares/authAdmin.js';

const orderRouter = express.Router();

orderRouter.post('/medicine-payment', authUser, paymentRazorPayMedicine);
orderRouter.post('/verify-payment-medicine', authUser, verifyPaymentMedicine);
orderRouter.get('/user-orders', authUser, getUserOrders); 
orderRouter.get('/orders', authAdmin, getAllOrders);
orderRouter.get('/:id', authAdmin, getOrderById); 

export default orderRouter;
