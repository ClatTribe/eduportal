"use client"
import React from "react"
import {
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  Clock,
  Sparkles,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const LoansPage: React.FC = () => {
  const features = [
    {
      title: "Break the Currency Barrier",
      description:
        "We've re-engineered study abroad financing by connecting your talent with India's top financial powerhouses for a seamless, 'Paper-to-Plane' experience.",
      icon: TrendingUp,
    },
    {
      title: "The Elite Network",
      description:
        "Skip the queue with high-priority, fast-track processing through our exclusive banking partners like Credila, Axis, IDFC, and more.",
      icon: Building2,
    },
    {
      title: "Student-First Edge",
      description:
        "Secure competitive interest rates and tailored terms designed for your potential, not just your balance.",
      icon: Users,
    },
    {
      title: "The Seamless Promise",
      description:
        "Total peace of mind from the first form to final disbursement. We handle the complexity; you handle the packing.",
      icon: Shield,
    },
  ]

  const benefits = [
    "Competitive interest rates starting from 8.5%",
    "Loan amounts up to ₹1.5 Crore",
    "Flexible repayment tenure up to 15 years",
    "Moratorium period available",
    "Minimal documentation required",
    "Quick approval process (7-10 days)",
  ]

  const partners = [
    "Credila",
    "Axis Bank",
    "IDFC First Bank",
    "HDFC Bank",
    "ICICI Bank",
    "SBI",
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 mt-[72px] sm:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#A51C30] to-[#8A1828] rounded-2xl p-8 md:p-12 mb-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <DollarSign size={36} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Education Loans
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold mb-3">
              High Ambitions. Low Barriers. Fund Your Global Future.
            </p>
            <p className="text-white/90 text-lg max-w-3xl">
              Break free from financial constraints and pursue your dreams abroad with our comprehensive loan solutions tailored for ambitious students.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Sparkles className="text-[#A51C30]" size={32} />
              Why Choose Our Loan Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#A51C30] hover:shadow-xl transition-all duration-300"
                  >
                    <div className="bg-rose-50 rounded-2xl p-3 inline-flex mb-4">
                      <Icon className="text-[#A51C30]" size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Key Benefits */}
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle className="text-[#A51C30]" size={28} />
                Key Benefits
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-emerald-100 rounded-full p-1 mt-1">
                      <CheckCircle className="text-emerald-600" size={16} />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner Banks */}
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="text-[#A51C30]" size={28} />
                Our Banking Partners
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-[#A51C30] transition-all text-center font-semibold text-gray-700 hover:shadow-md"
                  >
                    {partner}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-6 italic">
                ...and many more trusted financial institutions
              </p>
            </div>
          </div>

        </div>
      </div>
    </DefaultLayout>
  )
}

export default LoansPage