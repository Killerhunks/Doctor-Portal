import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaImage, FaTimes } from "react-icons/fa";

const Spinner = () => (
  <div className="flex justify-center items-center h-[50vh]">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

const inputStyle =
  "block w-full px-4 py-2 text-gray-800 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const Pharmacy = () => {
  const { BACKEND_URL, aToken } = useContext(AdminContext);

  const initialFormState = {
    name: "",
    brand: "",
    form: "Tablet",
    dose: "",
    price: "",
    stock: "",
    image: null,
    expiryDate: "",
  };

  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllMedicines = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/pharmacy/all-medicines`
      );
      if (response.data.success) {
        setMedicines(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch medicines");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMedicines();
    // eslint-disable-next-line
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const apiData = new FormData();
    Object.keys(formData).forEach((key) => {
      // Only append if not null or empty
      if (formData[key] !== null && formData[key] !== "") {
        apiData.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (editingMedicine) {
        response = await axios.post(
          `${BACKEND_URL}/api/pharmacy/edit-medicine/${editingMedicine._id}`,
          apiData,
          {
            headers: {
              atoken: aToken,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${BACKEND_URL}/api/pharmacy/add-medicine`,
          apiData,
          {
            headers: {
              atoken: aToken,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
        fetchAllMedicines();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (medicineId) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/pharmacy/remove-medicine`,
          { medicineId },
          { headers: { atoken: aToken } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchAllMedicines();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete medicine");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddNewClick = () => {
    setEditingMedicine(null);
    setFormData(initialFormState);
    setImagePreview("");
    setShowForm(true);
  };

  const handleEditClick = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      brand: medicine.brand,
      form: medicine.form,
      dose: medicine.dose,
      price: medicine.price,
      stock: medicine.stock,
      image: null,
      expiryDate: medicine.expiryDate
        ? new Date(medicine.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setImagePreview(medicine.image);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setImagePreview("");
  };

  return (
    <div className="font-sans p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Pharmacy Management
        </h1>
        <button
          onClick={handleAddNewClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg flex items-center shadow-md transition-transform transform hover:scale-105"
        >
          <FaPlus className="mr-2" /> Add New Medicine
        </button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto relative"
          >
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              title="Close"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Brand", name: "brand", type: "text" },
                {
                  label: "Form",
                  name: "form",
                  type: "select",
                  options: ["Tablet", "Syrup"],
                },
                {
                  label: "Dose (e.g., 500mg)",
                  name: "dose",
                  type: "text",
                },
                {
                  label: "Price (₹)",
                  name: "price",
                  type: "number",
                },
                {
                  label: "Stock (Units)",
                  name: "stock",
                  type: "number",
                },
                {
                  label: "Expiry Date",
                  name: "expiryDate",
                  type: "date",
                },
              ].map((field) => (
                <div className="flex flex-col" key={field.name}>
                  <label className="mb-2 font-semibold text-gray-700">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleFormChange}
                      className={inputStyle}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleFormChange}
                      required
                      className={inputStyle}
                      min={field.type === "number" ? 0 : undefined}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 mt-2">
                <label className="mb-2 font-semibold text-gray-700">Image</label>
                <div className="mt-2 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain p-2 rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="image"
                      onChange={handleFormChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center mt-8 gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingMedicine
                  ? "Update"
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {medicines.length > 0 ? (
            medicines.map((med) => (
              <div
                key={med._id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-2"
              >
                <img
                  src={med.image}
                  alt={med.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold mb-2 capitalize text-gray-900">
                    {med.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Brand:</strong> {med.brand}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Dose:</strong> {med.dose}
                  </p>
                  <p className="text-lg font-bold text-green-600 mb-1">
                    ₹{med.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Stock:</strong>{" "}
                    <span
                      className={`font-bold ${
                        med.stock > 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {med.stock} units
                    </span>
                  </p>
                </div>
                <div className="flex border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => handleEditClick(med)}
                    className="flex-1 p-3 text-gray-500 hover:text-yellow-500 hover:bg-gray-100 transition duration-200 flex justify-center items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="flex-1 p-3 text-gray-500 hover:text-red-600 hover:bg-gray-100 transition duration-200 border-l flex justify-center items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No medicines found. Click "Add New Medicine" to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
