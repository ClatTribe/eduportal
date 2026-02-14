"use client"
import React, { useState } from "react"
import {
  Shield,
  FileText,
  Heart,
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
  Plane,
  MessageCircle,
  Calendar,
  MapPin,
  Building2,
  ChevronRight,
  Ambulance,
  Phone,
  FileCheck,
  Briefcase,
  Hospital,
  Stethoscope,
  Umbrella,
  LifeBuoy,
  AlertCircle,
  X,
  Check,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const InsuranceSupportPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const mainFeatures = [
    {
      title: "Comprehensive Coverage",
      description:
        "From routine medical care to emergency evacuation, our insurance plans provide complete protection. We ensure your policy meets both visa requirements and university mandates, giving you comprehensive coverage across all scenarios.",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Expert Policy Guidance",
      description:
        "Navigate complex insurance requirements with confidence. Our experts help you compare plans, understand coverage limits, and select the perfect policy that balances protection with affordability.",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "24/7 Emergency Support",
      description:
        "Access round-the-clock assistance when you need it most. From claim filing to emergency medical coordination, our support team ensures you're never alone during critical moments abroad.",
      icon: Phone,
      color: "from-orange-500 to-red-500",
    },
  ]

  const insurancePlans = [
    {
      name: "Essential",
      price: "$299",
      period: "/year",
      popular: false,
      features: [
        "Health coverage up to $100,000",
        "Emergency medical evacuation",
        "24/7 helpline support",
        "Outpatient care",
        "Prescription drugs",
        "Basic dental coverage"
      ],
      ideal: "Budget-conscious students",
      color: "blue"
    },
    {
      name: "Premium",
      price: "$599",
      period: "/year",
      popular: true,
      features: [
        "Health coverage up to $500,000",
        "Emergency & medical evacuation",
        "24/7 priority support",
        "Comprehensive outpatient care",
        "Mental health coverage",
        "Dental & vision coverage",
        "Travel & baggage insurance",
        "Personal liability protection"
      ],
      ideal: "Most students - Best value",
      color: "red"
    },
    {
      name: "Elite",
      price: "$999",
      period: "/year",
      popular: false,
      features: [
        "Health coverage up to $1,000,000",
        "Worldwide medical evacuation",
        "Dedicated support manager",
        "Full outpatient & inpatient care",
        "Extended mental health support",
        "Premium dental & vision",
        "Comprehensive travel insurance",
        "Legal assistance included",
        "Family visit coverage"
      ],
      ideal: "Maximum protection needed",
      color: "purple"
    }
  ]

  const coverageTypes = [
    {
      icon: Hospital,
      title: "Medical & Health",
      items: ["Hospitalization", "Surgery & Procedures", "Doctor Visits", "Lab Tests", "Prescription Medications", "Mental Health Counseling"],
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Plane,
      title: "Travel & Transit",
      items: ["Trip Cancellation", "Lost Baggage", "Flight Delays", "Emergency Return", "Transit Accidents", "Document Loss"],
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Ambulance,
      title: "Emergency Services",
      items: ["Emergency Room", "Ambulance Services", "Medical Evacuation", "Repatriation", "Emergency Dental", "24/7 Hotline"],
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: Heart,
      title: "Wellness & Prevention",
      items: ["Annual Checkups", "Vaccinations", "Mental Health", "Therapy Sessions", "Health Screening", "Preventive Care"],
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ]

  const countryRequirements = [
    {
      country: "United States",
      flag: "🇺🇸",
      requirement: "Mandatory",
      minAmount: "$100,000",
      avgCost: "$500-1,500",
      details: "Most universities require comprehensive health insurance. Waiver possible with equivalent coverage.",
      universities: ["Harvard", "MIT", "Stanford", "Yale"]
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      requirement: "IHS Fee",
      minAmount: "NHS Access",
      avgCost: "£470/year",
      details: "Immigration Health Surcharge mandatory. Additional private insurance recommended for comprehensive coverage.",
      universities: ["Oxford", "Cambridge", "Imperial", "UCL"]
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      requirement: "Provincial + Private",
      minAmount: "$100,000",
      avgCost: "$600-900",
      details: "Provincial health plans have waiting periods. Private insurance crucial for initial months.",
      universities: ["Toronto", "UBC", "McGill", "Waterloo"]
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      requirement: "OSHC Mandatory",
      minAmount: "OSHC Required",
      avgCost: "$450-600",
      details: "Overseas Student Health Cover (OSHC) is visa requirement. Must be maintained throughout stay.",
      universities: ["Melbourne", "ANU", "Sydney", "UNSW"]
    }
  ]

  const claimSteps = [
    {
      number: "01",
      title: "Immediate Notification",
      description: "Contact our 24/7 helpline within 48 hours of incident",
      tip: "Keep all medical receipts and reports",
      icon: Phone
    },
    {
      number: "02",
      title: "Document Collection",
      description: "Gather medical bills, prescriptions, and incident reports",
      tip: "Take photos of all documents",
      icon: FileText
    },
    {
      number: "03",
      title: "Claim Submission",
      description: "Submit through our online portal or mobile app",
      tip: "Our team reviews before final submission",
      icon: FileCheck
    },
    {
      number: "04",
      title: "Processing & Review",
      description: "Insurance company reviews claim (usually 5-10 days)",
      tip: "Track status in real-time via portal",
      icon: TrendingUp
    },
    {
      number: "05",
      title: "Reimbursement",
      description: "Direct deposit to your account upon approval",
      tip: "Average processing: 15 days",
      icon: CheckCircle
    }
  ]

  const stats = [
    { value: "10,000+", label: "Students Protected", icon: Users, color: "text-blue-600" },
    { value: "98.5%", label: "Claim Success", icon: CheckCircle, color: "text-green-600" },
    { value: "15 Days", label: "Avg. Processing", icon: Clock, color: "text-orange-600" },
    { value: "24/7", label: "Support Access", icon: Phone, color: "text-purple-600" },
  ]

  const testimonials = [
    {
      name: "Riya Sharma",
      university: "Columbia University",
      country: "USA",
      image: "👩‍🎓",
      text: "Had a medical emergency in NYC. EduAbroad's team coordinated everything with the hospital, filed my claim, and I received reimbursement within 10 days. Couldn't be more grateful!",
      rating: 5,
      amount: "$8,500",
      claimType: "Emergency Surgery"
    },
    {
      name: "Aditya Patel",
      university: "University of Sydney",
      country: "Australia",
      image: "👨‍🎓",
      text: "Lost my laptop and baggage during transit. Travel insurance covered everything. The claims process was incredibly smooth with their expert guidance.",
      rating: 5,
      amount: "$2,100",
      claimType: "Lost Baggage"
    },
    {
      name: "Priya Nair",
      university: "University of Toronto",
      country: "Canada",
      image: "👩‍💼",
      text: "Understanding Canadian insurance was confusing. Their team explained provincial vs private coverage perfectly and helped me choose the right plan.",
      rating: 5,
      amount: "Saved $400",
      claimType: "Policy Guidance"
    }
  ]

  const faqs = [
    {
      question: "When should I purchase insurance?",
      answer: "Ideally before your visa interview, as some consulates require proof of insurance. At minimum, purchase before departure."
    },
    {
      question: "Can I use university health services with private insurance?",
      answer: "Yes! Most private plans work alongside university health centers. We help coordinate coverage between both."
    },
    {
      question: "What if I need to extend my policy?",
      answer: "Easy! Contact us 30 days before expiry. Extensions are processed within 48 hours with no coverage gaps."
    },
    {
      question: "Are pre-existing conditions covered?",
      answer: "Coverage varies by plan and condition. We help you find policies that accommodate your medical history."
    }
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-white min-h-screen mt-[50px] sm:mt-0">

        {/* Hero Section - Different Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#A51C30]">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#A51C30] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Trusted by 10,000+ Students</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Insurance That
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A51C30] to-pink-500">
                    Actually Protects
                  </span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Comprehensive health, travel, and emergency coverage designed for international students. Meet visa requirements while staying fully protected abroad.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="group bg-[#A51C30] hover:bg-[#8A1828] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                    Get Free Quote
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                    Compare Plans
                  </button>
                </div>
              </div>

              {/* Right - Feature Cards */}
              <div className="space-y-4">
                {mainFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#A51C30] transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Plans - Pricing Cards */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
                <Umbrella className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Choose Your Protection</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Plans for Every Budget
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From essential coverage to comprehensive protection - find the perfect plan for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {insurancePlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-3xl ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-[#A51C30] to-[#6B1420] text-white shadow-2xl shadow-red-500/30 scale-105' 
                      : 'bg-white border-2 border-gray-200'
                  } p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${!plan.popular && 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className={`text-lg ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {plan.ideal}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-green-300' : 'text-green-600'
                        }`} />
                        <span className={`text-sm ${!plan.popular && 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-[#A51C30] hover:bg-gray-100'
                      : 'bg-[#A51C30] text-white hover:bg-[#8A1828]'
                  }`}>
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Need help choosing? Our experts are here to guide you</p>
              <button className="text-[#A51C30] font-semibold hover:underline flex items-center gap-2 mx-auto">
                <Phone className="w-4 h-4" />
                Schedule Free Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Coverage Types - Grid Layout */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">What's Covered</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Complete Protection Package
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every aspect of your health and safety, meticulously covered
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {coverageTypes.map((coverage, index) => {
                const Icon = coverage.icon
                return (
                  <div
                    key={index}
                    className={`${coverage.bgColor} rounded-2xl p-8 border-2 border-transparent hover:border-gray-300 transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 bg-white rounded-xl shadow-md ${coverage.iconColor}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {coverage.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {coverage.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Country Requirements - Accordion Style */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
                <Globe className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Know Before You Go</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Insurance Requirements by Country
              </h2>
              <p className="text-xl text-gray-600">
                Every destination has unique requirements - we've got them covered
              </p>
            </div>

            <div className="space-y-4">
              {countryRequirements.map((country, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#A51C30] transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{country.flag}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{country.country}</h3>
                          <p className="text-sm text-gray-600">Top Universities: {country.universities.join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Avg. Annual Cost</div>
                        <div className="text-xl font-bold text-[#A51C30]">{country.avgCost}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Requirement Type</div>
                        <div className="font-semibold text-gray-900">{country.requirement}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Minimum Coverage</div>
                        <div className="font-semibold text-gray-900">{country.minAmount}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{country.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Process - Timeline Design */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4">
                <FileCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">Simple & Fast</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Claim Your Benefits in 5 Easy Steps
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We've streamlined the claims process to get you reimbursed quickly
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#A51C30] to-transparent"></div>

              <div className="space-y-12">
                {claimSteps.map((step, index) => {
                  const Icon = step.icon
                  const isEven = index % 2 === 0
                  
                  return (
                    <div key={index} className="relative">
                      <div className={`flex flex-col md:flex-row gap-8 items-center ${!isEven && 'md:flex-row-reverse'}`}>
                        {/* Content */}
                        <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#A51C30] transition-all duration-300">
                            <div className={`flex items-start gap-4 ${isEven && 'md:flex-row-reverse'}`}>
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#A51C30] to-[#6B1420] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                  {step.number}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 mb-3">{step.description}</p>
                                <div className="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg">
                                  <Sparkles className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm text-yellow-800 font-medium">{step.tip}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="hidden md:block relative z-10">
                          <div className="w-16 h-16 bg-white border-4 border-[#A51C30] rounded-full flex items-center justify-center shadow-lg">
                            <Icon className="w-7 h-7 text-[#A51C30]" />
                          </div>
                        </div>

                        {/* Empty Space */}
                        <div className="flex-1 hidden md:block"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-4 rounded-2xl border-2 border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-gray-900">98% of claims approved within 15 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials - Card Slider Design */}
        <div className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Real Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Students We've Protected
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Real experiences, real claims, real peace of mind
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{testimonial.image}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.university}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{testimonial.country}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial */}
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.text}"
                  </p>

                  {/* Claim Info */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Claim Amount</div>
                        <div className="text-lg font-bold text-[#A51C30]">{testimonial.amount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Claim Type</div>
                        <div className="text-sm font-semibold text-gray-900">{testimonial.claimType}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs - Minimal Design */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Got Questions?</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                    <span className="text-[#A51C30] flex-shrink-0">Q.</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Can't find your answer?</p>
              <button className="text-[#A51C30] font-semibold hover:underline flex items-center gap-2 mx-auto">
                <MessageCircle className="w-4 h-4" />
                Chat with our insurance expert
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section - Bold Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to Study Abroad with Complete Peace of Mind?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-10">
                Join 10,000+ students protected by EduAbroad's comprehensive insurance coverage
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-300" />
                  </div>
                  <p className="text-white/90 font-medium">98% Claim Approval Rate</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Phone className="w-7 h-7 text-blue-300" />
                  </div>
                  <p className="text-white/90 font-medium">24/7 Emergency Support</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Globe className="w-7 h-7 text-yellow-300" />
                  </div>
                  <p className="text-white/90 font-medium">Coverage in 40+ Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DefaultLayout>
  )
}

export default InsuranceSupportPage