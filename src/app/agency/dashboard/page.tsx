"use client";
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Search, Eye, AlertCircle, LogOut, UserCheck, Upload } from 'lucide-react';
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

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
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
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [activeTab, setActiveTab] = useState<'all-users' | 'submitted'>('all-users');

  const ADMIN_EMAIL = 'goeduabroadonline@gmail.com';
  const ADMIN_PASSWORD = 'Eduabroad123@#';

  useEffect(() => {
    const isAuth = sessionStorage.getItem('agency_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    setLoginError('');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('agency_authenticated', 'true');
      setIsAuthenticated(true);
      fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        setAllUsers(profilesData || []);
      }

      // Fetch student documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('student_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (documentsError) {
        console.error('Error fetching students:', documentsError);
      } else {
        setStudents(documentsData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDocumentComplete = (student: StudentDocument) => {
    return !!(student.lor_url && student.sop_url && student.resume_url);
  };

  const hasSubmittedDocuments = (userId: string) => {
    return students.some(student => student.user_id === userId);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'complete') {
      return matchesSearch && isDocumentComplete(student);
    } else if (filterStatus === 'incomplete') {
      return matchesSearch && !isDocumentComplete(student);
    }
    
    return matchesSearch;
  });

  const filteredUsers = allUsers.filter(user => {
    const name = user.full_name || '';
    const email = user.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const stats = {
    totalUsers: allUsers.length,
    submittedUsers: students.length,
    complete: students.filter(isDocumentComplete).length,
    incomplete: students.filter(s => !isDocumentComplete(s)).length,
    notSubmitted: allUsers.length - students.length
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors"
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
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
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
          Loading data...
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
                  Agency Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage users and review applications
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Submitted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.submittedUsers}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Upload className="text-purple-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Complete</p>
                <p className="text-2xl font-bold text-gray-800">{stats.complete}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Incomplete</p>
                <p className="text-2xl font-bold text-gray-800">{stats.incomplete}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Not Submitted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.notSubmitted}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('all-users');
              setSearchTerm('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'all-users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserCheck size={20} />
            All Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => {
              setActiveTab('submitted');
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'submitted'
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={20} />
            Submitted Documents ({stats.submittedUsers})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'all-users' ? 'Search by name, email or user ID...' : 'Search by name or user ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none"
              />
            </div>
            
            {activeTab === 'submitted' && (
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
            )}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'all-users' ? (
          // All Users View
          filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search' : 'No users registered yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                const hasSubmitted = hasSubmittedDocuments(user.id);
                const userDocument = students.find(s => s.user_id === user.id);
                
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {user.full_name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered: {formatDate(user.created_at)}
                        </p>
                      </div>
                      {hasSubmitted ? (
                        <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                      ) : (
                        <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                      )}
                    </div>

                    {user.updated_at && user.updated_at !== user.created_at && (
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <p className="text-xs text-gray-600">
                          Last updated: {formatDate(user.updated_at)}
                        </p>
                      </div>
                    )}

                    <div className={`px-4 py-3 rounded-lg text-center text-sm font-semibold ${
                      hasSubmitted
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {hasSubmitted ? (
                        <div className="flex items-center justify-center gap-2">
                          <Upload size={16} />
                          Documents Submitted
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle size={16} />
                          No Documents Yet
                        </div>
                      )}
                    </div>

                    {hasSubmitted && userDocument && (
                      <button
                        onClick={() => handleViewDocuments(userDocument)}
                        className="w-full mt-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Documents
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Submitted Documents View
          filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Documents Found</h3>
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
          )
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;