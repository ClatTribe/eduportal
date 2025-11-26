"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, Download, RefreshCw, ArrowLeft, Info, MessageSquare, Clock, Check, Plus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

// Type definitions
type DocumentCategory = 'tenth' | 'twelfth' | 'graduation' | 'pg' | 'lor' | 'sop' | 'passport' | 'resume' | 'other';

interface UploadedFile {
  name: string;
  size: number;
  uploadDate: string;
  url: string;
}

interface DocumentFeedback {
  text: string | null;
  updatedAt: string | null;
  commentBy: string | null;
  status: boolean;
}

interface UserProfile {
  target_degree: string;
}

const DocumentUploadPage = () => {
  const { user } = useAuth();
  
  // Document states - all categories now support multiple files
  const [documents, setDocuments] = useState<Record<DocumentCategory, UploadedFile[]>>({
    tenth: [],
    twelfth: [],
    graduation: [],
    pg: [],
    lor: [],
    sop: [],
    passport: [],
    resume: [],
    other: []
  });

  const [uploading, setUploading] = useState<Record<DocumentCategory, boolean>>({
    tenth: false,
    twelfth: false,
    graduation: false,
    pg: false,
    lor: false,
    sop: false,
    passport: false,
    resume: false,
    other: false
  });

  const [errors, setErrors] = useState<Record<DocumentCategory, string | null>>({
    tenth: null,
    twelfth: null,
    graduation: null,
    pg: null,
    lor: null,
    sop: null,
    passport: null,
    resume: null,
    other: null
  });

  const [feedback, setFeedback] = useState<Record<'lor' | 'sop' | 'passport', DocumentFeedback>>({
    lor: { text: null, updatedAt: null, commentBy: null, status: false },
    sop: { text: null, updatedAt: null, commentBy: null, status: false },
    passport: { text: null, updatedAt: null, commentBy: null, status: false }
  });

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({ target_degree: 'Bachelors' });

  useEffect(() => {
    if (user) {
      fetchUserDocuments();
    }
  }, [user]);

  const fetchUserDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile from admit_profiles table to get target_degree
      const { data: profileData, error: profileError } = await supabase
        .from('admit_profiles')
        .select('degree')
        .eq('user_id', user?.id)
        .single();

      if (profileData && !profileError) {
        console.log('Profile fetched successfully:', profileData);
        setUserProfile({ target_degree: profileData.degree || 'Bachelors' });
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Set default if profile doesn't exist yet
        setUserProfile({ target_degree: 'Bachelors' });
      }
      
      // Fetch documents from student_documents table
      const { data: docData, error: docError } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (docData && !docError) {
        // Parse JSONB arrays
        setDocuments({
          tenth: docData.tenth_marksheets || [],
          twelfth: docData.twelfth_marksheets || [],
          graduation: docData.graduation_docs || [],
          pg: docData.pg_docs || [],
          lor: docData.lor_docs || [],
          sop: docData.sop_docs || [],
          passport: docData.passport_docs || [],
          resume: docData.resume_docs || [],
          other: docData.other_docs || []
        });

        // Parse feedback for verified categories
        setFeedback({
          lor: {
            text: docData.lor_feedback,
            updatedAt: docData.lor_feedback_updated_at,
            commentBy: docData.lor_feedback_by,
            status: docData.lor_status || false
          },
          sop: {
            text: docData.sop_feedback,
            updatedAt: docData.sop_feedback_updated_at,
            commentBy: docData.sop_feedback_by,
            status: docData.sop_status || false
          },
          passport: {
            text: docData.passport_feedback,
            updatedAt: docData.passport_feedback_updated_at,
            commentBy: docData.passport_feedback_by,
            status: docData.passport_status || false
          }
        });
      } else if (docError && docError.code === 'PGRST116') {
        // No record exists, create one
        const { error: insertError } = await supabase
          .from('student_documents')
          .insert([{ user_id: user?.id }]);
        
        if (insertError) {
          console.error('Error creating document record:', insertError);
        }
      } else if (docError) {
        console.error('Error fetching documents:', docError);
      }
      
    } catch (err) {
      console.error('Error in fetchUserDocuments:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (file.size > maxSize) {
      return 'File size exceeds 2MB limit';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, DOC, DOCX, JPG, and PNG files are allowed';
    }

    return null;
  };

  const getCategoryColumn = (category: DocumentCategory): string => {
    const mapping: Record<DocumentCategory, string> = {
      tenth: 'tenth_marksheets',
      twelfth: 'twelfth_marksheets',
      graduation: 'graduation_docs',
      pg: 'pg_docs',
      lor: 'lor_docs',
      sop: 'sop_docs',
      passport: 'passport_docs',
      resume: 'resume_docs',
      other: 'other_docs'
    };
    return mapping[category];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: DocumentCategory) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [category]: error }));
      return;
    }

    // Check max limit - all categories now support 5 files
    const maxFiles = 5;
    if (documents[category].length >= maxFiles) {
      setErrors(prev => ({ 
        ...prev, 
        [category]: `Maximum ${maxFiles} files allowed for this category` 
      }));
      return;
    }

    setErrors(prev => ({ ...prev, [category]: null }));
    setUploading(prev => ({ ...prev, [category]: true }));

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${category}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName);

      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: urlData.publicUrl
      };

      // Update documents array
      const updatedDocs = [...documents[category], newFile];
      setDocuments(prev => ({
        ...prev,
        [category]: updatedDocs
      }));

      // Update database
      const columnName = getCategoryColumn(category);
      const { error: dbError } = await supabase
        .from('student_documents')
        .update({ [columnName]: updatedDocs })
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      console.log(`Uploaded ${file.name} to ${category}`);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors(prev => ({ 
        ...prev, 
        [category]: 'Failed to upload file. Please try again.' 
      }));
    } finally {
      setUploading(prev => ({ ...prev, [category]: false }));
      e.target.value = '';
    }
  };

  const handleDelete = async (category: DocumentCategory, index: number) => {
    if (!user) return;

    try {
      setUploading(prev => ({ ...prev, [category]: true }));
      
      const fileToDelete = documents[category][index];
      
      // Extract file path from URL
      const urlParts = fileToDelete.url.split('/student-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('student-documents')
          .remove([filePath]);

        if (storageError) console.error('Storage deletion error:', storageError);
      }

      // Update documents array
      const updatedDocs = documents[category].filter((_, i) => i !== index);
      setDocuments(prev => ({
        ...prev,
        [category]: updatedDocs
      }));

      // Update database
      const columnName = getCategoryColumn(category);
      const { error: dbError } = await supabase
        .from('student_documents')
        .update({ [columnName]: updatedDocs })
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      console.log(`Deleted file at index ${index} from ${category}`);
    } catch (err) {
      console.error('Delete error:', err);
      setErrors(prev => ({ 
        ...prev, 
        [category]: 'Failed to delete file. Please try again.' 
      }));
    } finally {
      setUploading(prev => ({ ...prev, [category]: false }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine which categories to show based on degree
  // Bachelors: 10th + 12th only
  // Masters/MBA: 10th + 12th + Graduation
  // PhD: 10th + 12th + Graduation + PG
  const shouldShowGraduation = ['Masters', 'MBA', 'PhD'].includes(userProfile.target_degree);
  const shouldShowPG = userProfile.target_degree === 'PhD';

  // Check if all required documents are uploaded (at least 1 in each category)
  const allRequiredDocsUploaded = 
    documents.tenth.length > 0 &&
    documents.twelfth.length > 0 &&
    (shouldShowGraduation ? documents.graduation.length > 0 : true) &&
    (shouldShowPG ? documents.pg.length > 0 : true) &&
    documents.lor.length > 0 &&
    documents.sop.length > 0 &&
    documents.passport.length > 0;

  const DocumentCard = ({ 
    category, 
    title, 
    description, 
    hasVerification = false,
    maxFiles = 5,
    required = true
  }: { 
    category: DocumentCategory; 
    title: string; 
    description: string;
    hasVerification?: boolean;
    maxFiles?: number;
    required?: boolean;
  }) => {
    const docs = documents[category];
    const isUploading = uploading[category];
    const error = errors[category];
    const docFeedback = hasVerification ? feedback[category as 'lor' | 'sop' | 'passport'] : null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-red-200 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {title} {required && <span className="text-red-500">*</span>}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Upload up to {maxFiles} files • At least 1 required
            </p>
          </div>
          <div className="flex items-center gap-2">
            {docs.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <CheckCircle size={16} />
                {docs.length}/{maxFiles}
              </div>
            )}
            {docFeedback?.status && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <Check size={16} />
                Verified
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        {docs.length < maxFiles && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 hover:bg-red-50 transition-all mb-4">
            <input
              type="file"
              id={`file-${category}`}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, category)}
              disabled={isUploading}
            />
            <label htmlFor={`file-${category}`} className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  ) : (
                    <Upload className="text-red-600" size={24} />
                  )}
                </div>
                <p className="text-gray-700 font-semibold text-sm mb-1">
                  {docs.length === 0 ? 'Upload your document' : 'Add another document'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG (Max 2MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Uploaded Files List */}
        {docs.length > 0 && (
          <div className="space-y-3 mb-4">
            {docs.map((doc, index) => (
              <div key={index} className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm">{doc.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadDate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(category, index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Remove file"
                    disabled={isUploading}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Feedback Section (Only for LOR, SOP, Passport) */}
        {hasVerification && docFeedback?.text && (
          <div className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1 text-sm">Agency Feedback</h4>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={12} />
                  <span>{docFeedback.updatedAt ? formatDate(docFeedback.updatedAt) : 'N/A'}</span>
                  <span>•</span>
                  <span>By: {docFeedback.commentBy || 'Agency'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-orange-200 rounded-lg p-3">
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                {docFeedback.text}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
          <div className="text-xl text-red-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            Loading documents...
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-semibold"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Document Upload
            </h1>
            <p className="text-gray-600 mb-4">
              Upload your academic documents and supporting files for {userProfile.target_degree} application
            </p>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Important:</p>
                <p className="text-blue-700">
                  All required documents must have at least 1 file uploaded. You can upload up to 5 files per category. Files must be in PDF, DOC, DOCX, JPG, or PNG format and not exceed 2MB each.
                </p>
              </div>
            </div>
          </div>

          {/* Document Categories */}
          <div className="space-y-6">
            {/* Academic Documents Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-red-600" size={24} />
                Academic Marksheets
              </h2>
              <div className="space-y-4">
                <DocumentCard
                  category="tenth"
                  title="10th Grade Marksheet"
                  description="Upload your 10th standard marksheet or grade certificate"
                  maxFiles={5}
                />
                
                <DocumentCard
                  category="twelfth"
                  title="12th Grade Marksheet"
                  description="Upload your 12th standard marksheet or grade certificate"
                  maxFiles={5}
                />

                {shouldShowGraduation && (
                  <DocumentCard
                    category="graduation"
                    title="Graduation Degree / Marksheets"
                    description="Upload your bachelor's degree certificate and marksheets"
                    maxFiles={5}
                  />
                )}

                {shouldShowPG && (
                  <DocumentCard
                    category="pg"
                    title="Postgraduate Degree / Marksheets"
                    description="Upload your master's degree certificate and marksheets"
                    maxFiles={5}
                  />
                )}
              </div>
            </div>

            {/* Application Documents Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-red-600" size={24} />
                Application Documents (Verified)
              </h2>
              <div className="space-y-4">
                <DocumentCard
                  category="lor"
                  title="Letter of Recommendation (LOR)"
                  description="Upload your letters of recommendation from professors or employers"
                  hasVerification={true}
                  maxFiles={5}
                />

                <DocumentCard
                  category="sop"
                  title="Statement of Purpose (SOP)"
                  description="Upload your statement of purpose documents"
                  hasVerification={true}
                  maxFiles={5}
                />
              </div>
            </div>

            {/* Identity Documents Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-red-600" size={24} />
                Identity & Supporting Documents
              </h2>
              <div className="space-y-4">
                <DocumentCard
                  category="passport"
                  title="Passport"
                  description="Upload clear copies of all pages of your passport"
                  hasVerification={true}
                  maxFiles={5}
                />

                <DocumentCard
                  category="resume"
                  title="Resume / CV"
                  description="Upload your latest resume or curriculum vitae"
                  maxFiles={5}
                />

                <DocumentCard
                  category="other"
                  title="Other Documents"
                  description="Upload any additional required documents (e.g., experience letters, certificates)"
                  maxFiles={5}
                  required={false}
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <button
              disabled={!allRequiredDocsUploaded}
              onClick={() => window.history.back()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                allRequiredDocsUploaded
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allRequiredDocsUploaded ? 'Continue to Next Step' : 'Upload All Required Documents to Continue'}
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DocumentUploadPage;