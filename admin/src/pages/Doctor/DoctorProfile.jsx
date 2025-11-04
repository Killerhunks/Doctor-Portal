import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaEnvelope, 
  FaGraduationCap, 
  FaStethoscope,
  FaClock,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaToggleOn,
  FaToggleOff,
  FaCamera,
  FaInfoCircle
} from 'react-icons/fa'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setprofileData,updateProfile, getProfileData } = useContext(DoctorContext)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fees: '',
    address: {
      line1: '',
      line2: ''
    },
    available: true
  })

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  useEffect(() => {
    if (profileData) {
      setFormData({
        fees: profileData.fees || '',
        address: {
          line1: profileData.address?.line1 || '',
          line2: profileData.address?.line2 || ''
        },
        available: profileData.available ?? true
      })
    }
  }, [profileData])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const success = await updateProfile(formData)
      if (success) {
        setIsEditing(false)
        toast.success('Profile updated successfully!')
        getProfileData() // Refresh the data
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    setFormData({
      fees: profileData.fees || '',
      address: {
        line1: profileData.address?.line1 || '',
        line2: profileData.address?.line2 || ''
      },
      available: profileData.available ?? true
    })
  }

  if (!profileData) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Doctor Profile
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your professional information and settings
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <FaSave /> {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Basic Information
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={profileData.image || '/default-doctor.png'}
                    alt={profileData.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      e.target.src = '/default-doctor.png'
                    }}
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                      <FaCamera className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-800 font-medium">{profileData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <FaEnvelope className="text-blue-500" /> Email
                    </label>
                    <p className="text-gray-800">{profileData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <FaStethoscope className="text-green-500" /> Speciality
                    </label>
                    <p className="text-gray-800">{profileData.speciality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <FaGraduationCap className="text-purple-500" /> Degree
                    </label>
                    <p className="text-gray-800">{profileData.degree}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <FaClock className="text-orange-500" /> Experience
                    </label>
                    <p className="text-gray-800">{profileData.experience}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" />
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">{profileData.about}</p>
          </div>

          {/* Editable Information Card */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaEdit className="text-blue-500" />
              Professional Settings
            </h2>

            <div className="space-y-6">
              {/* Consultation Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FaRupeeSign className="text-green-500" />
                  Consultation Fees
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="fees"
                    value={formData.fees}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter consultation fees"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">₹{profileData.fees}</span>
                    <span className="text-gray-500">per consultation</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-500" />
                  Clinic Address
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="address.line1"
                      value={formData.address.line1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      name="address.line2"
                      value={formData.address.line2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Address Line 2"
                    />
                  </div>
                ) : (
                  <div className="text-gray-800">
                    <p>{profileData.address?.line1}</p>
                    {profileData.address?.line2 && <p>{profileData.address.line2}</p>}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                {isEditing ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      {formData.available ? (
                        <FaToggleOn className="text-3xl text-green-500" />
                      ) : (
                        <FaToggleOff className="text-3xl text-gray-400" />
                      )}
                      <span className={`font-medium ${formData.available ? 'text-green-600' : 'text-gray-500'}`}>
                        {formData.available ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-2">
                    {profileData.available ? (
                      <>
                        <FaToggleOn className="text-3xl text-green-500" />
                        <span className="font-medium text-green-600">Available for appointments</span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="text-3xl text-gray-400" />
                        <span className="font-medium text-gray-500">Not available</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Profile Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-sm">Profile Complete</span>
                <span className="font-semibold text-blue-800">95%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Your profile is almost complete! Add more details to attract more patients.
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium text-gray-800">
                  {profileData.date ? new Date(profileData.date).getFullYear() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Profile Verified</span>
                <span className="font-medium text-green-600">Yes</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                View Dashboard
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                View Appointments
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
