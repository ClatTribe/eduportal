"use client";
import React from "react";

const ContactUs = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';
  
  const whatsappNumber = '919044442989';
  const phoneNumber = '+91 9044442989';
  const email = 'info@goeduabroad.com';
  const communityLink = 'https://chat.whatsapp.com/LJ8HLXT5ML8D4uLHqFqfed';

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  const handleWhatsAppGroup = () => {
    window.open(communityLink, '_blank');
  };

  return (
    <div className="flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="max-w-6xl w-full">
        <div 
          className="rounded-3xl shadow-xl p-8 md:p-16"
          style={{ 
            backgroundColor: 'white',
            border: `2px solid ${borderColor}`
          }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* LEFT SIDE - Social & WhatsApp Group */}
            <div className="text-center space-y-8">
              
              {/* Social Icons */}
              <div className="flex justify-center gap-6">
                <a 
                  href="https://www.youtube.com/@goeduabroadofficial" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                  style={{
                    backgroundColor: lightBg,
                    border: `2px solid ${borderColor}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                  }}
                >
                  <svg className="w-6 h-6" style={{ color: accentColor }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a 
                  href="https://www.instagram.com/goeduabroadofficial/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                  style={{
                    backgroundColor: lightBg,
                    border: `2px solid ${borderColor}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                  }}
                >
                  <svg className="w-6 h-6" style={{ color: accentColor }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                <a 
                  href="https://www.linkedin.com/company/goeduabroad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                  style={{
                    backgroundColor: lightBg,
                    border: `2px solid ${borderColor}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0A66C2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                  }}
                >
                  <svg className="w-6 h-6" style={{ color: '#0A66C2' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center">
                <div 
                  className="rounded-3xl p-4 shadow-lg"
                  style={{
                    backgroundColor: 'white',
                    border: `2px solid ${borderColor}`
                  }}
                >
                  <img 
                    src="https://res.cloudinary.com/daetdadtt/image/upload/v1768989964/WhatsApp_Image_2026-01-21_at_15.28.27_et90sl.jpg"
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-gray-700 text-lg font-medium">
                  Stay updated on anything related to IELTS
                </p>
                <p className="text-gray-600 text-base">
                  Entrance Exams & get access to various free resources
                </p>
                <p className="text-gray-600 text-base">
                  and mentorship.
                </p>
              </div>

              {/* Join Community Button */}
              <button
                onClick={handleWhatsAppGroup}
                className="font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${accentColor}, ${secondaryAccent})`,
                  color: 'white'
                }}
              >
                Join Our Community
              </button>

            </div>

            {/* RIGHT SIDE - Contact Info */}
            <div className="space-y-8">
              
              {/* Interested Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full font-bold text-xl py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${accentColor}, ${secondaryAccent})`,
                  color: 'white'
                }}
              >
                Interested? WhatsApp Us
              </button>

              {/* Phone Number */}
              <div className="text-center">
                <a 
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className="text-3xl font-bold transition-colors"
                  style={{ color: accentColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = secondaryAccent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = accentColor;
                  }}
                >
                  {phoneNumber}
                </a>
              </div>

              {/* Email */}
              <div className="text-center space-y-2">
                <a 
                  href={`mailto:${email}`}
                  className="text-2xl font-semibold transition-colors"
                  style={{ color: accentColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = secondaryAccent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = accentColor;
                  }}
                >
                  {email}
                </a>
                <p className="text-gray-600 text-lg">
                  Email us for any queries
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;