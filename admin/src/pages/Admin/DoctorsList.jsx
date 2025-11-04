import React, { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorsList = () => {
  const { aToken, BACKEND_URL } = useContext(AdminContext)
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(new Set()); // Track loading state for individual doctors

  const changeDoctorAvailability = async (id) => {
    if(!id){
      toast.error('doc Id is required');
      return;
    }
    
    // Add doctor to loading set
    setLoadingDoctors(prev => new Set(prev).add(id));
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/change-availability`, {docId:id}, {headers:{'atoken':aToken}});
      if(response.data.success){
        toast.success(response.data.message);
        getAllDoctors();
      }
      else{
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change availability');
    } finally {
      // Remove doctor from loading set
      setLoadingDoctors(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  const getAllDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/all-doctors`, {
        headers: { 'atoken': aToken }
      });
      if (response.data.success) {
        setDoctors(response.data.data);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllDoctors();
  }, [aToken]);

  // Format date function
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Extract experience number for better display
  const formatExperience = (exp) => {
    if (typeof exp === 'string' && exp.includes('Year')) {
      return exp;
    }
    return `${exp} Year${exp > 1 ? 's' : ''}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Doctors</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all registered doctors
              </p>
            </div>
            <button
              onClick={getAllDoctors}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-semibold text-gray-900">{doctors.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {doctors.filter(doc => doc.available).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Specialities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(doctors.map(doc => doc.speciality)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && doctors.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && doctors.length === 0 && (
          <div className="text-center py-12">
            <svg className="h-24 w-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600">There are no doctors registered in the system yet.</p>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200">
                {/* Doctor Image and Status */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        doctor.available ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctor.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.available ? 'Available' : 'Unavailable'}
                        </span>
                        
                        {/* Availability Toggle Button */}
                        <button
                          onClick={() => changeDoctorAvailability(doctor._id)}
                          disabled={loadingDoctors.has(doctor._id)}
                          className={`ml-2 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                            doctor.available
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          } ${loadingDoctors.has(doctor._id) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                        >
                          {loadingDoctors.has(doctor._id) ? (
                            <>
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              {doctor.available ? (
                                <>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                  </svg>
                                  <span>Disable</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Enable</span>
                                </>
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {/* Speciality */}
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                      </svg>
                      <span className="font-medium text-gray-900">{doctor.speciality}</span>
                    </div>

                    {/* Education */}
                    <div className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span className="text-gray-700">{doctor.degree}</span>
                    </div>

                    {/* Experience & Fees */}
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">{formatExperience(doctor.experience)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="font-semibold text-gray-900">${doctor.fees}</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start text-sm">
                      <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-gray-700">
                        <div>{doctor.address.line1}</div>
                        {doctor.address.line2 && <div>{doctor.address.line2}</div>}
                      </div>
                    </div>

                    {/* About (truncated) */}
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">
                        {doctor.about.length > 80 
                          ? `${doctor.about.substring(0, 80)}...` 
                          : doctor.about
                        }
                      </p>
                    </div>

                    {/* Registration Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>Joined: {formatDate(doctor.date)}</span>
                      <span>ID: {doctor._id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorsList
