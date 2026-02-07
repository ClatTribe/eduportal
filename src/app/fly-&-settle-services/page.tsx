"use client"
import React from "react"
import {
  DollarSign,
  Home,
  FileText,
  Banknote,
  Shield,
  Plane,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import DefaultLayout from "../defaultLayout"

const FlyAndSettleServices: React.FC = () => {
  const services = [
    {
      id: 1,
      title: "Loans",
      description: "Get financial assistance for your education abroad with competitive interest rates and flexible repayment options.",
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      hoverColor: "group-hover:border-emerald-400",
      link: "/fly-&-settle-services/loans"
    },
    {
      id: 2,
      title: "Accommodation",
      description: "Find the perfect place to stay with our verified accommodation options near your university campus.",
      icon: Home,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      hoverColor: "group-hover:border-blue-400",
      link: "/fly-&-settle-services/accommodation"
    },
    {
      id: 3,
      title: "Visa Assistance",
      description: "Navigate the visa process with ease. Our experts will guide you through every step of your application.",
      icon: FileText,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      hoverColor: "group-hover:border-purple-400",
      link: "/fly-&-settle-services/visa-assistance"
    },
    {
      id: 4,
      title: "Forex",
      description: "Get the best foreign exchange rates and convenient currency conversion for your international journey.",
      icon: Banknote,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      hoverColor: "group-hover:border-amber-400",
      link: "#"
    },
    {
      id: 5,
      title: "Insurance",
      description: "Protect yourself with comprehensive travel and health insurance coverage tailored for international students.",
      icon: Shield,
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700",
      hoverColor: "group-hover:border-rose-400",
      link: "#"
    },
    {
      id: 6,
      title: "Pick Up Services",
      description: "Arrive stress-free with our airport pickup services. We'll be there to welcome you and get you settled.",
      icon: Plane,
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-700",
      hoverColor: "group-hover:border-cyan-400",
      link: "#"
    }
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#A51C30] rounded-full p-2">
                <Sparkles className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-bold text-[#A51C30]">
                Fly and Settle Services
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Everything you need to make your study abroad journey smooth and hassle-free
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <a
                  key={service.id}
                  href={service.link}
                  className={`group bg-white rounded-xl p-6 border-2 ${service.borderColor} ${service.hoverColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Icon Container */}
                  <div className={`${service.bgColor} rounded-2xl p-4 inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={service.textColor} size={32} strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#A51C30] transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Call to Action */}
                  <div className="flex items-center gap-2 text-[#A51C30] font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Learn More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )
            })}
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Need Help Choosing the Right Service?
              </h2>
              <p className="text-gray-600 mb-6">
                Our team of experts is here to guide you through every step of your journey. 
                Get personalized recommendations based on your unique needs.
              </p>
              <button className="bg-[#A51C30] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8A1828] transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                <Sparkles size={18} />
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default FlyAndSettleServices