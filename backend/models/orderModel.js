import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true,
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  payment: {
    type: Boolean,
    default: false
  },
  paymentId: String,
  razorpay_order_id: String,
  razorpay_signature: String,
  paymentMethod: {
    type: String,
    enum: ['Razorpay', 'COD'],
    default: 'Razorpay'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  deliveredAt: Date,
  orderedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
