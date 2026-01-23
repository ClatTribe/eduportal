"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  /**
   * Reliable cross-page section navigation
   */
  const navigateToSection = async (id: string) => {
    // Check if we're already on the home page
    const isHomePage = window.location.pathname === "/";

    if (!isHomePage) {
      await router.push("/");
      // Wait for navigation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    // Scroll to the section
    setTimeout(
      () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      },
      isHomePage ? 50 : 200,
    );

    setMobileMenuOpen(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-2">
            <img
              src="/edulogo.png"
              alt="EduNext Logo"
              width={34}
              height={34}
              className="h-12 w-32 object-contain"
            />
            <span className="relative inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#A51C30] to-[#d4243e] rounded-full overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer"></span>
              <span className="relative">BETA</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigateToSection("trust-section")}
              className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer"
            >
              Features
            </button>

            <button
              onClick={() => navigateToSection("why-us")}
              className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer"
            >
              Why Us
            </button>
            <Link
              href="/ielts-online-test-kit"
              className="text-sm font-medium text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer"
            >
              IELTS Online Test Kit
            </Link>

            {user ? (
              <>
                <Link
                  href="/home"
                  className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-full"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="group px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-1"
                >
                  Logout
                  <LogOut
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                  <User size={16} className="text-[#A51C30]" />
                  <span className="text-sm font-medium text-slate-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-full"
                >
                  Log In
                </Link>

                <Link
                  href="/register"
                  className="group px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full flex items-center gap-1"
                >
                  Get Started
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
            {user && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-2">
                <User size={20} className="text-[#A51C30]" />
                <span className="text-sm font-medium text-slate-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            )}

            <button
              onClick={() => navigateToSection("trust-section")}
              className="text-lg font-medium text-slate-800 text-left"
            >
              Features
            </button>

            <button
              onClick={() => navigateToSection("why-us")}
              className="text-lg font-medium text-slate-800 text-left"
            >
              Why Us
            </button>
            <Link
              href="/ielts-online-test-kit"
              className="text-lg font-bold text-slate-600 hover:text-[#A51C30] transition-colors cursor-pointer"
            >
              IELTS Online Test Kit
            </Link>

            <hr className="border-slate-100" />

            {user ? (
              <>
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-xl"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-center font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center font-medium text-[#A51C30] bg-blue-50 hover:bg-blue-100 rounded-xl"
                >
                  Log In
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
