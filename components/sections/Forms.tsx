import React from "react";
import {
  FileText,
  ExternalLink,
  Calendar,
  BookOpen,
  Building2,
  GraduationCap,
  Clock,
  ArrowRight,
} from "lucide-react";

type ExamLink = {
  college: string;
  examName: string;
  examDate: string;
  applicationDeadline: string;
  url: string;
  courses: string;
  color: string;
  bg: string;
};

export const FormsPage: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const examLinks: ExamLink[] = [
    {
      college: "MAH Law Colleges (GLC, ILS)",
      examName: "MHCET Law",
      examDate: "May 2026 (TBA)",
      applicationDeadline: "Feb/March 2026",
      url: "https://cetcell.mahacet.org",
      courses: "5-Year Integrated LLB",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      college: "National Law Universities (24 NLUs)",
      examName: "CLAT 2026",
      examDate: "7th Dec 2025*",
      applicationDeadline: "Oct/Nov 2025",
      url: "https://consortiumofnlus.ac.in",
      courses: "5-Year LLB (Integrated)",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      college: "NLU Delhi",
      examName: "AILET 2026",
      examDate: "14th Dec 2025*",
      applicationDeadline: "Nov 2025",
      url: "https://nationallawuniversitydelhi.in",
      courses: "5-Year LLB (Integrated)",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      college: "Symbiosis Law Schools (SLS)",
      examName: "SLAT 2026",
      examDate: "May 2026 (TBA)",
      applicationDeadline: "April 2026",
      url: "https://set-test.org",
      courses: "BA LLB / BBA LLB",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      college: "NMIMS (Kirit P. Mehta)",
      examName: "NMIMS-LAT",
      examDate: "Jan – May 2026",
      applicationDeadline: "May 2026",
      url: "https://nmims.edu",
      courses: "BA LLB / BBA LLB",
      color: "text-[#A51C30]",
      bg: "bg-[#FEF2F3]",
    },
    {
      college: "IP University (Delhi)",
      examName: "IPU CET / CLAT Score",
      examDate: "May 2026 (TBA)",
      applicationDeadline: "March 2026",
      url: "https://ipu.ac.in",
      courses: "BA LLB / BBA LLB",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      college: "Lloyd, Galgotias, etc.",
      examName: "LSAT-India",
      examDate: "Jan & May 2026",
      applicationDeadline: "May 2026",
      url: "https://lsatindia.in",
      courses: "5-Year LLB (Integrated)",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div 
          className="bg-white p-8 rounded-3xl"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: lightBg, color: accentColor }}
                >
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Law Entrance Exams Schedule 2026
                  </h1>
                  <p className="text-gray-600">
                    Direct application links for all major law entrance exams
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Apply directly to your preferred law schools. All application
                links, deadlines, and exam dates in one place for your
                convenience.
              </p>
            </div>
          </div>
        </div>

        {/* Exam Cards */}
        <div className="grid grid-cols-1 gap-4">
          {examLinks.map((exam, i) => {
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white hover:shadow-lg transition-all"
                style={{ border: `1px solid ${borderColor}` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-14 h-14 rounded-xl ${exam.bg} ${exam.color} flex items-center justify-center shrink-0`}
                    >
                      <GraduationCap className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <h3 
                        className="text-xl font-bold text-gray-800 transition-colors mb-1"
                        onMouseEnter={(e: React.MouseEvent<HTMLHeadingElement>) => (e.currentTarget.style.color = accentColor)}
                        onMouseLeave={(e: React.MouseEvent<HTMLHeadingElement>) => (e.currentTarget.style.color = 'inherit')}
                      >
                        {exam.examName}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4" />
                        {exam.college}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-gray-500">Exam Date:</span>
                          <span className="text-gray-800 font-medium">{exam.examDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-500">Deadline:</span>
                          <span className="text-gray-800 font-medium">{exam.applicationDeadline}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">{exam.courses}</span>
                      </div>
                    </div>
                  </div>

                  {/* FIXED: Added 'a' tag name below */}
                  <div className="flex items-center lg:items-start">
                    <a
                      href={exam.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-8 py-3 text-white font-bold rounded-xl transition-all hover:scale-105 group/btn whitespace-nowrap"
                      style={{ backgroundColor: accentColor }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = secondaryAccent)}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = accentColor)}
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div 
          className="p-6 rounded-2xl"
          style={{ 
            background: `linear-gradient(to right, ${lightBg}, #f3e8ff)`,
            border: `1px solid ${borderColor}`
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Important Note About Deadlines</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Application deadlines and exam dates are subject to change. Please visit the official websites for up-to-date information.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Exams", value: "7+", desc: "Major law entrances", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "NLUs Covered", value: "24", desc: "National Law Universities", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Direct Links", value: "100%", desc: "Official application portals", color: "text-green-600", bg: "bg-green-50" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl text-center"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <div className={`inline-flex w-12 h-12 ${stat.bg} ${stat.color} rounded-xl items-center justify-center mb-3`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="font-semibold text-sm mb-1 text-gray-800">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormsPage;