import express from 'express';
import {addMedicine,getAllMedicines,updateStock,removeMedicine,editmedicine} from '../controllers/pharmacyController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';


const pharmacyRouter=express.Router();
pharmacyRouter.post('/add-medicine',authAdmin,upload.single('image'),addMedicine);
pharmacyRouter.get('/all-medicines',getAllMedicines);
pharmacyRouter.post('/update-stock',authAdmin,updateStock);
pharmacyRouter.post('/remove-medicine',authAdmin,removeMedicine);
pharmacyRouter.post('/edit-medicine/:medicineId',upload.single('image'),authAdmin,editmedicine);
export default pharmacyRouter