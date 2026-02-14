"use client"
import React from "react"
import {
  Plane,
  FileText,
  Shield,
  CheckCircle,
  Globe,
  Zap,
  Clock,
  Award,
  Users,
  Target,
  Sparkles,
  Star,
  TrendingUp,
  BookOpen,
  MessageCircle,
  Calendar,
  MapPin,
  ChevronRight,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const VisaAssistancePage: React.FC = () => {
  const mainFeatures = [
    {
      title: "The Seamless Promise",
      description:
        "From virtual tours to key-handover, we handle the lease complexities and security deposits so you can focus on your orientation. Turn complex paperwork into a stamped passport with our File-to-Flight experience.",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "The Elite Network",
      description:
        "Skip the uncertainty with high-priority guidance from former visa officers and certified consultants specializing in US, UK, Canada, and Schengen visas.",
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Student-First Precision",
      description:
        "Secure a higher success rate with meticulous document auditing and mock interviews tailored to your specific university profile.",
      icon: Target,
      color: "from-orange-500 to-red-500",
    },
  ]

  const visaTypes = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaType: "F-1 Student Visa",
      successRate: "96%",
      processingTime: "2-4 weeks",
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      visaType: "Student Visa (Tier 4)",
      successRate: "94%",
      processingTime: "3-4 weeks",
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      visaType: "Study Permit",
      successRate: "95%",
      processingTime: "4-6 weeks",
    },
    {
      country: "Schengen Zone",
      flag: "🇪🇺",
      visaType: "Student Visa (Type D)",
      successRate: "93%",
      processingTime: "2-3 weeks",
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      visaType: "Subclass 500",
      successRate: "97%",
      processingTime: "3-5 weeks",
    },
    {
      country: "New Zealand",
      flag: "🇳🇿",
      visaType: "Student Visa",
      successRate: "95%",
      processingTime: "3-4 weeks",
    },
  ]

  const processSteps = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "Free assessment of your profile and visa eligibility",
      icon: MessageCircle,
    },
    {
      step: "2",
      title: "Document Preparation",
      description: "Expert guidance on compiling required documents",
      icon: FileText,
    },
    {
      step: "3",
      title: "Application Filing",
      description: "Meticulous review and submission of your application",
      icon: CheckCircle,
    },
    {
      step: "4",
      title: "Interview Preparation",
      description: "Mock interviews and personalized coaching",
      icon: Users,
    },
    {
      step: "5",
      title: "Follow-up Support",
      description: "Post-submission tracking and communication",
      icon: Clock,
    },
    {
      step: "6",
      title: "Visa Approval",
      description: "Celebrate your success and prepare for departure",
      icon: Plane,
    },
  ]

  const services = [
    {
      icon: FileText,
      title: "Document Review",
      description: "Comprehensive audit of all required documents",
    },
    {
      icon: MessageCircle,
      title: "Mock Interviews",
      description: "Practice sessions with visa experts",
    },
    {
      icon: Shield,
      title: "Success Guarantee",
      description: "97% average approval rate across all visa types",
    },
    {
      icon: Calendar,
      title: "Timeline Management",
      description: "Stay on track with personalized deadlines",
    },
    {
      icon: BookOpen,
      title: "Country-Specific Guidance",
      description: "Expert knowledge of local requirements",
    },
    {
      icon: Users,
      title: "Former Visa Officers",
      description: "Insider perspective on application review",
    },
    {
      icon: TrendingUp,
      title: "Application Optimization",
      description: "Maximize your chances of approval",
    },
    {
      icon: Globe,
      title: "Embassy Coordination",
      description: "Direct diplomatic channels for smooth processing",
    },
  ]

  const stats = [
    { value: "10k+", label: "Visas Processed", icon: FileText },
    { value: "97%", label: "Success Rate", icon: TrendingUp },
    { value: "40+", label: "Countries Covered", icon: Globe },
    { value: "4.9/5", label: "Client Rating", icon: Star },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      university: "Stanford University",
      country: "USA",
      text: "The visa process seemed daunting, but Eduabroad made it seamless. Got my F-1 visa approved in just 3 weeks!",
      rating: 5,
    },
    {
      name: "Rahul Verma",
      university: "University of Toronto",
      country: "Canada",
      text: "Their mock interviews were invaluable. I felt completely prepared and confident during my actual visa interview.",
      rating: 5,
    },
    {
      name: "Ananya Patel",
      university: "King's College London",
      country: "UK",
      text: "Professional, efficient, and supportive throughout. They helped me navigate every step of the UK student visa process.",
      rating: 5,
    },
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen mt-[50px] sm:mt-0">

        {/* Main Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Redefining Visa Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three core pillars that make your visa journey seamless and successful
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

        {/* Visa Types Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Globe className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Visa Expertise</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Countries We Specialize In
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expert guidance for student visas across major study destinations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaTypes.map((visa, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{visa.flag}</div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#A51C30] transition-colors">
                        {visa.country}
                      </h3>
                      <p className="text-sm text-gray-600">{visa.visaType}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-2xl font-bold text-[#A51C30] mb-1">
                        {visa.successRate}
                      </div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {visa.processingTime}
                      </div>
                      <div className="text-xs text-gray-600">Processing Time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process Steps Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Our Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Journey to Visa Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven 6-step process designed to maximize your approval chances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#A51C30] group"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#A51C30] to-[#6B1420] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-end mb-4">
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#A51C30]" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#A51C30] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>

                  {/* Connection Line for Desktop */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ChevronRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Services Grid Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Zap className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Premium Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comprehensive Visa Support
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need for a successful visa application
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                  >
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-3 inline-flex mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#A51C30]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
              
        {/* Testimonials Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from students who achieved their visa dreams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="font-bold text-gray-900 mb-1">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {testimonial.university}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-[#A51C30] font-semibold">
                    <MapPin className="w-4 h-4" />
                    {testimonial.country}
                  </div>
                </div>
              </div>
            ))}
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
              <Plane className="w-4 h-4" />
              <span className="text-sm font-semibold">Your Journey Starts Here</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Begin Your Visa Journey?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join thousands of students who trusted Eduabroad with their visa applications. 
              Let our experts guide you from application to approval.
            </p>
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-12 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                  <p className="text-white/90">Former Visa Officers on Team</p>
                </div>
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <p className="text-white/90">97% Success Rate Guarantee</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                  <p className="text-white/90">24/7 Application Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default VisaAssistancePage