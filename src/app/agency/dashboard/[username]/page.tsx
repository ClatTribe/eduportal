"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Eye, Calendar, User, CheckCircle, XCircle, Lock, MessageSquare, Edit3, Save, X, Clock } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';

interface StudentDocument {
  id: string;
  user_id: string;
  username: string;
  lor_name: string | null;
  lor_url: string | null;
  lor_size: number | null;
  lor_uploaded_at: string | null;
  sop_name: string | null;
  sop_url: string | null;
  sop_size: number | null;
  sop_uploaded_at: string | null;
  resume_name: string | null;
  resume_url: string | null;
  resume_size: number | null;
  resume_uploaded_at: string | null;
  agency_comment: string | null;
  agency_comment_updated_at: string | null;
  agency_comment_by: string | null;
  created_at: string;
  updated_at: string;
}

interface AgencyComment {
  text: string;
  updatedAt: string | null;
  commentBy: string | null;
}

interface DocumentCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  filename: string | null;
  filesize: number | null;
  uploadDate: string | null;
  fileUrl: string | null;
}

const StudentDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  
  const userId = params.username as string;
  
  console.log('🔍 All params:', params);
  console.log('🔍 Extracted userId:', userId);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<StudentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [agencyComment, setAgencyComment] = useState<AgencyComment>({
    text: '',
    updatedAt: null,
    commentBy: null
  });
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    console.log('🔍 Step 1: Checking authentication...');
    const isAuth = sessionStorage.getItem('agency_authenticated') === 'true';
    console.log('🔍 Step 2: Is authenticated?', isAuth);
    setIsAuthenticated(isAuth);
    setCheckingAuth(false);
    
    if (!isAuth) {
      console.log('❌ Not authenticated, redirecting...');
      router.push('/agency/dashboard');
    } else {
      console.log('✅ Authenticated! User ID from URL:', userId);
    }
  }, [router, userId]);

  useEffect(() => {
    console.log('🔍 Step 3: Fetch effect triggered', { isAuthenticated, userId, checkingAuth });
    if (isAuthenticated && userId && !checkingAuth) {
      console.log('✅ All conditions met, fetching documents...');
      fetchStudentDocuments();
    } else {
      console.log('⏸️ Waiting... Conditions:', { isAuthenticated, userId, checkingAuth });
    }
    // fetchStudentDocuments is intentionally not in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId, checkingAuth]);

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching documents for user_id:', userId);

      const { data, error: fetchError } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', userId);

      console.log('📡 Supabase response:', { data, error: fetchError });

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        setError('Failed to load student documents');
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No student found with user_id:', userId);
        setError('Student not found');
        return;
      }

      console.log('✅ Student data found:', data[0]);
      setStudent(data[0]);

      // Set agency comment if exists
      if (data[0].agency_comment) {
        setAgencyComment({
          text: data[0].agency_comment,
          updatedAt: data[0].agency_comment_updated_at,
          commentBy: data[0].agency_comment_by
        });
      }
    } catch (err) {
      console.error('❌ Error fetching student documents:', err);
      setError('An unexpected error occurred');
    } finally {
      console.log('🏁 Fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not uploaded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (url: string | null, filename: string | null) => {
    if (!url || !filename) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const handleViewInNewTab = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleEditComment = () => {
    setCommentDraft(agencyComment.text || '');
    setIsEditingComment(true);
  };

  const handleSaveComment = async () => {
    if (!student) {
      console.error('❌ No student data available');
      alert('❌ Error: Student data not loaded');
      return;
    }

    if (!commentDraft.trim()) {
      alert('⚠️ Please enter a comment before saving');
      return;
    }
    
    console.log('🔄 Starting comment save process...');
    console.log('📝 Comment draft:', commentDraft);
    console.log('👤 Student user_id:', student.user_id);
    
    setIsSavingComment(true);
    
    try {
      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('student_documents')
        .select('id, user_id')
        .eq('user_id', student.user_id);
      
      console.log('🔍 Found student record:', testData);
      if (testError) {
        console.error('❌ Test query error:', testError);
        throw testError;
      }

      if (!testData || testData.length === 0) {
        throw new Error('Student record not found in database');
      }

      // Now try to update
      const updatePayload = {
        agency_comment: commentDraft.trim(),
        agency_comment_updated_at: new Date().toISOString(),
        agency_comment_by: 'Agency Admin'
      };
      
      console.log('📤 Update payload:', updatePayload);

      const { data: updateData, error: updateError } = await supabase
        .from('student_documents')
        .update(updatePayload)
        .eq('user_id', student.user_id)
        .select();

      console.log('📥 Update response:', updateData);
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
        console.error('Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      if (!updateData || updateData.length === 0) {
        console.warn('⚠️ Update succeeded but no rows returned');
        throw new Error('No rows were updated. Please check permissions.');
      }

      console.log('✅ Comment saved successfully:', updateData[0]);
      
      setAgencyComment({
        text: commentDraft.trim(),
        updatedAt: new Date().toISOString(),
        commentBy: 'Agency Admin'
      });
      setIsEditingComment(false);
      
      alert('✅ Comment saved successfully!');
      
      // Refresh student data to confirm save
      await fetchStudentDocuments();
      
    } catch (err) {
      console.error('❌ Error saving comment:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      // More specific error messages
      let errorMessage = '❌ Failed to save comment. ';
      
      if (err instanceof Error) {
        if (err.message.includes('permission') || (err as { code?: string }).code === '42501') {
          errorMessage += 'Permission denied. Please check database RLS policies.';
        } else if (err.message.includes('violates')) {
          errorMessage += 'Database constraint violation.';
        } else if (err.message.includes('not found')) {
          errorMessage += 'Student record not found.';
        } else {
          errorMessage += err.message || 'Unknown error occurred.';
        }
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!student) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    console.log('🗑️ Deleting comment for user_id:', student.user_id);
    setIsSavingComment(true);
    
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .update({
          agency_comment: null,
          agency_comment_updated_at: null,
          agency_comment_by: null
        })
        .eq('user_id', student.user_id)
        .select();

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Comment deleted successfully:', data);
      
      setAgencyComment({ text: '', updatedAt: null, commentBy: null });
      setIsEditingComment(false);
      
      alert('✅ Comment deleted successfully!');
      
      // Refresh student data
      await fetchStudentDocuments();
      
    } catch (err) {
      console.error('❌ Error deleting comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('❌ Failed to delete comment: ' + errorMessage);
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingComment(false);
    setCommentDraft('');
  };

  if (checkingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view student documents
          </p>
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading student documents...
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Student Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load student documents. Please try again.
          </p>
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isComplete = !!(student.lor_url && student.sop_url && student.resume_url);

  const DocumentCard: React.FC<DocumentCardProps> = ({ 
    title, 
    icon: Icon, 
    filename, 
    filesize, 
    uploadDate, 
    fileUrl 
  }) => {
    const isUploaded = !!fileUrl;

    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
        isUploaded ? 'border-green-200' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isUploaded ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-200'
            }`}>
              <Icon className={isUploaded ? 'text-white' : 'text-gray-500'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className={`text-sm ${isUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                {isUploaded ? 'Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
          {isUploaded && (
            <CheckCircle className="text-green-500" size={28} />
          )}
        </div>

        {isUploaded ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Filename</p>
                    <p className="font-semibold text-gray-800 truncate">{filename}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-semibold text-gray-800">{formatFileSize(filesize)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Uploaded</p>
                    <p className="font-semibold text-gray-800">{formatDate(uploadDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewInNewTab(fileUrl)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                View
              </button>
              <button
                onClick={() => handleDownload(fileUrl, filename)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <XCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">Document not yet uploaded</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {student.username}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Registered: {formatDate(student.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Last Updated: {formatDate(student.updated_at)}
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              isComplete 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {isComplete ? '✓ Complete' : '⚠ Incomplete'}
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Application Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              student.lor_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.lor_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">LOR</span>
              </div>
              <p className={`text-sm ${student.lor_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.lor_url ? 'Uploaded' : 'Pending'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              student.sop_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.sop_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">SOP</span>
              </div>
              <p className={`text-sm ${student.sop_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.sop_url ? 'Uploaded' : 'Pending'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              student.resume_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.resume_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">Resume</span>
              </div>
              <p className={`text-sm ${student.resume_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.resume_url ? 'Uploaded' : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Agency Comment Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Agency Feedback</h2>
                {agencyComment.text && agencyComment.updatedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Last updated: {formatDate(agencyComment.updatedAt)}</span>
                    {agencyComment.commentBy && (
                      <>
                        <span>•</span>
                        <span>By: {agencyComment.commentBy}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isEditingComment && (
              <div className="flex gap-2">
                <button
                  onClick={handleEditComment}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center gap-2"
                >
                  <Edit3 size={18} />
                  {agencyComment.text ? 'Edit' : 'Add Comment'}
                </button>
                {agencyComment.text && (
                  <button
                    onClick={handleDeleteComment}
                    disabled={isSavingComment}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <X size={18} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {!isEditingComment && agencyComment.text ? (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {agencyComment.text}
                </p>
              </div>
            </div>
          ) : !isEditingComment && !agencyComment.text ? (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2 font-semibold">No feedback yet</p>
              <p className="text-sm text-gray-500">
                Click &quot;Add Comment&quot; to provide feedback to the student
              </p>
            </div>
          ) : null}

          {isEditingComment && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback for Student
                </label>
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Enter your feedback here... You can mention specific issues with LOR, SOP, or Resume."
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  This feedback will be visible to the student. Be specific and constructive.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveComment}
                  disabled={isSavingComment || !commentDraft.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Comment
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingComment}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="space-y-6">
          <DocumentCard
            title="Letter of Recommendation"
            icon={FileText}
            filename={student.lor_name}
            filesize={student.lor_size}
            uploadDate={student.lor_uploaded_at}
            fileUrl={student.lor_url}
          />

          <DocumentCard
            title="Statement of Purpose"
            icon={FileText}
            filename={student.sop_name}
            filesize={student.sop_size}
            uploadDate={student.sop_uploaded_at}
            fileUrl={student.sop_url}
          />

          <DocumentCard
            title="Resume / CV"
            icon={FileText}
            filename={student.resume_name}
            filesize={student.resume_size}
            uploadDate={student.resume_uploaded_at}
            fileUrl={student.resume_url}
          />
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Student ID</p>
              <p className="font-mono text-sm text-gray-800 break-all">{student.user_id}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="font-semibold text-gray-800">{student.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocumentsPage;