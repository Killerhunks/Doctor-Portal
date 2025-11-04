import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const Navigate = useNavigate();

  return (
    <footer className="bg-gray-100 px-6 md:px-20 pt-20 pb-10 text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-10 text-sm">
        <div>
          <img className="mb-5 w-36" src={assets.logo} alt="Logo" />
          <p className="max-w-md text-gray-600 leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text ever since the 1500s.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-gray-600 hover:text-gray-900 transition">
            <li className="cursor-pointer hover:underline" onClick={() =>{Navigate('/'); scrollTo(0,0)}}>Home</li>
            <li className="cursor-pointer hover:underline" onClick={() => {Navigate('/about'); scrollTo(0,0)}}>About Us</li>
            <li className="cursor-pointer hover:underline" onClick={() => {Navigate('/contact'); scrollTo(0,0)}}>Contact Us</li>
            <li className="cursor-pointer hover:underline" onClick={() => {Navigate('/privacy-policy'); scrollTo(0,0)}}>Privacy Policy</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
          <ul className="space-y-2 text-gray-600">
            <li>+91 9721631005</li>
            <li>dhairyatiwari186@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <hr className="border-gray-300" />
        <p className="text-center text-xs mt-4 text-gray-500">
          © 2025 Dhairya — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
