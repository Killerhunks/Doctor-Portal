import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaStethoscope,
  FaRupeeSign,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaUserMd,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const AllAppointments = () => {
  const { appointments, setAppointments, aToken, BACKEND_URL } = useContext(AdminContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all appointments for admin
  const getAllAppointments = async () => {
    if (!aToken) {
      toast.error('Admin authentication required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/appointments`, {
        headers: { 'atoken': aToken }
      });

      if (response.data.success) {
        setAppointments(response.data.data);
        setError('');
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment (Admin action)
  const cancelAppointmentAdmin = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/cancel-appointment`,
        { appointmentId },
        { headers: { 'atoken': aToken } }
      );

      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        getAllAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if appointment is upcoming
  const isUpcoming = (dateString) => {
    const [day, month, year] = dateString.split('-');
    const appointmentDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.docData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.userData?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [appointments, searchTerm, statusFilter]);

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

  useEffect(() => {
    getAllAppointments();
  }, [aToken]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md border p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 sm:h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">All Appointments</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and monitor all patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <FaCalendarAlt className="text-blue-500 text-lg sm:text-2xl mr-2 sm:mr-3" />
            <div>
              <p className="text-blue-600 font-semibold text-xs sm:text-sm">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">{appointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 text-lg sm:text-2xl mr-2 sm:mr-3" />
            <div>
              <p className="text-green-600 font-semibold text-xs sm:text-sm">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-green-800">
                {appointments.filter(app => app.isCompleted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <FaClock className="text-yellow-500 text-lg sm:text-2xl mr-2 sm:mr-3" />
            <div>
              <p className="text-yellow-600 font-semibold text-xs sm:text-sm">Upcoming</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-800">
                {appointments.filter(app => !app.cancelled && isUpcoming(app.slotDate) && !app.isCompleted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <FaTimesCircle className="text-red-500 text-lg sm:text-2xl mr-2 sm:mr-3" />
            <div>
              <p className="text-red-600 font-semibold text-xs sm:text-sm">Cancelled</p>
              <p className="text-xl sm:text-2xl font-bold text-red-800">
                {appointments.filter(app => app.cancelled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md border p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by doctor, patient, or email..."
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

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center">
            <FaTimesCircle className="text-red-500 mr-2 text-sm" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

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
              : 'No appointments have been booked yet.'
            }
          </p>
        </div>
      )}

      {/* Appointments list */}
      {currentAppointments.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {currentAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
                appointment.cancelled 
                  ? 'border-red-200 bg-red-50' 
                  : appointment.isCompleted
                  ? 'border-green-200 bg-green-50'
                  : isUpcoming(appointment.slotDate)
                  ? 'border-blue-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-col gap-4">
                  {/* Patient & Doctor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={appointment.userData?.image || '/default-avatar.png'}
                        alt={appointment.userData?.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {appointment.userData?.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          <FaUser className="inline mr-1" />
                          Patient
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {appointment.userData?.email}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={appointment.docData?.image}
                        alt={appointment.docData?.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-200"
                        onError={(e) => {
                          e.target.src = '/default-doctor-avatar.png';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {appointment.docData?.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-600 truncate">
                          <FaUserMd className="inline mr-1" />
                          {appointment.docData?.speciality}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt className="text-blue-500 mr-1 sm:mr-2 text-xs" />
                      <div>
                        <p className="font-medium">{formatDate(appointment.slotDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <FaClock className="text-green-500 mr-1 sm:mr-2 text-xs" />
                      <div>
                        <p className="font-medium">{appointment.slotTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <FaRupeeSign className="text-yellow-500 mr-1 sm:mr-2 text-xs" />
                      <div>
                        <p className="font-medium">₹{appointment.amount}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-700">
                      <FaPhone className="text-purple-500 mr-1 sm:mr-2 text-xs" />
                      <div>
                        <p className="font-medium text-xs truncate">{appointment.userData?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions - Fixed desktop spacing */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
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

                    {/* Admin Actions - Only show if there are actions available */}
                    {!appointment.cancelled && !appointment.isCompleted && isUpcoming(appointment.slotDate) && (
                      <div className="flex-shrink-0 sm:ml-auto">
                        <button
                          onClick={() => cancelAppointmentAdmin(appointment._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3 sm:px-4 rounded transition-colors duration-200"
                        >
                          <FaTimes className="inline mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      ID: {appointment._id.slice(-8)} • Booked: {new Date(appointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

export default AllAppointments;
