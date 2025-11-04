import React, { useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RelatedDoctors = ({ speciality, docId }) => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const [relDoc, setRelDoc] = useState([])
  useEffect(() => {
    if (doctors.length > 0 && speciality && docId) {
      const doctorsData = doctors.filter((item) => item.speciality === speciality && item._id !== docId)
      setRelDoc(doctorsData)
    }
  }, [doctors, speciality, docId])
  return (
    <div className="flex flex-col items-center gap-4 m-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium text-center">Related Doctors</h1>

      <div
        className={`w-full pt-5 px-3 sm:px-0 ${relDoc.slice(0, 5).length < 5
            ? "flex flex-wrap justify-center gap-6"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          }`}
      >
        {relDoc.slice(0, 5).map((item, idx) => (
          <div
            onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0)}}
            key={idx}
            className="w-[250px] sm:w-[270px] md:w-[280px] border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 bg-white shadow-sm"
          >
            <img
              className="w-full h-48 object-cover bg-blue-50"
              src={item.image}
              alt={item.name}
            />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>Available</p>
              </div>
              <p className="font-semibold text-base">{item.name}</p>
              <p className="text-sm text-gray-600">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>


      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="mt-6 px-6 py-2 bg-blue-50 text-gray-600 rounded-full hover:bg-blue-100 transition-all"
      >
        More
      </button>
    </div>


  )
}

export default RelatedDoctors