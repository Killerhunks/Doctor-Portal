import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from 'react-toastify'

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { getAvailableDoctors } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response=await getAvailableDoctors();
        console.log(response);
        setDoctors(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, [getAvailableDoctors]);

  

  const allSpecialities = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  const applyFilter = () => {
    if (speciality) {
      const filtered = doctors.filter(
        (item) => item.speciality.toLowerCase() === speciality.toLowerCase()
      );
      setFilterDoc(filtered);
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, doctors]);

  // Toggle filter logic: if same speciality clicked again → show all doctors
  const handleSpecialityClick = (spec) => {
    if (spec.toLowerCase() === speciality?.toLowerCase()) {
      navigate("/doctors");
    } else {
      navigate(`/doctors/${spec}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="md:grid md:grid-cols-[260px_1fr] md:gap-8">
        {/* Speciality filter sidebar / horizontal bar */}
        <aside
          className="
            bg-white shadow-md rounded-lg p-4 mb-6
            overflow-x-auto whitespace-nowrap
            md:block md:w-auto md:sticky md:top-20 md:mb-0
          "
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Browse by Speciality
          </h2>
          <ul className="flex gap-3 md:flex-col md:gap-3">
            {allSpecialities.map((spec) => (
              <li
                key={spec}
                onClick={() => handleSpecialityClick(spec)}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-all duration-300 inline-block
                  ${
                    spec.toLowerCase() === speciality?.toLowerCase()
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-blue-50"
                  }
                `}
              >
                {spec}
              </li>
            ))}
          </ul>
        </aside>

        {/* Doctor cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterDoc.length > 0 ? (
            filterDoc.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <img
                  className="w-full h-48 object-cover object-top bg-blue-50"
                  src={item.image}
                  alt={item.name}
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    <span>Available</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.speciality}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full">
              No doctors found for this speciality.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Doctors;
