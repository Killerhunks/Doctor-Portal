import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [isLoading, setIsLoading] = useState(false) 

  const { aToken, BACKEND_URL } = useContext(AdminContext)

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    
    if (!docImg || !name || !email || !password || !speciality || !degree || !about || !fees || !experience || !address1 || !address2) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsLoading(true); 
    
    try {
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify({
        line1: address1,
        line2: address2
      }));

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            'atoken': aToken
          }
        }
      )
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form after successful submission
        setDocImg(null);
        setName('');
        setEmail('');
        setPassword('');
        setExperience('');
        setFees('');
        setAbout('');
        setSpeciality('');
        setDegree('');
        setAddress1('');
        setAddress2('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while adding the doctor');
      }
    } finally {
      setIsLoading(false); // ✅ Stop loading in both success and error cases
    }
  }

  return (
    <div className="h-screen w-full bg-blue-50 flex items-center justify-center overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-[90vh] overflow-y-auto p-8 rounded-xl shadow-lg">
        <form className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-600">Add Doctor</h2>

          {/* Upload */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="doc-img" className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <img
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                alt="Upload"
                className="w-36 h-36 object-cover border-2 border-blue-300 rounded-full"
              />
            </label>
            <input
              type="file"
              id="doc-img"
              accept="image/*"
              onChange={(e) => setDocImg(e.target.files[0])}
              disabled={isLoading} // ✅ Disable during loading
              hidden
            />
            <p className="text-sm text-gray-600 text-center">Upload doctor <br /> picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Field 
                label="Your Name" 
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={setName} 
                disabled={isLoading} // ✅ Disable during loading
              />
              <Field 
                label="Doctor Email" 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={setEmail} 
                disabled={isLoading} 
              />
              <Field 
                label="Doctor Password" 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={setPassword} 
                disabled={isLoading} 
              />
              <Select 
                label="Doctor Experience" 
                value={experience} 
                onChange={setExperience}
                options={Array.from({ length: 10 }, (_, i) => `${i + 1} Year`)} 
                disabled={isLoading} 
              />
              <Field 
                label="Fees" 
                type="number" 
                placeholder="Fees" 
                value={fees} 
                onChange={setFees} 
                disabled={isLoading} 
              />
            </div>

            <div className="space-y-4">
              <Select
                label="Speciality"
                value={speciality}
                onChange={setSpeciality}
                options={[
                  "General physician", "Gynecologist", "Dermatologist",
                  "Pediatricians", "Neurologist", "Gastroenterologist"
                ]}
                disabled={isLoading}
              />
              <Field 
                label="Education" 
                type="text" 
                placeholder="Education" 
                value={degree} 
                onChange={setDegree} 
                disabled={isLoading} 
              />
              <div>
                <label className="text-blue-700 block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Address 1"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  disabled={isLoading} // ✅ Disable during loading
                  className={`w-full border border-blue-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  placeholder="Address 2"
                  required
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  disabled={isLoading} // ✅ Disable during loading
                  className={`w-full border border-blue-300 rounded-md p-2 mt-2 focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <label className="text-blue-700 block mb-1">About Doctor</label>
            <textarea
              rows={4}
              placeholder="Write about Doctor"
              required
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              disabled={isLoading} // ✅ Disable during loading
              className={`w-full border border-blue-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Button with Loading State */}
          <div className="text-center">
            <button
              type="submit"
              onClick={handleAddDoctor}
              disabled={isLoading} // ✅ Disable button during loading
              className={`px-6 py-2 rounded-md transition flex items-center justify-center mx-auto min-w-[120px] ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isLoading ? (
                <>
                  {/* ✅ Loading Spinner */}
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Doctor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ✅ Updated Field Component with disabled prop
const Field = ({ label, type, placeholder, value, onChange, disabled = false }) => (
  <div>
    <label className="text-blue-700 block mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required
      className={`w-full border border-blue-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    />
  </div>
)

// ✅ Updated Select Component with disabled prop
const Select = ({ label, options, value, onChange, disabled = false }) => (
  <div>
    <label className="text-blue-700 block mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required
      className={`w-full border border-blue-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    >
      <option value="" disabled>Select {label}</option>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </div>
)

export default AddDoctor
