import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardCheck
} from 'react-icons/fa';

const DoctorAppointments = () => {
  const { 
    doctorAppointments, 
    getDoctorsAppointments, 
    dToken, 
    BACKEND_URL 
  } = useContext(DoctorContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mark appointment as completed
  const markAsCompleted = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to mark this appointment as completed?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/doctor/change-appointment-status`,
        { appointmentId },
        { headers: { 'dtoken': dToken } }
      );

      if (response.data.success) {
        toast.success('Appointment marked as completed successfully');
        getDoctorsAppointments(); // Refresh appointments
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { 'dtoken': dToken } }
      );

      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        getDoctorsAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return 'Invalid Date';
      }
      
      const [day, month, year] = dateString.split('-');
      if (!day || !month || !year) {
        return 'Invalid Date';
      }
      
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    try {
      if (!dob) return 'N/A';
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      toast.error(error.message ||'Error calculating age');
    }
  };

  // Check if appointment is upcoming
  const isUpcoming = (dateString) => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return false;
      }
      
      const [day, month, year] = dateString.split('-');
      if (!day || !month || !year) {
        return false;
      }
      
      const appointmentDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    } catch (error) {
      console.error('Date comparison error:', error);
      return false;
    }
  };

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = doctorAppointments || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.userData?.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => {
        switch (statusFilter) {
          case 'upcoming':
            return !appointment.cancelled && isUpcoming(appointment.slotDate) && !appointment.isCompleted;
          case 'completed':
            return appointment.isCompleted;
          case 'cancelled':
            return appointment.cancelled;
          case 'paid':
            return appointment.payment && !appointment.cancelled;
          default:
            return true;
        }
      });
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [doctorAppointments, searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Load appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!dToken) {
        toast.error('Doctor authentication required');
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        await getDoctorsAppointments();
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments');
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [dToken]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse w-full max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Patient Appointments</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your patient appointments</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md border p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 text-sm" />
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredAppointments.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <FaCalendarAlt className="mx-auto text-4xl sm:text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No Matching Appointments' : 'No Appointments Found'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No patient appointments scheduled yet.'
            }
          </p>
        </div>
      )}

      {/* Appointments Table */}
      {currentAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Patient Name and Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={appointment.userData?.image || '/default-avatar.png'}
                          alt={appointment.userData?.name || 'Patient'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mr-4"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.userData?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {appointment.userData?.email || 'Email not provided'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateAge(appointment.userData?.dob)}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-green-500 text-xs" />
                        {appointment.userData?.phone || 'N/A'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-blue-500 text-xs" />
                        <div>
                          <div className="font-medium">{formatDate(appointment.slotDate)}</div>
                          <div className="text-xs text-gray-500">{appointment.slotDate}</div>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-green-500 text-xs" />
                        {appointment.slotTime || 'N/A'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.cancelled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="mr-1" />
                          Cancelled
                        </span>
                      ) : appointment.isCompleted ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" />
                          Completed
                        </span>
                      ) : appointment.payment ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaCheckCircle className="mr-1" />
                          Paid
                        </span>
                      ) : isUpcoming(appointment.slotDate) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaClock className="mr-1" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FaTimesCircle className="mr-1" />
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!appointment.cancelled && !appointment.isCompleted && isUpcoming(appointment.slotDate) ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => markAsCompleted(appointment._id)}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
                          >
                            <FaClipboardCheck className="inline mr-1" />
                            Complete
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
                          >
                            <FaTimes className="inline mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {currentAppointments.map((appointment) => (
                <div key={appointment._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  {/* Patient Info */}
                  <div className="flex items-center mb-3">
                    <img
                      src={appointment.userData?.image || '/default-avatar.png'}
                      alt={appointment.userData?.name || 'Patient'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 mr-3"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {appointment.userData?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {appointment.userData?.email || 'Email not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="flex items-center text-gray-700">
                      <FaUser className="text-blue-500 mr-2 text-xs" />
                      <span>Age: {calculateAge(appointment.userData?.dob)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaPhone className="text-green-500 mr-2 text-xs" />
                      <span>{appointment.userData?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt className="text-blue-500 mr-2 text-xs" />
                      <span>{formatDate(appointment.slotDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="text-green-500 mr-2 text-xs" />
                      <span>{appointment.slotTime || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    {/* Status */}
                    <div>
                      {appointment.cancelled ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="mr-1" />
                          Cancelled
                        </span>
                      ) : appointment.isCompleted ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" />
                          Completed
                        </span>
                      ) : appointment.payment ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaCheckCircle className="mr-1" />
                          Paid
                        </span>
                      ) : isUpcoming(appointment.slotDate) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaClock className="mr-1" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FaTimesCircle className="mr-1" />
                          Expired
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {!appointment.cancelled && !appointment.isCompleted && isUpcoming(appointment.slotDate) && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => markAsCompleted(appointment._id)}
                          className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
                        >
                          <FaClipboardCheck className="inline mr-1" />
                          Complete
                        </button>
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
                        >
                          <FaTimes className="inline mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-colors duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                <FaChevronLeft className="text-xs" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-colors duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DoctorAppointments;
