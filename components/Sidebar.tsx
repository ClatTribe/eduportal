"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  DollarSign,
  Users,
  Building2,
  GraduationCap,
  LogOut,
  ThumbsUp,
  Menu,
  X,
  TicketsPlane,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onSignOut }) => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = {
    main: [
      { icon: Sparkles, label: "Sam AI", path: "/sam-ai" },
      { icon: User, label: "Profile", path: "/profile" },
    ],
    explore: [
      { icon: BookOpen, label: "Course Finder", path: "/course-finder" },
      { icon: Users, label: "Admit Finder", path: "/admit-finder" },
      { icon: DollarSign, label: "Scholarship Finder", path: "/scholarship-finder" },
      { icon: Building2, label: "Shortlist Builder", path: "/shortlist-builder" },
      { icon: Building2, label: "Compare Your College", path: "/compare-your-college" },
    ],
    applications: [
      { icon: BookOpen, label: "Application Builder", path: "/application-builder" },
      { icon: GraduationCap, label: "Document Upload", path: "/document" },
    ],
    Tools: [
      { icon: TicketsPlane, label: "Fly & Settle Services", path: "/fly-&-settle-services" },
      { icon: GraduationCap, label: "Study Materials", path: "/study-material" },
    ],
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await onSignOut();
      router.push("/register");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#FEF2F3] to-[#FEF2F3] border-b border-[#FECDD3] shadow-md z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <img
                src="/edulogo.png"
                alt="EduNext Logo"
                width={34}
                height={34}
                className="h-10 w-32 object-contain brightness-110"
              />
            </Link>
            <span className="relative inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#A51C30] to-[#d4243e] rounded-full overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer"></span>
              <span className="relative">BETA</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-[#A51C30]" />
            ) : (
              <Menu size={24} className="text-[#A51C30]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky top-0 h-screen
          w-64 bg-gradient-to-b from-[#FEF2F3] to-[#FEF2F3]
          p-4 border-r border-[#FECDD3] flex flex-col shadow-lg
          transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header - Hidden on mobile */}
        <div className="mb-8 hidden md:block">
          <div className="flex flex-col items-center gap-2 mb-2">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/edulogo.png"
                alt="EduNext Logo"
                width={34}
                height={34}
                className="h-12 w-64 object-contain brightness-110"
              />
            </Link>
            <span className="relative inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#A51C30] to-[#d4243e] rounded-full overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer"></span>
              <span className="relative">BETA</span>
            </span>
          </div>
        </div>

        {/* Mobile: Add padding top */}
        <div className="md:hidden h-4"></div>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-white rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-[#A51C30]" />
        </button>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-3 mb-6 shadow-sm border border-[#FECDD3]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-sm text-gray-600 flex-shrink-0">Welcome,</div>
            <div className="text-[#A51C30] font-semibold truncate">{userName}</div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#FCA5A5] scrollbar-track-transparent">
          {/* Main Navigation */}
          {navItems.main.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-white shadow-md border-l-4 border-[#A51C30] text-[#A51C30]"
                  : "hover:bg-white hover:shadow-sm"
              }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-[#A51C30]"
                    : "text-gray-600 group-hover:text-[#A51C30]"
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? "font-semibold"
                    : "group-hover:text-[#A51C30]"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* Register / Sign Up Button */}
          {/* <button
            onClick={() => handleNavClick("/register")}
            className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
              isActive("/register")
                ? "bg-white shadow-md border-l-4 border-[#A51C30] text-[#A51C30]"
                : "bg-gradient-to-r from-[#A51C30] to-[#d4243e] text-white hover:from-[#8B1528] hover:to-[#A51C30] shadow-sm"
            }`}
          >
            <UserPlus
              size={18}
              className={isActive("/register") ? "text-[#A51C30]" : "text-white"}
            />
            <span className={`text-sm font-semibold ${isActive("/register") ? "" : "text-white"}`}>
              Register / Sign Up
            </span>
          </button> */}

          {/* Explore Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-[#A51C30] uppercase tracking-wider">
                Explore
              </div>
              <div className="flex-1 h-px bg-[#FECDD3]"></div>
            </div>
            {navItems.explore.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-[#A51C30] text-[#A51C30]"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-[#A51C30]"
                      : "text-gray-600 group-hover:text-[#A51C30]"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-[#A51C30]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Applications Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-[#A51C30] uppercase tracking-wider">
                Applications
              </div>
              <div className="flex-1 h-px bg-[#FECDD3]"></div>
            </div>
            {navItems.applications.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-[#A51C30] text-[#A51C30]"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-[#A51C30]"
                      : "text-gray-600 group-hover:text-[#A51C30]"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-[#A51C30]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="text-xs font-bold text-[#A51C30] uppercase tracking-wider">
                Tools
              </div>
              <div className="flex-1 h-px bg-[#FECDD3]"></div>
            </div>
            {navItems.Tools.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full text-left rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-white shadow-md border-l-4 border-[#A51C30] text-[#A51C30]"
                    : "hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-[#A51C30]"
                      : "text-gray-600 group-hover:text-[#A51C30]"
                  }`}
                />
                <span
                  className={`text-sm transition-colors ${
                    isActive(item.path)
                      ? "font-semibold"
                      : "group-hover:text-[#A51C30]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-[#FECDD3]">
          <button
            onClick={async (e) => {
              e.preventDefault();
              await handleLogout();
            }}
            disabled={isLoggingOut}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            className="flex items-center justify-between gap-3 p-3 w-full text-left bg-white hover:bg-[#FEF2F3] rounded-lg text-[#A51C30] transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A51C30]"></div>
              ) : (
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </div>
            {!isLoggingOut && (
              <ThumbsUp
                size={16}
                className={`transition-all duration-300 ${
                  isLogoutHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;