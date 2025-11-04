import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white py-16 px-6 md:px-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 tracking-wide">
          About <span className="text-blue-600">Prescripto</span>
        </h2>
        <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
          Revolutionizing healthcare accessibility — one appointment at a time.
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-12 bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div className="flex-1 text-gray-700 space-y-6">
          <p>
            At <strong>Prescripto</strong>, we believe healthcare should be simple, accessible, and stress-free. That’s why we’ve built a platform that empowers patients to easily book appointments, view doctor availability, and manage medical records — all in one place.
          </p>
          <p>
            Whether you're scheduling your first consultation or managing ongoing care, our intuitive platform helps connect you with the right healthcare professionals quickly and reliably.
          </p>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Our Vision</h3>
            <p>
              To revolutionize digital healthcare by bridging the gap between patients and medical professionals, ensuring quality care is just a click away.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Our Mission</h3>
            <p>
              We are on a mission to simplify healthcare access through innovation and empathy — enabling users to take control of their health journey.
            </p>
          </div>
        </div>

        <div className="flex-1">
          <img
            src={assets.about_image}
            alt="Prescripto About"
            className="w-full max-w-md rounded-xl shadow-md mx-auto"
          />
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-20">
        <h3 className="text-3xl font-semibold text-center text-gray-800 mb-6">Why Choose Us?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: '📅',
              title: 'Easy Appointments',
              desc: 'Book appointments anytime with real-time doctor availability.',
            },
            {
              icon: '🔒',
              title: 'Secure Records',
              desc: 'All your health data, safely stored and easily accessible.',
            },
            {
              icon: '🤝',
              title: 'Trusted Doctors',
              desc: 'Get access to verified and experienced healthcare professionals.',
            },
            {
              icon: '💬',
              title: 'Instant Support',
              desc: 'Our team is here to help you 24/7 with any queries.',
            },
            {
              icon: '🚀',
              title: 'Fast & Reliable',
              desc: 'Lightning-fast platform performance even on mobile.',
            },
            {
              icon: '⚙️',
              title: 'Tech Powered',
              desc: 'We evolve constantly with AI, cloud & secure technologies.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition duration-300 border-t-4 border-blue-500"
            >
              <div className="text-4xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-lg text-gray-700 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Developer Section */}
      <div className="mt-24 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-8">Meet the Developer</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 bg-white rounded-xl p-8 shadow-xl max-w-4xl mx-auto">
          {/* Image */}
          <img
            src="https://avatars.githubusercontent.com/u/00000000" 
            alt="Dhairya Tiwari"
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />

          {/* Info */}
          <div className="text-center md:text-left space-y-3">
            <h4 className="text-2xl font-semibold text-gray-700">Dhairya Tiwari</h4>
            <p className="text-gray-500 text-sm">
              Developer • Passionate about full-stack development and building innovative web solutions.
            </p>
            <div className="flex justify-center md:justify-start gap-6 text-xl text-blue-600 mt-2">
              <a
                href="https://github.com/Dhairyatiwari7"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="hover:text-blue-800 transition"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/dhairya-tiwari-70a481347"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="hover:text-blue-800 transition"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="mailto:dhairyatiwari186@gmail.com"
                title="Email"
                className="hover:text-blue-800 transition"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
