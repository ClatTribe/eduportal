"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Eye,
  Star,
  GraduationCap,
  Lightbulb,
  Award,
  AlertCircle,
} from "lucide-react";
import DefaultLayout from "../defaultLayout";

// Color scheme matching the college compare page
// const secondaryBg = '#0F172B'; // Slightly lighter navy
const accentColor = "#A51C30";
const primaryBg = "#FFFFFF";
const borderColor = "#FECDD3";

interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  category: string;
  description: string;
  uploadDate: string;
  size: string;
  pages?: number;
  featured?: boolean;
  driveLink?: string;
}

const StudyMaterialPage: React.FC = () => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPDFFiles();
  }, []);

  const fetchPDFFiles = async () => {
    try {
      setLoading(true);

      // Try to fetch from JSON file first
      try {
        const response = await fetch("/study-materials.json");
        if (response.ok) {
          const data = await response.json();
          setStudyMaterials(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log("JSON file not found, using default materials");
      }

      // Fallback: Use the existing PDFs in public folder
      const defaultMaterials: StudyMaterial[] = [
        {
          id: "1",
          title: "GMAT Focus Edition Guide",
          fileName: "GMAT Focus Edition Guide_EduAbroad.pdf",
          category: "GMAT",
          description:
            "Official-style overview of the GMAT Focus Edition covering exam structure, section-wise breakdown (Verbal, Quant, Data Insights), candidate-friendly features, scoring insights, and sample questions designed for business school aspirants.",
          uploadDate: "2024-03-15",
          size: "2.5 MB",
          pages: 38,
          featured: true,
        },
        {
          id: "2",
          title: "PTE Priority Tasks Guide",
          fileName: "PTE Priority Tasks Guide_EduAbroad.pdf",
          category: "PTE",
          description:
            "High-impact PTE preparation guide categorizing tasks by priority levels. Focuses on must-attempt scoring tasks, risk-managed strategies, negative marking awareness, and smart exam behavior for maximizing overall PTE score.",
          uploadDate: "2024-03-18",
          size: "1.8 MB",
          pages: 12,
          featured: true,
        },
        {
          id: "3",
          title: "TOEFL iBT Preparation Guide",
          fileName: "TOEFL Preparation Guide_EduAbroad.pdf",
          category: "TOEFL",
          description:
            "Comprehensive TOEFL iBT preparation guide covering exam format, section-wise strategies for Reading, Listening, Speaking, and Writing, scoring system, preparation plans, and expert tips curated by Harvard-Cambridge alumni.",
          uploadDate: "2024-03-20",
          size: "2.1 MB",
          pages: 15,
          featured: false,
        },
        // {
        //   id: "4",
        //   title: "TOEFL iBT Preparation Guide",
        //   fileName: "TOEFL Preparation Guide_EduAbroad.pdf",
        //   category: "TOEFL",
        //   description:
        //     "Comprehensive TOEFL iBT preparation guide covering exam format, section-wise strategies for Reading, Listening, Speaking, and Writing, scoring system, preparation plans, and expert tips curated by Harvard-Cambridge alumni.",
        //   uploadDate: "2024-03-20",
        //   size: "2.1 MB",
        //   pages: 15,
        //   featured: false,
        // },
        {
          id: "5",
          title: "Standard English Conventions Practice",
          fileName: "Standard English Conventions Practice.pdf",
          category: "SAT",
          description:
            "DSAT grammar and conventions practice with detailed exercises and solutions.",
          driveLink:
            "https://drive.google.com/file/d/1bUxg8AkVLg5zx4tG7r1JPae7osMCJ111/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "3.5 MB",
        },
        {
          id: "6",
          title: "DSAT Vocabulary Practice",
          fileName: "DSAT Vocabulary Practice.pdf",
          category: "SAT",
          description:
            "Comprehensive vocabulary exercises for DSAT Verbal section preparation.",
          driveLink:
            "https://drive.google.com/file/d/1yyhestvtQyKu_BY1BBXCRJnzJwz1EalW/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "539 KB",
        },
        {
          id: "7",
          title: "DSAT Rhetorical Synthesis Practice",
          fileName: "DSAT Rhetorical Synthesis Practice 1.pdf",
          category: "SAT",
          description:
            "Practice exercises for rhetorical synthesis questions with strategies and solutions.",
          driveLink:
            "https://drive.google.com/file/d/1XwuYonwfGVkCVGaGrKCY53gbJo5dSLLY/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "3.5 MB",
        },
        {
          id: "8",
          title: "DSAT Retrieval Questions Practice",
          fileName: "DSAT Retrieval Questions Practice.pdf",
          category: "SAT",
          description:
            "Targeted practice for command of evidence and retrieval-based questions.",
          driveLink:
            "https://drive.google.com/file/d/18TGJpRxRlQPPGgzUx2VpW-o9_03fnbx2/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "459 KB",
        },
        {
          id: "9",
          title: "DSAT Dual Text Practice",
          fileName: "DSAT Dual Text Practice.pdf",
          category: "SAT",
          description:
            "Practice comparing and analyzing paired passages for DSAT.",
          driveLink:
            "https://drive.google.com/file/d/1M5t9TZePZSeA613129mdizXgMU99K8RZ/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1,017 KB",
        },
        {
          id: "10",
          title: "DSAT Conclusion Practice",
          fileName: "DSAT CONCLUSION PRACTICE.pdf",
          category: "SAT",
          description:
            "Exercises focusing on drawing conclusions and inference questions.",
          driveLink:
            "https://drive.google.com/file/d/1lZMTMAaLqfVaE5esRJRLETbRGeV7RTij/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1.5 MB",
        },
        {
          id: "11",
          title: "DSAT Claims Practice",
          fileName: "DSAT Claims Practice.pdf",
          category: "SAT",
          description:
            "Practice identifying and analyzing claims in reading passages.",
          driveLink:
            "https://drive.google.com/file/d/1N_nHgYzTCQu8DTvxDOrsiWbtbortU6GW/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "634 KB",
        },
        {
          id: "12",
          title: "DSAT Claims Practice 1",
          fileName: "DSAT Claims Practice.pdf",
          category: "SAT",
          description:
            "Practice identifying and analyzing claims in reading passages.",
          driveLink:
            "https://drive.google.com/file/d/1zkVPdDFCIxYMwvaeYsyOxRhBhHvldFIg/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "634 KB",
        },
        {
          id: "13",
          title: "DSAT Claims Practice 2",
          fileName: "DSAT Claims Practice 2.pdf",
          category: "SAT",
          description:
            "Practice identifying and analyzing claims in reading passages.",
          driveLink:
            "https://drive.google.com/file/d/1ZGOvixYXkBM1dYwU2aSWoyltTZJfrrZ5/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "634 KB",
        },
        {
          id: "14",
          title: "Trigonometry Practice",
          fileName: "Trigonometry.pdf",
          category: "SAT",
          description:
            "Comprehensive trigonometry practice covering trig ratios, identities, and applications for DSAT Math.",
          driveLink: "https://drive.google.com/file/d/1aM3gdwmlbyih_IQK_JGubXbCj73iP-6x/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "2.1 MB",
        },
        {
          id: "15",
          title: "DSAT Geometry Practice",
          fileName: "DSAT GEOMETRY PRACTICE.pdf",
          category: "SAT",
          description:
            "Complete geometry practice with shapes, angles, area, volume, and coordinate geometry for DSAT.",
          driveLink: "https://drive.google.com/file/d/1WqP0MY6vF9Dy3I5F7uqrURHNatKZemq8/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "5 MB",
        },
        {
          id: "16",
          title: "DSAT Advanced Math",
          fileName: "DSAT Advanced Math.pdf",
          category: "SAT",
          description:
            "Advanced math topics including functions, equations, and complex problem-solving for DSAT.",
          driveLink: "https://drive.google.com/file/d/1bXee-anX0PiWLUpZd9j0D7wdV071itjO/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "6.2 MB",
        },
        {
          id: "17",
          title: "DSAT Advanced Arithmetic",
          fileName: "DSAT Advanced Arithmetic (2).pdf",
          category: "SAT",
          description:
            "Advanced arithmetic practice with ratios, percentages, proportions, and number properties.",
          driveLink: "https://drive.google.com/file/d/1KuAfH25vMQ_4fd6L9gCdgpFjyOIwE6hK/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "2.6 MB",
        },
        {
          id: "18",
          title: "Composition, Recursion, and Exponential Functions",
          fileName: "Composition, Recursion, and Exponential Functions.pdf",
          category: "SAT",
          description:
            "Practice with function composition, recursive sequences, and exponential growth/decay.",
          driveLink: "https://drive.google.com/file/d/1ZIhGTlLv_3puu4Xs12osur4Sn711xJSa/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1.6 MB",
        },
        {
          id: "19",
          title: "Arcs and Tangents",
          fileName: "Arcs and Tangents.pdf",
          category: "SAT",
          description:
            "Focused practice on circle properties, arc lengths, and tangent lines.",
          driveLink: "https://drive.google.com/file/d/1osNzkhgV-qgLhf_gJTtMcwKRt0psXu8_/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "267 KB",
        },
        {
          id: "20",
          title: "Algebra Basics 1",
          fileName: "Algebra Basics 2.pdf",
          category: "SAT",
          description:
            "Intermediate algebra practice with equations, inequalities, and algebraic expressions.",
          driveLink: "https://drive.google.com/file/d/1TCGTa2g6DKKyvhDnlST-aPd8kOA5wCEG/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "3.3 MB",
        },
        {
          id: "21",
          title: "Algebra Basics 2",
          fileName: "Algebra Basics 1.pdf",
          category: "SAT",
          description:
            "Foundational algebra practice covering basic equations, variables, and linear relationships.",
          driveLink: "https://drive.google.com/file/d/1GRTC_11cwJNQF1GhGTdQRF_jPpkuZeIT/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1.3 MB",
        },
        // {
        //   id: "22",
        //   title: "GMAT",
        //   fileName: "GMAT.pdf",
        //   category: "GMAT",
        //   description:
        //     "Comprehensive GMAT preparation materials covering all sections.",
        //   driveLink: "https://drive.google.com/file/d/1vSYpnrK1zjyYo9Nmh3par4F0wI3o0cEN/view?usp=drive_link",
        //   uploadDate: "2025-01-21",
        //   size: "1.3 MB",
        // },
        {
          id: "23",
          title: "Duolingo Lessons(DET)",
          fileName: "Duolingo Lessons.pdf",
          category: "Duolingo",
          description:
            "Comprehensive Duolingo lessons covering all language skills.",
          driveLink: "https://drive.google.com/file/d/1PGvIzUBTXmRFu065THAQS8TMi3JHkorO/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1.3 MB",
        },
        {
          id: "24",
          title: "Revised GRE General Test.pptx",
          fileName: "Revised GRE General Test.pptx",
          category: "GRE",
          description:
            "Updated GRE general test preparation materials.",
          driveLink: "https://drive.google.com/file/d/1Y8lQZd4JqpZwt9cAR8ZLcIsVkDc98NUj/view?usp=drive_link",
          uploadDate: "2025-01-21",
          size: "1.3 MB",
        },
      ];

      setStudyMaterials(defaultMaterials);
    } catch (error) {
      console.error("Error loading study materials:", error);
      setStudyMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(studyMaterials.map((m) => m.category))),
  ];

  const filteredMaterials = studyMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openPDF = (material: StudyMaterial) => {
    if (material.driveLink) {
      // Open Google Drive link
      window.open(material.driveLink, "_blank");
    } else {
      // Open local PDF in new tab
      window.open(`/${material.fileName}`, "_blank");
    }
  };
  const downloadPDF = (fileName: string, title: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DefaultLayout>
      <div
        className="flex-1 min-h-screen p-6 mt-[72px] sm:mt-0"
        style={{ backgroundColor: primaryBg }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2 flex items-center gap-3"
              style={{ color: accentColor }}
            >
              <BookOpen size={36} />
              Study Materials
            </h1>
            <p className=" text-black">
              Access comprehensive study resources and preparation materials
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className=" text-black flex flex-col items-center gap-3">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: accentColor }}
                ></div>
                <p>Loading study materials...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && studyMaterials.length === 0 && (
            <div
              className="rounded-xl shadow-lg p-12 text-center backdrop-blur-xl"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <AlertCircle className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Study Materials Available
              </h3>
              <p className=" text-black mb-4">
                Please add study materials to the public folder and update the
                study-materials.json file
              </p>
              <div
                className="rounded-lg p-4 text-left max-w-2xl mx-auto"
                style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
              >
                <p className="text-sm text-slate-300 mb-2">
                  <strong>Setup Instructions:</strong>
                </p>
                <ol className="text-sm  text-black space-y-1 list-decimal list-inside">
                  <li>
                    Add PDF files to the{" "}
                    <code
                      className="px-1 rounded"
                      style={{ backgroundColor: primaryBg }}
                    >
                      public
                    </code>{" "}
                    folder
                  </li>
                  <li>
                    Create{" "}
                    <code
                      className="px-1 rounded"
                      style={{ backgroundColor: primaryBg }}
                    >
                      public/study-materials.json
                    </code>
                  </li>
                  <li>Add material metadata in JSON format</li>
                </ol>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading &&
            studyMaterials.length > 0 &&
            filteredMaterials.length === 0 && (
              <div
                className="rounded-xl shadow-lg p-12 text-center backdrop-blur-xl"
                style={{ border: `1px solid ${borderColor}` }}
              >
                <Search className="mx-auto text-slate-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Results Found
                </h3>
                <p className=" text-black">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

          {/* Materials Grid */}
          {!loading && filteredMaterials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden backdrop-blur-xl"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  {/* Card Header */}
                  <div
                    className="p-6 text-white"
                    style={{ background: accentColor }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FileText size={32} />
                      {material.featured && (
                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Star size={12} />
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-2">{material.title}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className=" text-black text-sm mb-4 line-clamp-3">
                      {material.description}
                    </p>

                    {/* Meta Information */}
                    <div
                      className="space-y-2 mb-4 pb-4"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                    >
                      {material.pages && (
                        <div className="flex items-center gap-1 text-xs  text-black">
                          <BookOpen size={14} />
                          {material.pages} pages
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPDF(material)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                        style={{ background: accentColor }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() =>
                          downloadPDF(material.fileName, material.title)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                        style={{
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          border: `1px solid ${accentColor}`,
                        }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <div
            className="mt-8 rounded-xl p-6 backdrop-blur-xl"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-start gap-4">
              <Lightbulb
                className="flex-shrink-0"
                style={{ color: accentColor }}
                size={24}
              />
              <div>
                <h3 className="font-semibold text-accentColor mb-2">
                  Study Tips
                </h3>
                <p className="text-black text-sm">
                  Download materials for offline study, take notes, and revisit
                  challenging topics regularly. Combine these resources with
                  practice tests for best results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default StudyMaterialPage;
