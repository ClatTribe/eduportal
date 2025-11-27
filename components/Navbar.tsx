"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext'; // Your actual auth context

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth(); // Get user and signOut from your auth context

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-[#FEF2F3]/80 backdrop-blur-md border-b border-[#FECDD3] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-[#A51C30] rounded-lg flex items-center justify-center">
            <span className="text-[#FFFFFF] font-bold text-xl">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#A51C30]">EduPortal</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[#A51C30] hover:text-[#FCA5A5] transition-colors cursor-pointer">
            Features
          </a>
          <a href="#mission" className="text-sm font-medium text-[#A51C30] hover:text-[#FCA5A5] transition-colors cursor-pointer">
            Our Mission
          </a>
          <a href="#trust" className="text-sm font-medium text-[#A51C30] hover:text-[#FCA5A5] transition-colors cursor-pointer">
            Why Us
          </a>

          {user ? (
            <>
              <Link href="/home" className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-[#FEF2F3] hover:bg-[#FECDD3] rounded-full transition-colors cursor-pointer">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="group px-4 py-2 text-sm font-medium text-[#FFFFFF] bg-[#A51C30] hover:bg-[#FECDD3] rounded-full transition-all flex items-center gap-1 cursor-pointer"
              >
                Logout <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF2F3] rounded-full border border-[#FECDD3]">
                <User size={16} className="text-[#A51C30]" />
                <span className="text-sm font-medium text-[#A51C30]">{user.user_metadata?.full_name || user.email}</span>
              </div>
            </>
          ) : (
            <>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-[#FEF2F3] hover:bg-[#FECDD3] rounded-full transition-colors cursor-pointer">
                Log In
              </Link>
              <Link href="/register" className="group px-4 py-2 text-sm font-medium text-[#FFFFFF] bg-[#A51C30] hover:bg-[#FECDD3] rounded-full transition-all flex items-center gap-1 cursor-pointer">
                Get Started <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#A51C30] cursor-pointer">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FEF2F3] border-b border-[#FECDD3] p-6 flex flex-col gap-4 shadow-xl">
          {user && (
            <div className="flex items-center gap-2 p-3 bg-[#FECDD3] rounded-xl mb-2">
              <User size={20} className="text-[#A51C30]" />
              <span className="text-sm font-medium text-[#A51C30]">{user.user_metadata?.full_name || user.email}</span>
            </div>
          )}

          <a href="#features" className="text-lg font-medium text-[#A51C30] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Features
          </a>
          <a href="#mission" className="text-lg font-medium text-[#A51C30] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Our Mission
          </a>
          <a href="#trust" className="text-lg font-medium text-[#A51C30] cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
            Why Us
          </a>
          <hr className="border-[#FECDD3]" />

          {user ? (
            <>
              <Link href="/home" className="w-full py-3 text-center font-medium text-[#A51C30] bg-[#FEF2F3] hover:bg-[#FECDD3] rounded-xl cursor-pointer">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 text-center font-medium text-[#FFFFFF] bg-[#A51C30] hover:bg-[#FECDD3] rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="w-full py-3 text-center font-medium text-[#A51C30] bg-[#FEF2F3] hover:bg-[#FECDD3] rounded-xl cursor-pointer">
                Log In
              </Link>
              <Link href="/register" className="w-full py-3 text-center font-medium text-[#FFFFFF] bg-[#A51C30] hover:bg-[#FECDD3] rounded-xl cursor-pointer">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
