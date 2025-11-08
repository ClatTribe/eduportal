"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, Download, RefreshCw, ArrowLeft, Info, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import DefaultLayout from '../defaultLayout';

type DocumentType = 'lor' | 'sop' | 'resume';

interface UploadedDocument {
  name: string;
  size: number;
  uploadDate: string;
  url: string;
}

interface DocumentState {
  lor: UploadedDocument | null;
  sop: UploadedDocument | null;
  resume: UploadedDocument | null;
}

interface UploadingState {
  lor: boolean;
  sop: boolean;
  resume: boolean;
}

interface ErrorState {
  lor: string | null;
  sop: string | null;
  resume: string | null;
}

interface AgencyComment {
  text: string;
  updatedAt: string;
  commentBy: string;
}

const DocumentUploadPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentState>({
    lor: null,
    sop: null,
    resume: null
  });
  const [uploading, setUploading] = useState<UploadingState>({
    lor: false,
    sop: false,
    resume: false
  });
  const [errors, setErrors] = useState<ErrorState>({
    lor: null,
    sop: null,
    resume: null
  });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [agencyComment, setAgencyComment] = useState<AgencyComment | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserDocuments();
    }
  }, [user]);

  const fetchUserDocuments = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setUsername(userName);

      console.log('Fetching documents for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
      }

      if (data && data.length > 0) {
        const studentData = data[0];
        console.log('Student data found:', studentData);

        // Set LOR if exists
        if (studentData.lor_url) {
          setDocuments(prev => ({
            ...prev,
            lor: {
              name: studentData.lor_name,
              size: studentData.lor_size,
              uploadDate: studentData.lor_uploaded_at,
              url: studentData.lor_url
            }
          }));
        }

        // Set SOP if exists
        if (studentData.sop_url) {
          setDocuments(prev => ({
            ...prev,
            sop: {
              name: studentData.sop_name,
              size: studentData.sop_size,
              uploadDate: studentData.sop_uploaded_at,
              url: studentData.sop_url
            }
          }));
        }

        // Set resume if exists
        if (studentData.resume_url) {
          setDocuments(prev => ({
            ...prev,
            resume: {
              name: studentData.resume_name,
              size: studentData.resume_size,
              uploadDate: studentData.resume_uploaded_at,
              url: studentData.resume_url
            }
          }));
        }

        // Set agency comment if exists
        if (studentData.agency_comment) {
          setAgencyComment({
            text: studentData.agency_comment,
            updatedAt: studentData.agency_comment_updated_at,
            commentBy: studentData.agency_comment_by || 'Agency'
          });
        }
      } else {
        console.log('No existing documents found for user');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];

    if (file.size > maxSize) {
      return 'File size exceeds 2MB limit';
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }

    return null;
  };

  const uploadFileToStorage = async (file: File, type: DocumentType) => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    console.log('Uploading file to storage:', fileName);

    const { data, error } = await supabase.storage
      .from('student-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('student-documents')
      .getPublicUrl(fileName);

    console.log('File uploaded successfully. Public URL:', publicUrl);

    return { path: data.path, url: publicUrl };
  };

  const saveDocumentToDatabase = async (
    type: DocumentType,
    file: File,
    url: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const documentData = {
      user_id: user.id,
      username: username,
      [`${type}_name`]: file.name,
      [`${type}_url`]: url,
      [`${type}_size`]: file.size,
      [`${type}_uploaded_at`]: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Saving document to database:', documentData);

    const { data: existingData } = await supabase
      .from('student_documents')
      .select('id')
      .eq('user_id', user.id);

    if (existingData && existingData.length > 0) {
      console.log('Updating existing record');
      const { error } = await supabase
        .from('student_documents')
        .update(documentData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
    } else {
      console.log('Inserting new record');
      const { error } = await supabase
        .from('student_documents')
        .insert([{ ...documentData, created_at: new Date().toISOString() }]);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
    }

    console.log('Document saved to database successfully');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Type:', type);

    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [type]: error }));
      return;
    }

    setErrors(prev => ({ ...prev, [type]: null }));
    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const { url } = await uploadFileToStorage(file, type);
      await saveDocumentToDatabase(type, file, url);

      setDocuments(prev => ({
        ...prev,
        [type]: {
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          url: url
        }
      }));

      setErrors(prev => ({ ...prev, [type]: null }));
      console.log('Upload complete for', type);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Failed to upload file. Please try again.' 
      }));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: DocumentType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const input = document.getElementById(`file-${type}`) as HTMLInputElement;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { writable: false, value: input });
      handleFileSelect(event as unknown as React.ChangeEvent<HTMLInputElement>, type);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDelete = async (type: DocumentType) => {
    if (!user) return;

    try {
      setUploading(prev => ({ ...prev, [type]: true }));

      const doc = documents[type];
      if (doc && doc.url) {
        const path = doc.url.split('/').slice(-2).join('/');
        console.log('Deleting file from storage:', path);
        await supabase.storage
          .from('student-documents')
          .remove([path]);
      }

      const updateData = {
        [`${type}_name`]: null,
        [`${type}_url`]: null,
        [`${type}_size`]: null,
        [`${type}_uploaded_at`]: null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating database to remove document');
      await supabase
        .from('student_documents')
        .update(updateData)
        .eq('user_id', user.id);

      setDocuments(prev => ({ ...prev, [type]: null }));
      setErrors(prev => ({ ...prev, [type]: null }));
      console.log('Document deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Failed to delete file. Please try again.' 
      }));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDownload = async (type: DocumentType) => {
    const doc = documents[type];
    if (!doc) return;

    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const allDocumentsUploaded = documents.lor && documents.sop && documents.resume;

  const DocumentCard = ({ type, title, description }: { type: DocumentType; title: string; description: string }) => {
    const doc = documents[type];
    const isUploading = uploading[type];
    const error = errors[type];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-red-200 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {doc && (
            <CheckCircle className="text-green-500 flex-shrink-0" size={28} />
          )}
        </div>

        {!doc && !isUploading && (
          <div
            onDrop={(e) => handleDrop(e, type)}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer"
          >
            <input
              type="file"
              id={`file-${type}`}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e, type)}
            />
            <label htmlFor={`file-${type}`} className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="text-red-600" size={32} />
                </div>
                <p className="text-gray-700 font-semibold mb-2">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF, DOC, DOCX (Max 2MB)
                </p>
                <button
                  type="button"
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold"
                >
                  Browse Files
                </button>
              </div>
            </label>
          </div>
        )}

        {isUploading && (
          <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-semibold">Uploading...</p>
              <p className="text-sm text-blue-600 mt-2">Please wait</p>
            </div>
          </div>
        )}

        {doc && !isUploading && (
          <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate mb-1">{doc.name}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Size: {formatFileSize(doc.size)}</span>
                  <span>Uploaded: {formatDate(doc.uploadDate)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDownload(type)}
                className="flex-1 px-4 py-2 bg-white border-2 border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => handleDelete(type)}
                className="flex-1 px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <X size={18} />
                Remove
              </button>
              <label
                htmlFor={`file-replace-${type}`}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={18} />
                Replace
              </label>
              <input
                type="file"
                id={`file-replace-${type}`}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, type)}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold text-sm">Upload Failed</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
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
            <p className="text-gray-600 mb-6">
              Upload your Letter of Recommendation, Statement of Purpose, and Resume/CV to continue your application
            </p>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Important:</p>
                <p className="text-blue-700">
                  All three documents are required to proceed. Make sure your files are in PDF, DOC, or DOCX format and do not exceed 2MB each.
                </p>
              </div>
            </div>
          </div>

          {/* Agency Comment Section - Only visible when comment exists */}
          {agencyComment && agencyComment.text && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-2 border-orange-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Agency Feedback</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Last updated: {formatDate(agencyComment.updatedAt)}</span>
                    <span>•</span>
                    <span>By: {agencyComment.commentBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {agencyComment.text}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Action Required:</span> Please review the feedback above and update your documents accordingly.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 mb-6">
            <DocumentCard
              type="lor"
              title="Letter of Recommendation (LOR)"
              description="Upload your letter of recommendation from a professor or employer"
            />

            <DocumentCard
              type="sop"
              title="Statement of Purpose (SOP)"
              description="Upload your statement of purpose document"
            />

            <DocumentCard
              type="resume"
              title="Resume / CV"
              description="Upload your latest resume or curriculum vitae"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <button
              disabled={!allDocumentsUploaded}
              onClick={() => window.history.back()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                allDocumentsUploaded
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allDocumentsUploaded ? 'Continue to Next Step' : 'Upload All Documents to Continue'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Guidelines</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="text-red-600" size={20} />
                  LOR Requirements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Must be from a professor, employer, or mentor</li>
                  <li>• Should be on official letterhead</li>
                  <li>• Include contact details of recommender</li>
                  <li>• Highlight your strengths and achievements</li>
                  <li>• Maximum 2MB file size</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="text-red-600" size={20} />
                  SOP Requirements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Explain your motivation for applying</li>
                  <li>• Highlight your career goals and aspirations</li>
                  <li>• Describe relevant achievements</li>
                  <li>• Keep it between 500-1000 words</li>
                  <li>• Maximum 2MB file size</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="text-red-600" size={20} />
                  Resume / CV Requirements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Include your personal details and contact information</li>
                  <li>• List your educational qualifications</li>
                  <li>• Mention relevant work experience and skills</li>
                  <li>• Keep it concise and well-formatted</li>
                  <li>• Maximum 2MB file size</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> Uploaded documents will be reviewed by our team. You will be notified once the verification is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DocumentUploadPage;