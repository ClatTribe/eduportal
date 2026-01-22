"use client";
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, ExternalLink, 
  Search, Filter, Calendar, Eye, Star,
  GraduationCap, Lightbulb, Award, AlertCircle
} from 'lucide-react';
import DefaultLayout from "../defaultLayout";

// Color scheme matching the college compare page
// const secondaryBg = '#0F172B'; // Slightly lighter navy
const accentColor = '#A51C30';
const primaryBg = '#FFFFFF';
const borderColor = '#FECDD3';

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
        const response = await fetch('/study-materials.json');
        if (response.ok) {
          const data = await response.json();
          setStudyMaterials(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('JSON file not found, using default materials');
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
    featured: true
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
    featured: true
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
    featured: false
  }
      ];
      
      setStudyMaterials(defaultMaterials);
    } catch (error) {
      console.error('Error loading study materials:', error);
      setStudyMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(studyMaterials.map(m => m.category)))];

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openPDF = (fileName: string) => {
    // Open PDF in new tab
    window.open(`/${fileName}`, '_blank');
  };

  const downloadPDF = (fileName: string, title: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ color: accentColor }}>
              <BookOpen size={36} />
              Study Materials
            </h1>
            <p className=" text-black">Access comprehensive study resources and preparation materials</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className=" text-black flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                <p>Loading study materials...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && studyMaterials.length === 0 && (
            <div 
              className="rounded-xl shadow-lg p-12 text-center backdrop-blur-xl"
              style={{   border: `1px solid ${borderColor}` }}
            >
              <AlertCircle className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No Study Materials Available</h3>
              <p className=" text-black mb-4">
                Please add study materials to the public folder and update the study-materials.json file
              </p>
              <div 
                className="rounded-lg p-4 text-left max-w-2xl mx-auto"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              >
                <p className="text-sm text-slate-300 mb-2"><strong>Setup Instructions:</strong></p>
                <ol className="text-sm  text-black space-y-1 list-decimal list-inside">
                  <li>Add PDF files to the <code className="px-1 rounded" style={{ backgroundColor: primaryBg }}>public</code> folder</li>
                  <li>Create <code className="px-1 rounded" style={{ backgroundColor: primaryBg }}>public/study-materials.json</code></li>
                  <li>Add material metadata in JSON format</li>
                </ol>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && studyMaterials.length > 0 && filteredMaterials.length === 0 && (
            <div 
              className="rounded-xl shadow-lg p-12 text-center backdrop-blur-xl"
              style={{   border: `1px solid ${borderColor}` }}
            >
              <Search className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
              <p className=" text-black">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Materials Grid */}
          {!loading && filteredMaterials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden backdrop-blur-xl"
                  style={{   border: `1px solid ${borderColor}` }}
                >
                  {/* Card Header */}
                  <div className="p-6 text-white" style={{ background: accentColor }}>
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
                    <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
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
                        onClick={() => openPDF(material.fileName)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                        style={{ background: accentColor }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => downloadPDF(material.fileName, material.title)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                        style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', border: `1px solid ${accentColor}` }}
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
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: `1px solid ${borderColor}`
            }}
          >
            <div className="flex items-start gap-4">
              <Lightbulb className="flex-shrink-0" style={{ color: accentColor }} size={24} />
              <div>
                <h3 className="font-semibold text-accentColor mb-2">Study Tips</h3>
                <p className="text-black text-sm">
                  Download materials for offline study, take notes, and revisit challenging topics regularly. 
                  Combine these resources with practice tests for best results.
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