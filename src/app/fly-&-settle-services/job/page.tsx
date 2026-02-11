"use client"
import React from "react"
import {
  Briefcase,
  Globe,
  Shield,
  Target,
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  FileText,
  GraduationCap,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react"
import DefaultLayout from "../../defaultLayout"

const JobAssistancePage: React.FC = () => {
  const jobPortals = [
    {
      country: "UK",
      portals: ["StudentJob UK", "Save The Student", "Indeed UK"],
      flag: "🇬🇧",
    },
    {
      country: "USA",
      portals: ["Handshake", "WayUp", "Indeed USA", "Snagajob"],
      flag: "🇺🇸",
    },
    {
      country: "Canada",
      portals: ["JobBank (Govt.)", "TalentEgg", "Workopolis"],
      flag: "🇨🇦",
    },
    {
      country: "Australia",
      portals: ["StudentEdge", "Seek Australia", "Jora"],
      flag: "🇦🇺",
    },
    {
      country: "EU",
      portals: ["StudentJob EU", "EURES", "StudentJob DE", "L'Étudiant"],
      flag: "🇪🇺",
    },
  ]

  const legalGuidance = [
    {
      country: "UK",
      flag: "🇬🇧",
      points: [
        "Work up to 20 hrs/week (term time)",
        "Secure your National Insurance Number (NIN)",
        "Transition to 2-year Graduate Route",
      ],
    },
    {
      country: "USA",
      flag: "🇺🇸",
      points: [
        "Understand F-1 rules for on-campus work",
        "Critical process for CPT/OPT authorization for off-campus roles",
      ],
    },
    {
      country: "Canada & Australia",
      flag: "🇨🇦🇦🇺",
      points: [
        "Ensure Study Permit includes work authorization",
        "Apply early for SIN (Canada) or TFN (Australia)",
      ],
    },
  ]

  const services = [
    "CV optimization for local markets (UK/AUS/CAN etc.)",
    "LinkedIn profiling for recruiter searches",
    "Targeted application strategies",
    "Mock interviews - Situation-Action-Outcome framework",
    "Long-term employability planning",
    "Visa compliance guidance",
  ]

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 mt-[72px] sm:mt-0">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#A51C30] to-[#8A1828] rounded-2xl p-8 md:p-12 mb-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Briefcase size={36} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Job Assistance
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-semibold mb-3">
              From Classroom to Career. Your Strategic Blueprint for Global Employment.
            </p>
            <p className="text-white/90 text-lg max-w-3xl">
              EduAbroad has re-engineered the international study-to-work journey by combining strategic career mapping with job portal access for a seamless "Study-to-Work" experience. We provide support for both part-time and full-time jobs.
            </p>
          </div>

          {/* The Elite Network - Job Portals */}
          <div className="mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <Building2 className="text-[#A51C30]" size={32} />
                The Elite Network
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Gain high-priority access to our curated directory of country-specific recruitment portals and vetted employer networks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobPortals.map((portal, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200 hover:border-[#A51C30] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">{portal.flag}</span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {portal.country}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {portal.portals.map((site, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
                          <span className="text-gray-700 text-sm">{site}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal & Strategic Clarity */}
          <div className="mb-12">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <Shield className="text-[#A51C30]" size={32} />
                Student-First Legal & Strategic Clarity
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Crystal-clear guidance on part-time work-hour limits, essential documentation, and strategic visa pathways tailored to your target country.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {legalGuidance.map((guide, index) => (
                  <div
                    key={index}
                    className="bg-rose-50 rounded-xl p-5 border border-rose-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{guide.flag}</span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {guide.country}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {guide.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ArrowRight className="text-[#A51C30] flex-shrink-0 mt-0.5" size={16} />
                          <span className="text-gray-700 text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Universal Rule (EU/UK/US/CA/AU)</h4>
                    <p className="text-gray-700">
                      <strong>Always secure a tax ID/number and local bank account before starting work.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Seamless Promise */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-[#A51C30] to-[#8A1828] rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                <Target size={32} />
                The Seamless Promise
              </h2>
              <p className="text-white/90 text-lg mb-6">
                We replace confusion with a structured, end-to-end career plan. We prepare you not just for a job, but for a sustainable career, ensuring every step aligns with long-term employability and visa compliance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-emerald-300 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-white">{service}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl p-8 md:p-12 border-2 border-gray-200 shadow-lg text-center">
            <GraduationCap className="text-[#A51C30] mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Build Your Global Career?
            </h2>
            <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
              Book a career mapping session with an EduAbroad expert to get your personalized Study-to-Work Plan.
            </p>
            {/* <button className="bg-gradient-to-r from-[#A51C30] to-[#8A1828] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto">
              Book Career Mapping Session
              <ArrowRight size={20} />
            </button> */}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default JobAssistancePage