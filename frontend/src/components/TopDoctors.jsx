import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const TopDoctors = () => {
  const Navigate = useNavigate();
  const {doctors}=useContext(AppContext);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10 md:px-10 text-gray-900">
      <h1 className="text-2xl md:text-3xl font-semibold text-center">Top Doctors To Book</h1>
      <p className="w-full sm:w-2/3 md:w-1/3 text-center text-sm text-gray-600">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full pt-5">
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible pb-4 scrollbar-hide">
          {doctors.slice(0, 10).map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                Navigate(`/appointment/${item._id}`);
                scrollTo(0, 0);
              }}
              className="min-w-[220px] md:min-w-0 flex-shrink-0 border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 bg-white shadow-md"
            >
              <img
                className="w-full h-44 object-cover bg-blue-50"
                src={item.image}
                alt={item.name}
              />
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Available</span>
                </div>
                <p className="font-medium text-base truncate">{item.name}</p>
                <p className="text-sm text-gray-600">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          Navigate('/doctors');
          scrollTo(0, 0);
        }}
        className="mt-6 px-6 py-2 bg-primary text-white rounded-full hover:bg-blue-700 transition-all"
      >
        View More
      </button>
    </div>
  );
};

export default TopDoctors;
