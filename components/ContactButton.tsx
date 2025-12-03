import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, Headphones, X } from 'lucide-react';

const ExpertContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const phoneNumber = '9044442989';

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMainButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/91${phoneNumber}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="fixed bottom-4 right-6 z-50">
      {/* Contact Options */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-2 mb-2 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Call Button */}
        <button
          onClick={handleCall}
          className="flex items-center gap-2 bg-white hover:bg-[#A51C30]/5 text-gray-800 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group border border-[#A51C30]/20 animate-slideUp"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#A51C30] to-[#8A1828] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Phone size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm pr-1">Call Us</span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-2 bg-white hover:bg-green-50 text-gray-800 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group border border-green-200 animate-slideUp"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm pr-1">WhatsApp</span>
        </button>
      </div>

      {/* Main Button */}
      <button
        onClick={handleMainButtonClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative bg-gradient-to-r from-[#A51C30] to-[#8A1828] hover:from-[#8A1828] hover:to-[#6D1320] text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group rounded-full
          ${isOpen ? 'scale-95' : 'scale-100'}
          md:px-4 md:py-2.5 px-3 py-3 w-12 h-12 md:w-auto md:h-auto justify-center md:justify-start
        `}
      >
        {isOpen ? (
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <Headphones
            size={20}
            className={`transition-transform duration-300 ${
              isHovered ? 'rotate-12 scale-110' : ''
            }`}
          />
        )}
        <span className="font-bold text-sm whitespace-nowrap hidden md:inline">
          {isOpen ? 'Close' : 'Talk to Our Experts'}
        </span>

        {/* Pulse Animation Ring */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-[#A51C30] animate-ping opacity-20"></div>
        )}
      </button>

      {/* Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
          opacity: 0;
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default ExpertContactButton;