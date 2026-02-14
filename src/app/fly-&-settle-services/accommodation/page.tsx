"use client"
import React from "react"
import {
  Home,
  MapPin,
  Shield,
  Wifi,
  CheckCircle,
  Building2,
  Users,
  BookOpen,
  Sparkles,
  Star,
  Globe,
  ArrowRight,
  Zap,
  Key,
  Coffee,
  Dumbbell,
  Clock,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const AccommodationPage: React.FC = () => {
  const mainFeatures = [
    {
      title: "Cross Borders Without Stress",
      description:
        "Eduabrod has re-imagined the international student living experience by securing exclusive stays near top global universities for a seamless 'Check-in to Class' experience.",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "The Elite Network",
      description:
        "Skip the search fatigue with high-priority access to premier housing partners like Casita, Amber, and University Living.",
      icon: Star,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Student-First Spaces",
      description:
        "Secure safe, vetted, and fully-furnished stays designed for your lifestyle—featuring high-speed Wi-Fi, study zones, and vibrant student communities.",
      icon: Shield,
      color: "from-orange-500 to-red-500",
    },
  ]

  const amenities = [
    {
      icon: Wifi,
      title: "High-Speed Wi-Fi",
      description: "Blazing fast internet for seamless studying and streaming",
    },
    {
      icon: BookOpen,
      title: "Study Zones",
      description: "Quiet, dedicated spaces designed for focused learning",
    },
    {
      icon: Users,
      title: "Student Communities",
      description: "Connect with peers from around the globe",
    },
    {
      icon: Shield,
      title: "Safe & Vetted",
      description: "All properties thoroughly verified for your safety",
    },
    {
      icon: Home,
      title: "Fully Furnished",
      description: "Move-in ready with everything you need",
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Walking distance to campus and city centers",
    },
    {
      icon: Key,
      title: "Easy Check-In",
      description: "Hassle-free move-in process with 24/7 support",
    },
    {
      icon: Coffee,
      title: "Common Areas",
      description: "Lounges, kitchens, and social spaces",
    },
    {
      icon: Dumbbell,
      title: "Fitness Centers",
      description: "Stay active with on-site gym facilities",
    },
    {
      icon: Clock,
      title: "24/7 Security",
      description: "Round-the-clock surveillance and support",
    },
  ]

  const partners = [
    { name: "Casita", logo: "🏠" },
    { name: "Amber", logo: "🔶" },
    { name: "University Living", logo: "🎓" },
    { name: "Student.com", logo: "🌍" },
    { name: "Collegiate AC", logo: "🏛️" },
    { name: "Campus Living", logo: "🏫" },
  ]

  const stats = [
    { value: "50+", label: "Partner Properties", icon: Building2 },
    { value: "30+", label: "Countries Covered", icon: Globe },
    { value: "10k+", label: "Students Housed", icon: Users },
    { value: "4.8/5", label: "Average Rating", icon: Star },
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen mt-[70px] sm:mt-0 ">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420]">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
                <Home className="w-4 h-4" />
                <span className="text-sm font-semibold">Premium Student Accommodation</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Global Living.
                <br />
                <span className="bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 bg-clip-text text-transparent">
                  Local Comfort.
                </span>
              </h1>

              <p className="text-2xl md:text-3xl font-semibold mb-4 text-white/95">
                Your Home Away From Home
              </p>

              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Experience world-class student living with curated accommodations near top universities. 
                We make your transition seamless so you can focus on what matters - your education.
              </p>

              {/* CTA Buttons */}
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
            </svg>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-[#A51C30]" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-[#A51C30] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Redefining Student Living
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've reimagined accommodation for international students with three core pillars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#A51C30]/20 overflow-hidden"
                >
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#A51C30] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Zap className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Premium Amenities</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need, All in One Place
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Modern facilities designed to enhance your student experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                  >
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-3 inline-flex mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#A51C30]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {amenity.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {amenity.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Building2 className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Trusted Partners</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Elite Housing Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We partner with the world's leading student accommodation providers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#A51C30] hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {partner.logo}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#A51C30] transition-colors">
                    {partner.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 italic">
              ...and many more trusted accommodation providers worldwide
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
              <Home className="w-4 h-4" />
              <span className="text-sm font-semibold">Start Your Journey</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Find Your Perfect Stay?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Let us help you secure safe, comfortable, and convenient accommodation near your dream university. Your journey begins here.
            </p>

            {/* Trust Indicators */}
            <div className="mt-12 pt-12 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                  <p className="text-white/90">100% Verified Properties</p>
                </div>
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <p className="text-white/90">Secure Booking Process</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                  <p className="text-white/90">24/7 Student Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default AccommodationPage