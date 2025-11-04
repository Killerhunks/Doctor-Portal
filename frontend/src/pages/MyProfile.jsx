import React, { useEffect, useContext, useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaEdit,
  FaSave,
  FaCamera,
} from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const MyProfile = () => {
  
  
  const { BACKEND_URL, token,userData, setUserData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProfileUpdate = async (data) => {
    try {
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('gender', data.gender);
      formData.append('dob', data.dob);
      formData.append('phone', data.phone);
      formData.append('address', JSON.stringify(data.address));
      
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/user/edit-profile`,
        formData,
        {
          headers: { 
            'token': token
          }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        setIsEdit(false);
        setImageFile(null);
        setImagePreview(null);
        getUserProfile();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const editUserProfile = async () => {
    try {
      await submitProfileUpdate(userData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const getUserProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'token': token }
      });
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem('userImage', response.data.data.image);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  useEffect(() => {
    getUserProfile();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={imagePreview || userData.image}
            alt={userData.name}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500 shadow-lg object-cover"
          />
          {isEdit && (
            <div className="absolute bottom-0 right-0">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <FaCamera />
                </div>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          {isEdit ? (
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="text-3xl font-semibold w-full bg-transparent border-b-2 border-blue-500 focus:outline-none py-1"
              autoFocus
            />
          ) : (
            <h1 className="text-3xl font-semibold text-gray-800">{userData.name}</h1>
          )}
          <p className="text-sm text-gray-500 mt-1 italic">User Profile</p>
        </div>
      </div>

      <div className="border-t mt-8 pt-8 space-y-10">
        {/* Contact Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <FaEnvelope className="text-blue-500" /> Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-blue-600 font-medium flex items-center gap-2 mb-1">
                <FaEnvelope /> Email
              </label>
              <p className="text-gray-800 break-all">{userData.email}</p>
            </div>

            <div>
              <label className="text-blue-600 font-medium flex items-center gap-2 mb-1">
                <FaPhone /> Phone
              </label>
              {isEdit ? (
                <input
                  type="text"
                  value={userData.phone || ''}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800">{userData.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-blue-600 font-medium flex items-center gap-2 mb-1">
                <FaMapMarkerAlt /> Address
              </label>
              {isEdit ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={userData.address?.line1 || ''}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        address: { ...userData.address, line1: e.target.value },
                      })
                    }
                    placeholder="Address line 1"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={userData.address?.line2 || ''}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        address: { ...userData.address, line2: e.target.value },
                      })
                    }
                    placeholder="Address line 2"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-line">
                  {userData.address?.line1}
                  <br />
                  {userData.address?.line2}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <FaVenusMars className="text-blue-500" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-blue-600 font-medium flex items-center gap-2 mb-1">
                <FaVenusMars /> Gender
              </label>
              {isEdit ? (
                <select
                  value={userData.gender || 'male'}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-800 capitalize">{userData.gender}</p>
              )}
            </div>

            <div>
              <label className="text-blue-600 font-medium flex items-center gap-2 mb-1">
                <FaBirthdayCake /> Date of Birth
              </label>
              {isEdit ? (
                <input
                  type="date"
                  value={userData.dob || ''}
                  onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800">{userData.dob}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Action Button */}
      <div className="mt-10 text-center">
        {isEdit ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={editUserProfile}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow"
            >
              <FaSave /> Save Changes
            </button>
            <button
              onClick={() => {
                setIsEdit(false);
                setImageFile(null);
                setImagePreview(null);
                getUserProfile(); // Reset to original data
              }}
              className="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all shadow"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition-all shadow"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
