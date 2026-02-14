"use client"
import React from "react"
import {
  DollarSign,
  FileText,
  Shield,
  CheckCircle,
  Globe,
  ArrowRight,
  Zap,
  Clock,
  Award,
  Users,
  Target,
  Sparkles,
  Star,
  TrendingUp,
  CreditCard,
  MessageCircle,
  Calendar,
  MapPin,
  Building2,
  ChevronRight,
  Banknote,
  Wallet,
  FileCheck,
  Send,
  Lock,
  PiggyBank,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const ForexSupportPage: React.FC = () => {
  const mainFeatures = [
    {
      title: "Transparent & Competitive Rates",
      description:
        "Access foreign currency at market-leading exchange rates with zero hidden charges. Our transparent pricing model ensures you get the best value for every transaction, backed by real-time rate updates.",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "RBI-Compliant Excellence",
      description:
        "Navigate complex forex regulations effortlessly with our expert compliance team. Every transaction follows Reserve Bank of India guidelines, ensuring complete legal safety and peace of mind.",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Swift & Secure Transfers",
      description:
        "Meet critical university payment deadlines with our time-efficient process. From tuition fees to living expenses, your funds reach their destination securely and on schedule.",
      icon: Zap,
      color: "from-orange-500 to-amber-500",
    },
  ]

  const forexServices = [
    {
      service: "Tuition Fee Remittance",
      icon: "🎓",
      currency: "Multiple Currencies",
      transferTime: "1-2 business days",
      description: "Direct university payments with full tracking",
    },
    {
      service: "Living Expense Transfers",
      icon: "🏠",
      currency: "All Major Currencies",
      transferTime: "Same day - 48 hours",
      description: "Flexible transfers for accommodation & daily needs",
    },
    {
      service: "Forex Cards & Travel Cards",
      icon: "💳",
      currency: "Multi-currency cards",
      transferTime: "Instant activation",
      description: "Competitive rates with global acceptance",
    },
    {
      service: "Currency Notes",
      icon: "💵",
      currency: "50+ Currencies",
      transferTime: "2-3 days delivery",
      description: "Cash in hand before departure",
    },
    {
      service: "Education Loan Disbursement",
      icon: "🏦",
      currency: "Loan Currency Support",
      transferTime: "3-5 business days",
      description: "Direct coordination with lenders",
    },
    {
      service: "Compliance Documentation",
      icon: "📋",
      currency: "All Transactions",
      transferTime: "Real-time support",
      description: "Complete RBI paperwork assistance",
    },
  ]

  const processSteps = [
    {
      step: "1",
      title: "Requirement Analysis",
      description: "Free consultation to understand your forex needs and timelines",
      icon: MessageCircle,
    },
    {
      step: "2",
      title: "Document Collection",
      description: "Simple checklist of required documents for compliance",
      icon: FileText,
    },
    {
      step: "3",
      title: "Rate Lock & Booking",
      description: "Secure the best exchange rate for your transaction",
      icon: Lock,
    },
    {
      step: "4",
      title: "Compliance Processing",
      description: "Our team handles all RBI formalities and paperwork",
      icon: FileCheck,
    },
    {
      step: "5",
      title: "Transfer Execution",
      description: "Swift and secure fund transfer to your destination",
      icon: Send,
    },
    {
      step: "6",
      title: "Confirmation & Tracking",
      description: "Real-time updates until funds reach the recipient",
      icon: CheckCircle,
    },
  ]

  const services = [
    {
      icon: TrendingUp,
      title: "Best Exchange Rates",
      description: "Market-competitive rates updated in real-time",
    },
    {
      icon: Shield,
      title: "RBI Compliance",
      description: "100% regulatory adherence for all transactions",
    },
    {
      icon: Clock,
      title: "Quick Processing",
      description: "Fast approvals aligned with university deadlines",
    },
    {
      icon: Wallet,
      title: "Multiple Payment Options",
      description: "Cards, wire transfers, and currency notes",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Personal forex advisor for your journey",
    },
    {
      icon: Building2,
      title: "University Coordination",
      description: "Direct communication with institutional accounts",
    },
    {
      icon: FileCheck,
      title: "Document Assistance",
      description: "Expert help with Form A2, LRS, and more",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Services for 50+ countries worldwide",
    },
  ]

  const stats = [
    { value: "₹500Cr+", label: "Forex Processed", icon: DollarSign },
    { value: "99.8%", label: "On-Time Delivery", icon: Clock },
    { value: "15k+", label: "Happy Students", icon: Users },
    { value: "50+", label: "Countries Served", icon: Globe },
  ]

  const testimonials = [
    {
      name: "Arjun Mehta",
      university: "MIT",
      country: "USA",
      text: "EduAbroad made my tuition payment seamless. Competitive rates, quick transfer, and the team handled all the compliance paperwork. Highly recommended!",
      rating: 5,
    },
    {
      name: "Sneha Krishnan",
      university: "University of Melbourne",
      country: "Australia",
      text: "I was worried about forex regulations, but their team guided me through every step. Got the best rates and my forex card was ready before my flight!",
      rating: 5,
    },
    {
      name: "Karan Singh",
      university: "University of Manchester",
      country: "UK",
      text: "From education loan disbursement to living expense transfers, they handled everything professionally. The transparency and speed were impressive!",
      rating: 5,
    },
  ]

  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: "₹83.45" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: "₹105.20" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", rate: "₹61.75" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", rate: "₹54.30" },
    { code: "EUR", name: "Euro", flag: "🇪🇺", rate: "₹90.15" },
    { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", rate: "₹50.85" },
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen mt-[50px] sm:mt-0">

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420] overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">End-to-End Forex Solutions</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Seamless Forex Support for<br />Your Study Abroad Journey
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                From currency exchange to compliance documentation, we handle every aspect of your international payments with transparency and efficiency
              </p>

              {/* Stats Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                      <Icon className="w-8 h-8 mx-auto mb-3 text-white/80" />
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Why Choose EduAbroad</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Trusted Forex Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three pillars that make international payments stress-free and secure
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
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8" strokeWidth={2} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#A51C30] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Forex Services Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Wallet className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Forex Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comprehensive Currency Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every forex service you need, all under one roof
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forexServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{service.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#A51C30] transition-colors">
                        {service.service}
                      </h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {service.currency}
                      </div>
                      <div className="text-xs text-gray-600">Coverage</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#A51C30] mb-1">
                        {service.transferTime}
                      </div>
                      <div className="text-xs text-gray-600">Processing Time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Exchange Rates Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Live Rates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Today's Exchange Rates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Competitive rates updated in real-time for major currencies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((currency, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currency.flag}</span>
                    <div>
                      <div className="font-bold text-gray-900">{currency.code}</div>
                      <div className="text-sm text-gray-600">{currency.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#A51C30]">{currency.rate}</div>
                    <div className="text-xs text-green-600 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3" />
                      Live
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              * Rates are indicative and subject to change. Final rates confirmed at booking.
            </p>
          </div>
        </div>

        {/* Process Steps Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Target className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">How It Works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple 6-Step Process
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From consultation to confirmation, we make forex transactions effortless
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
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#A51C30] to-[#6B1420] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>

                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-[#A51C30]" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#A51C30] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>

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
        </div>

        {/* Services Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-[#A51C30]" />
              <span className="text-sm font-semibold text-[#A51C30]">Premium Benefits</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Students Trust Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive support that goes beyond just currency exchange
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

        {/* Testimonials Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                <Star className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Student Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real experiences from students who trusted us with their forex needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>

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
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-semibold">Start Your Forex Journey</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready for Hassle-Free Forex?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join 15,000+ students who trust EduAbroad for secure, transparent, and efficient international payments. Let our experts handle your forex needs.
            </p>

            <div className="mt-12 pt-12 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <p className="text-white/90">100% RBI Compliant</p>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-300" />
                  <p className="text-white/90">Best Exchange Rates Guaranteed</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                  <p className="text-white/90">Same-Day Processing Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default ForexSupportPage