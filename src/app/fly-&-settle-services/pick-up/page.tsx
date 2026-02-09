"use client"
import React, { useState } from "react"
import {
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  MessageCircle,
  Calendar,
  Luggage,
  Home,
  Phone,
  AlertCircle,
  Globe,
  Headphones,
  UserCheck,
  Sparkles,
  BadgeCheck,
  
  Route,

  Handshake,
  CircleDot
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const AirportPickupPage: React.FC = () => {

  const mainFeatures = [
    {
      title: "Pre-Scheduled Airport Transfers",
      description:
        "Book your airport pickup in advance and travel with complete peace of mind. We arrange everything before your departure so you can focus on your journey, knowing reliable transport awaits you upon landing.",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Trusted Local Service Providers",
      description:
        "We partner with verified, professional drivers who specialize in student arrivals. Our providers are carefully selected for their reliability, safety standards, and understanding of international student needs.",
      icon: BadgeCheck,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Initial Settling-In Assistance",
      description:
        "More than just a ride - our drivers help you navigate your first hours in a new country. From basic orientation to getting you safely settled at your accommodation, we ensure a smooth start to your journey.",
      icon: Home,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Emergency Arrival Coordination",
      description:
        "Flight delays, lost luggage, or unexpected changes? Our support team is ready to assist. We provide emergency coordination to ensure you're never stranded, no matter what challenges arise during arrival.",
      icon: Headphones,
      color: "from-orange-500 to-red-500",
    },
  ]

  const serviceFeatures = [
    {
      icon: Shield,
      title: "Safe & Reliable",
      description: "All drivers are background-verified and fully licensed",
      items: ["Licensed drivers", "Insured vehicles", "Safety protocols", "Real-time tracking"]
    },
    {
      icon: Clock,
      title: "Stress-Free Experience",
      description: "Eliminate arrival anxiety with pre-arranged transport",
      items: ["No waiting confusion", "Pre-confirmed pickup", "Flight monitoring", "Luggage assistance"]
    },
    {
      icon: Handshake,
      title: "Student-Focused Service",
      description: "Drivers experienced with international student needs",
      items: ["Cultural awareness", "Patient & helpful", "Local knowledge", "Move-in support"]
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Available in major study destinations worldwide",
      items: ["40+ cities", "Popular universities", "Major airports", "Expanding network"]
    }
  ]

  const whyNeedPickup = [
    {
      icon: AlertCircle,
      title: "Navigating a New Country",
      description: "Arriving in an unfamiliar country can be overwhelming - especially when you don't know the local language, currency, or transportation system.",
      challenge: "First-time travelers often struggle with directions and public transport"
    },
    {
      icon: Luggage,
      title: "Heavy Luggage Management",
      description: "International students typically travel with multiple suitcases, making public transport difficult and taxi-finding stressful at arrival.",
      challenge: "Managing 2-3 heavy bags while navigating an airport is exhausting"
    },
    {
      icon: MapPin,
      title: "Finding Your Accommodation",
      description: "Locating your new accommodation in an unknown city, especially after a long flight, can be confusing and time-consuming.",
      challenge: "Wrong addresses, complex directions, or late-night arrivals add stress"
    },
    {
      icon: Shield,
      title: "Safety Concerns",
      description: "Safety is paramount, especially when arriving alone in a new country. Unverified taxi services or getting lost pose real risks.",
      challenge: "Parents worry about students arriving safely at their destination"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Book in Advance",
      description: "Share your flight details and accommodation address when you book with us",
      icon: Calendar,
      timing: "At least 5-7 days before departure"
    },
    {
      step: "2",
      title: "We Arrange Everything",
      description: "We coordinate with trusted local providers and confirm all pickup details",
      icon: Handshake,
      timing: "Confirmation within 48 hours"
    },
    {
      step: "3",
      title: "Receive Pickup Details",
      description: "Get driver information, contact details, and meeting point before your flight",
      icon: Phone,
      timing: "24-48 hours before arrival"
    },
    {
      step: "4",
      title: "Smooth Arrival",
      description: "Your driver meets you at the designated point and assists with luggage",
      icon: UserCheck,
      timing: "At your scheduled arrival time"
    },
    {
      step: "5",
      title: "Safe Transfer",
      description: "Direct transport to your accommodation with settling-in assistance",
      icon: Home,
      timing: "Typically 30-60 minutes drive"
    }
  ]

  const destinations = [
    {
      country: "United States",
      flag: "🇺🇸",
      cities: ["New York", "Boston", "Los Angeles", "Chicago", "San Francisco", "Washington DC"],
      popular: true
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      cities: ["London", "Manchester", "Edinburgh", "Birmingham", "Leeds", "Cambridge"],
      popular: true
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Waterloo"],
      popular: true
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
      popular: true
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart"],
      popular: false
    },
    {
      country: "Ireland",
      flag: "🇮🇪",
      cities: ["Dublin", "Cork", "Galway", "Limerick"],
      popular: false
    },
    {
      country: "New Zealand",
      flag: "🇳🇿",
      cities: ["Auckland", "Wellington", "Christchurch", "Dunedin"],
      popular: false
    },
    {
      country: "Netherlands",
      flag: "🇳🇱",
      cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"],
      popular: false
    }
  ]

  const stats = [
    { value: "15,000+", label: "Students Transported", icon: Users },
    { value: "40+", label: "Cities Covered", icon: Globe },
    { value: "99%", label: "On-Time Arrivals", icon: Clock },
    { value: "100%", label: "Verified Drivers", icon: BadgeCheck },
  ]

  const testimonials = [
    {
      name: "Ananya Deshmukh",
      university: "Columbia University, NYC",
      country: "USA",
      image: "👩‍🎓",
      text: "Landing at JFK at midnight was scary, but my driver was waiting right where they said. He helped with my 3 suitcases and even stopped at a 24-hour store so I could buy essentials. Made my first night so much easier!",
      rating: 5
    },
    {
      name: "Rohan Malhotra",
      university: "University of Toronto",
      country: "Canada",
      image: "👨‍🎓",
      text: "My flight got delayed by 5 hours, but the driver adjusted and was still there when I landed. He gave me great tips about the city during the drive and helped me find my apartment building in the dark. Such a relief!",
      rating: 5
    },
    {
      name: "Priya Krishnan",
      university: "University of Melbourne",
      country: "Australia",
      image: "👩‍💼",
      text: "As a first-time solo traveler, I was really nervous. The driver was so kind and patient, showed me how to use my new Opal card, and made sure I knew where the nearest grocery store was. Couldn't have asked for better support!",
      rating: 5
    }
  ]

  const faqs = [
    {
      question: "How far in advance should I book the pickup service?",
      answer: "We recommend booking at least 5-7 days before your arrival date to ensure availability and proper coordination with local providers. However, we can accommodate last-minute bookings depending on availability."
    },
    {
      question: "What happens if my flight is delayed?",
      answer: "Our service includes flight monitoring. If your flight is delayed, we automatically coordinate with the driver to adjust the pickup time. There's no extra charge for reasonable delays. Just inform us of your updated arrival time if possible."
    },
    {
      question: "How will I recognize my driver?",
      answer: "You'll receive driver details 24-48 hours before arrival, including their name, phone number, and photo. The driver will meet you at the designated meeting point (which we'll specify) and will have identification ready. Some services also provide name boards."
    },
    {
      question: "What if I have a lot of luggage?",
      answer: "Please inform us about your luggage quantity when booking. We'll arrange appropriate vehicle size to accommodate all your belongings comfortably. Most students travel with 2-3 large suitcases plus hand luggage, which is standard."
    },
    {
      question: "Is this service available for late-night arrivals?",
      answer: "Yes! We provide airport pickup services for all arrival times, including late-night and early-morning flights. Safety is our priority, especially for off-peak arrival times."
    },
    {
      question: "What kind of settling-in assistance is provided?",
      answer: "Drivers can help orient you to your accommodation, assist with heavy luggage to your room, and provide basic local information. For extended settling support (like grocery shopping or area tours), this can be arranged in advance for an additional fee."
    }
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-white min-h-screen mt-[50px] sm:mt-0">

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#A51C30] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Trusted by 15,000+ International Students</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
                Arrive Safely & Confidently
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A51C30] to-pink-500">
                  In Your New Country
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Pre-arranged airport pickup services that minimize arrival stress for first-time international travelers. 
                From touchdown to accommodation - we ensure a smooth, safe transition.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <Icon className="w-6 h-6 text-[#A51C30] mb-2 mx-auto" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Service Highlights */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Our Service Highlights</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What Makes Our Pickup Service Special
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive support from airport to accommodation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#A51C30] transition-all duration-300 hover:shadow-lg"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
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
        </div>

        {/* Why You Need This Service */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full mb-4">
                <AlertCircle className="w-4 h-4 text-[#A51C30]" />
                <span className="text-sm font-semibold text-[#A51C30]">Common Challenges</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why First-Time Travelers Need This
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Arriving in a new country presents unique challenges - we help you overcome them
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {whyNeedPickup.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#A51C30] transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-red-50 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#A51C30]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-800 font-medium">{item.challenge}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Service Features Grid */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Complete Peace of Mind
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need for a stress-free arrival
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {serviceFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#A51C30] to-[#6B1420] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4">
                <Route className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How Airport Pickup Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Five simple steps from booking to safe arrival
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Connecting Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#A51C30] to-transparent transform -translate-x-1/2"></div>

              <div className="space-y-12">
                {howItWorks.map((step, index) => {
                  const Icon = step.icon
                  const isEven = index % 2 === 0
                  
                  return (
                    <div key={index} className="relative">
                      <div className={`flex flex-col md:flex-row gap-8 items-center ${!isEven && 'md:flex-row-reverse'}`}>
                        {/* Content */}
                        <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-600 mb-3">{step.description}</p>
                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-800 font-medium">{step.timing}</span>
                            </div>
                          </div>
                        </div>

                        {/* Step Number */}
                        <div className="hidden md:block relative z-10">
                          <div className="w-16 h-16 bg-white border-4 border-[#A51C30] rounded-full flex items-center justify-center shadow-lg">
                            <Icon className="w-7 h-7 text-[#A51C30]" />
                          </div>
                        </div>

                        {/* Empty space for alignment */}
                        <div className="flex-1 hidden md:block"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Coverage */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Global Presence</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Available in Major Study Destinations
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We provide airport pickup services in 40+ cities across 8 countries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((dest, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                    dest.popular 
                      ? 'bg-gradient-to-br from-rose-50 to-red-50 border-[#A51C30]' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{dest.flag}</span>
                    {dest.popular && (
                      <span className="bg-[#A51C30] text-white text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{dest.country}</h3>
                  <div className="space-y-1">
                    {dest.cities.map((city, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CircleDot className="w-3 h-3 text-gray-400" />
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Don't see your destination listed?</p>
              <button className="text-[#A51C30] font-semibold hover:underline">
                Contact us to check availability in your city →
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 bg-gradient-to-br from-gray-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Student Experiences</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Real Stories from Students
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                See how our pickup service helped students arrive safely and confidently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300"
                >
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

                  <p className="text-gray-700 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Common Questions</span>
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
              <p className="text-gray-600 mb-4">Have more questions about our pickup service?</p>
              <button className="text-[#A51C30] font-semibold hover:underline flex items-center gap-2 mx-auto">
                <MessageCircle className="w-4 h-4" />
                Chat with our support team
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#A51C30] via-[#8A1828] to-[#6B1420]">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Start Your Journey with Confidence
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-10">
                Book your pre-arranged airport pickup today and eliminate the stress of arriving in a new country. Safe, reliable, student-focused service.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-300" />
                  </div>
                  <p className="text-white/90 font-medium">15,000+ Safe Arrivals</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Shield className="w-7 h-7 text-blue-300" />
                  </div>
                  <p className="text-white/90 font-medium">100% Verified Drivers</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Headphones className="w-7 h-7 text-yellow-300" />
                  </div>
                  <p className="text-white/90 font-medium">Emergency Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DefaultLayout>
  )
}

export default AirportPickupPage