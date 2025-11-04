import Pharmacy from "../models/pharmacyModel.js";
import uploadToCloudinary from "../config/uploadToCloudinary.js"

const addMedicine=async(req,res)=>{
    try {
        const {name,brand,form,dose,price,stock,expiryDate }=req.body;
        const image=req.file;
        if(!name || !image || !brand || !form || !dose || !price || !stock || !expiryDate ){
            return res.json({success:false , message:"All fields are required"})
        }
        if(!image){
            return res.json({success:false , message:"Image is required"})
        }
        const medicine=await Pharmacy.findOne({name: name.toLowerCase()});
        if(medicine){
            return  res.status(400).json({success:false , message:"Medicine already exists"})
        }
        const uploadResult = await uploadToCloudinary(image.buffer, {
            resource_type: "image",
            folder: "pharmacy",
            public_id: `Medicine_${Date.now()}`
        });
        const newMedicine=new Pharmacy({
            name:name.toLowerCase(),
            brand,
            form,
            dose,
            price,
            stock,
            image:uploadResult.secure_url,
            expiryDate
        })
        await newMedicine.save();
        return res.json({success:true , message:"Medicine added successfully"})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})
    }
}

const getAllMedicines=async(req,res)=>{
    try {
        const medicines=await Pharmacy.find({})
        return res.json({success:true , data:medicines})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})
    }
}

const updateStock=async(req,res)=>{
    try {
        const {medicineId,stock}=req.body;
        const medicine=await Pharmacy.findById(medicineId);
        if(!medicine){
            return res.json({success:false , message:"Medicine not found"})
        }
        medicine.stock=stock;
        await medicine.save();
        return res.json({success:true , message:"Stock updated successfully"})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})
    }
}
const removeMedicine=async(req,res)=>{
    try {
        const {medicineId}=req.body;
        const medicine=await Pharmacy.findById(medicineId);
        if(!medicine){
            return res.json({success:false , message:"Medicine not found"})
        }
        await Pharmacy.findByIdAndDelete(medicineId);
        return res.json({success:true , message:"Medicine removed successfully"})
    } catch (error) {
        console.log(error);
        return res.json({success:false , message:error.message})
    }
}
const editmedicine = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const { name, brand, form, dose, price, stock, expiryDate } = req.body;
        const image = req.file;

        if (!medicineId) {
            return res.status(400).json({ success: false, message: "Medicine id is required" });
        }
        const medicine = await Pharmacy.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        if (image) {
            const uploadResult = await uploadToCloudinary(image.buffer, {
                resource_type: "image",
                folder: "pharmacy",
                public_id: `Medicine_${Date.now()}`
            });
            medicine.image = uploadResult.secure_url;
        }
        if (name) medicine.name = name.toLowerCase();
        if (brand) medicine.brand = brand;
        if (form) medicine.form = form;
        if (dose) medicine.dose = dose;
        if (price) medicine.price = price;
        if (stock) medicine.stock = stock;
        if (expiryDate) medicine.expiryDate = expiryDate;

        await medicine.save();
        return res.status(200).json({ success: true, message: "Medicine updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


export {
    addMedicine,
    getAllMedicines,
    updateStock,
    removeMedicine,
    editmedicine
}