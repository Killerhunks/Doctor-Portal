import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, BACKEND_URL, token, getAvailableDoctors } = useContext(AppContext);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = React.useState(null);
  const [docslots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const Navigate = useNavigate();

  const handleBookAppointment = async () => {
    if (!token) {
      toast.warn('Please login to book an appointment');
      setTimeout(() => {
        Navigate('/login');
      }, 2000);
      return;
    }

    if (!slotTime) {
      toast.error('Please select a time slot');
      return;
    }

    setIsLoading(true);
    try {
      const date = docslots[slotIndex][0].dateTime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = day + '-' + month + '-' + year;

      const response = await axios.post(`${BACKEND_URL}/api/user/book-appointment`, {
        docId,
        slotDate,
        slotTime
      }, {
        headers: { 'token': token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        getAvailableDoctors();
        // Clear selected slot
        setSlotTime('');
        // Navigate after a short delay to show the success message
        setTimeout(() => {
          Navigate('/my-appointments');
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Appointment booking error:', error);
      toast.error(error.response?.data?.message || 'An error occurred while booking appointment');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((item) => item._id === docId);
    if (docInfo) {
      setDocInfo(docInfo);
    } else {
      toast.error('Doctor not found');
      Navigate('/doctors');
    }
  }

  const getAvailableSlots = async () => {
    setDocSlots([]);
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];
      
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        let slotDate = day + '-' + month + '-' + year;
        const slotTime = formattedTime;
        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;
        
        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime
          });
        }
        
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots(prev => ([...prev, timeSlots]));
      }
    }
  }

  const handleTimeSlotClick = (selectedTime) => {
    if (slotTime === selectedTime) {
      setSlotTime('');
    } else {
      setSlotTime(selectedTime);
    }
  }

  const handleDateSlotClick = (index) => {
    if (slotIndex === index && slotTime) {
      setSlotTime('');
    }
    setSlotIndex(index);
  }

  useEffect(() => {
    if (docId && doctors.length > 0) {
      fetchDocInfo();
    }
  }, [docId, doctors]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log(docslots);
  }, [docslots]);

  return docInfo && (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-blue-500 w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name} 
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-600 font-medium mt-4'>
            Appointment Fee: <span className='text-gray-700'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        
        {docslots.length > 0 ? (
          <>
            {/* Date selection */}
            <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
              {docslots.map((item, idx) => (
                <div 
                  onClick={() => handleDateSlotClick(idx)} 
                  key={idx} 
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer transition-all duration-200 ${
                    idx === slotIndex ? 'bg-blue-500 text-white shadow-md' : 'border border-gray-400 hover:border-blue-300'
                  }`}
                >
                  <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()]}</p>
                  <p>{item[0] && item[0].dateTime.getDate()}</p>
                </div>
              ))}
            </div>

            {/* Time slot selection with toggle functionality */}
            <div className='flex items-center gap-3 overflow-x-scroll mt-4'>
              {docslots[slotIndex] && docslots[slotIndex].map((item, idx) => (
                <p 
                  onClick={() => handleTimeSlotClick(item.time)} 
                  key={idx} 
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                    item.time === slotTime 
                      ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                      : 'text-gray-500 border border-gray-400 hover:border-blue-300 hover:text-blue-500'
                  }`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
            </div>

            {/* Enhanced button with better feedback */}
            <div className='mt-6'>
              {slotTime && (
                <div className='mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                  <p className='text-sm text-blue-700'>
                    <span className='font-medium'>Selected:</span> {daysOfWeek[docslots[slotIndex][0].dateTime.getDay()]} {docslots[slotIndex][0].dateTime.getDate()}, {slotTime}
                  </p>
                </div>
              )}
              
              <button 
                className={`text-white font-light px-14 py-3 rounded-full transition-all duration-200 ${
                  slotTime && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer shadow-md hover:shadow-lg' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                onClick={handleBookAppointment}
                disabled={!slotTime || isLoading}
              >
                {isLoading ? 'Booking...' : slotTime ? 'Book An Appointment' : 'Select a Time Slot'}
              </button>
              
              {slotTime && !isLoading && (
                <button 
                  onClick={() => setSlotTime('')}
                  className='ml-3 text-gray-500 hover:text-red-500 font-light px-6 py-3 rounded-full border border-gray-300 hover:border-red-300 transition-all duration-200'
                >
                  Clear Selection
                </button>
              )}
            </div>
          </>
        ) : (
          <div className='text-center py-8'>
            <div className='mb-4'>
              <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No Available Slots</h3>
            <p className='text-gray-600'>
              All appointment slots for the next 7 days are fully booked or unavailable. 
              Please try again tomorrow or contact the clinic directly.
            </p>
          </div>
        )}
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
} 

export default Appointment;
