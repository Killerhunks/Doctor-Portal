import React from 'react';
import { assets } from '../assets/assets';
import {useNavigate} from 'react-router-dom'

const Contact = () => {
  const Navigate=useNavigate();
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 px-6 md:px-20 py-16 text-gray-700">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">
          Get in <span className="text-blue-600">Touch</span>
        </h2>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          We're here to help you with any questions, feedback, or support you need.
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-12 bg-white p-8 md:p-12 rounded-xl shadow-lg">
        {/* Image */}
        <div className="flex-1">
          <img
            src={assets.contact_image}
            alt="Contact Illustration"
            className="w-full max-w-md mx-auto rounded-lg shadow-md"
          />
        </div>

        {/* Text Info */}
        <div className="flex-1 space-y-6">
          <p className="text-lg leading-relaxed">
            At <strong>Prescripto</strong>, we believe in staying connected with our users. Whether
            you're a patient looking for help with appointments, or a healthcare provider seeking
            partnership, our team is just a message away.
          </p>

          <p className="text-lg leading-relaxed">
            We value your time and your feedback. Our support team is available 7 days a week to
            assist you. From technical issues to general inquiries, we're committed to responding
            promptly and professionally.
          </p>

          <p className="text-lg leading-relaxed">
            Your voice matters to us — help us improve, grow, and serve you better.
          </p>

          {/* Contact Info */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-4">
              <span className="text-blue-600 text-2xl">📍</span>
              <p className="text-base text-gray-700">123 Health Street, MedCity, India</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-600 text-2xl">📞</span>
              <p className="text-base text-gray-700">+91 9721631005</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-600 text-2xl">📧</span>
              <p className="text-base text-gray-700">support@prescripto.com</p>
            </div>
          </div>
          <button onClick={()=>Navigate('/login')} className='text center bg-blue-500 py-4 px-6 rounded-full hover:bg-blue-600 hover:scale-105 transition-all'>Explore Jobs</button>
        </div>
      </div>

      {/* Extra Section */}
      <div className="mt-16 max-w-4xl mx-auto text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          We're Always Listening
        </h3>
        <p className="text-lg text-gray-600 leading-relaxed">
          Our mission is to make healthcare more accessible and reliable for everyone. Your
          suggestions, concerns, and feedback help shape the future of Prescripto. Don’t hesitate to
          reach out — whether it’s a bug, a compliment, or a collaboration idea, we’re here to hear
          it all.
        </p>
      </div>
    </div>
  );
};

export default Contact;
