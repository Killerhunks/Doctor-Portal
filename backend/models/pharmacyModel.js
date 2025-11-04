import mongoose from 'mongoose';

const pharmacySchema=new mongoose.Schema({
    name: {
    type: String,
    required: true, 
  },
  image:{
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true, 
  },
  form: {
    type: String,
    enum: ['Tablet','Syrup'],
  },
  dose: {
    type: String,
    required: true, 
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
  }
})

const Pharmacy=new mongoose.model("Pharmacy",pharmacySchema);
export default Pharmacy