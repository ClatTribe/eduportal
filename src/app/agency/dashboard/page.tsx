"use client";
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Search, Eye, AlertCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

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
  created_at: string;
  updated_at: string;
}

const AgencyDashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [students, setStudents] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  const ADMIN_EMAIL = 'goeduabroadonline@gmail.com';
  const ADMIN_PASSWORD = 'Eduabroad123@#';

  useEffect(() => {
    const isAuth = sessionStorage.getItem('agency_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('agency_authenticated', 'true');
      setIsAuthenticated(true);
      fetchStudents();
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('agency_authenticated');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDocumentComplete = (student: StudentDocument) => {
    return !!(student.lor_url && student.sop_url && student.resume_url);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'complete') {
      return matchesSearch && isDocumentComplete(student);
    } else if (filterStatus === 'incomplete') {
      return matchesSearch && !isDocumentComplete(student);
    }
    
    return matchesSearch;
  });

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

  const handleViewDocuments = (student: StudentDocument) => {
    router.push(`/agency/dashboard/${student.user_id}`);
  };

  const stats = {
    total: students.length,
    complete: students.filter(isDocumentComplete).length,
    incomplete: students.filter(s => !isDocumentComplete(s)).length
  };

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Agency Dashboard
            </h1>
            <p className="text-gray-600">
              Sign in to access student documents
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading students...
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Student Documents
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and review student applications
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Complete</p>
                <p className="text-3xl font-bold text-gray-800">{stats.complete}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Incomplete</p>
                <p className="text-3xl font-bold text-gray-800">{stats.incomplete}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('complete')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  filterStatus === 'complete'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Complete
              </button>
              <button
                onClick={() => setFilterStatus('incomplete')}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  filterStatus === 'incomplete'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Incomplete
              </button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search or filters' : 'No students have uploaded documents yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const isComplete = isDocumentComplete(student);
              
              return (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-red-300 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleViewDocuments(student)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {student.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last updated: {formatDate(student.updated_at)}
                      </p>
                    </div>
                    {isComplete ? (
                      <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                    ) : (
                      <Clock className="text-orange-500 flex-shrink-0" size={24} />
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        student.lor_url ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <FileText className={student.lor_url ? 'text-green-600' : 'text-gray-400'} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">LOR</p>
                        <p className="text-xs text-gray-500">
                          {student.lor_url ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                      {student.lor_url && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        student.sop_url ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <FileText className={student.sop_url ? 'text-green-600' : 'text-gray-400'} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">SOP</p>
                        <p className="text-xs text-gray-500">
                          {student.sop_url ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                      {student.sop_url && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        student.resume_url ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <FileText className={student.resume_url ? 'text-green-600' : 'text-gray-400'} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Resume</p>
                        <p className="text-xs text-gray-500">
                          {student.resume_url ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                      {student.resume_url && (
                        <CheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDocuments(student);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    View Documents
                  </button>

                  <div className={`mt-3 px-3 py-2 rounded-lg text-center text-sm font-semibold ${
                    isComplete
                      ? 'bg-green-50 text-green-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}>
                    {isComplete ? 'Complete' : 'Incomplete'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;