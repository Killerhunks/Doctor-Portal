import Pharmacy from "../models/pharmacyModel.js";
import Order from "../models/orderModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const getAllOrders=async(req,res)=>{
    try {
        const orders=await Order.find();
        return res.status(200).json({success:true , data:orders});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false , message: error.message });
    }
}
const getOrderById = async (req, res) => {
    try {
        const {orderId}=req.params;
        if(!orderId){
            return res.status(400).json({success:false , message:"Order id is required"});
        }
        const order=await Order.findById(orderId);
        if(!order){
            return res.status(404).json({success:false , message:"Order not found"});
        }else{
            return res.status(200).json({success:true , data:order});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false , message: error.message });
    }
}
const getUserOrders = async (req, res) => {
    try {
        const userId=req.user.id
        if(!userId){
            return res.status(400).json({success:false , message:"User id is required"});
        }
        const orders=await Order.find({userId});
        return res.status(200).json({success:true , data:orders});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false , message: error.message });
    }
}
const paymentRazorPayMedicine = async (req, res) => {
  try {
    const { medicines, deliveryAddress, phoneNumber } = req.body;
    const userId = req.user.id;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: "No medicines provided" });
    }

    let totalAmount = 0;
    const medicineDetails = [];

    // **ADDED: Stock validation**
    for (const item of medicines) {
      const medicine = await Pharmacy.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine not found: ${item.medicineId}` });
      }
      
      // **CHECK STOCK AVAILABILITY**
      if (medicine.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}` 
        });
      }

      const subtotal = medicine.price * item.quantity;
      totalAmount += subtotal;

      medicineDetails.push({
        medicineId: medicine._id,
        name: medicine.name,
        price: medicine.price,
        quantity: item.quantity,
        subtotal
      });
    }

    const options = {
      amount: totalAmount * 100, 
      currency: process.env.CURRENCY || "INR",
      receipt: `med_${Date.now()}`,
      notes: { userId }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const newOrder = await Order.create({
      userId,
      medicines: medicineDetails,
      totalAmount,
      deliveryAddress,
      phoneNumber,
      razorpay_order_id: razorpayOrder.id,
      status: "Pending"
    });

    return res.status(200).json({ success: true, razorpayOrder, orderId: newOrder._id });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPaymentMedicine = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      for (const item of order.medicines) {
        await Pharmacy.findByIdAndUpdate(
          item.medicineId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }

      order.payment = true;
      order.paymentId = razorpay_payment_id;
      order.razorpay_signature = razorpay_signature;
      order.status = "Confirmed";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export { paymentRazorPayMedicine, verifyPaymentMedicine,getUserOrders,getAllOrders,getOrderById};
