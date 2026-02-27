import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle, Eye, Search, Filter, X, FileText, User, Mail, Phone, Calendar } from 'lucide-react';
import { getAllUsers } from '../../api/admin';

const KYCOverview = () => {
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadKYCData = async () => {
      try {
        const users = await getAllUsers();
        // Transform user data to include KYC information
        const kycUsers = users.map(user => ({
          ...user,
          kyc_status: user.kyc_status || 'not_submitted',
          kyc_submitted_at: user.kyc_submitted_at || null,
          documents_count: user.documents_count || 0
        }));
        setKycData(kycUsers);
      } catch (error) {
        console.error('Error loading KYC data:', error);
        // Mock data for development
        setKycData([
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            kyc_status: 'pending',
            kyc_submitted_at: new Date().toISOString(),
            documents_count: 3
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            kyc_status: 'verified',
            kyc_submitted_at: new Date(Date.now() - 86400000).toISOString(),
            documents_count: 4
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadKYCData();
  }, []);

  const handleKYCUpdate = async (userId, newStatus) => {
    try {
      // Update KYC status
      setKycData(prev => prev.map(user => 
        user.id === userId ? { ...user, kyc_status: newStatus } : user
      ));
      console.log(`Updated user ${userId} KYC status to ${newStatus}`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const filteredKYCData = kycData.filter(userData => {
    const matchesSearch = !searchTerm || 
      userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || userData.kyc_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      total: kycData.length,
      pending: kycData.filter(u => u.kyc_status === 'pending').length,
      verified: kycData.filter(u => u.kyc_status === 'verified').length,
      rejected: kycData.filter(u => u.kyc_status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KYC data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
          KYC Verification Overview
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 font-medium">Manage customer identity verification</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.verified}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Management Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="not_submitted">Not Submitted</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKYCData.map((userData) => (
                <tr key={userData.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                        {userData.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userData.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                      userData.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      userData.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userData.kyc_status === 'verified' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                      ) : userData.kyc_status === 'pending' ? (
                        <><Clock className="w-3 h-3 mr-1" /> Pending</>
                      ) : userData.kyc_status === 'rejected' ? (
                        <><AlertTriangle className="w-3 h-3 mr-1" /> Rejected</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Not Submitted</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userData.kyc_submitted_at ? new Date(userData.kyc_submitted_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        userData.documents_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.documents_count || 0} docs
                      </span>
                      {userData.documents_count > 0 && (
                        <button 
                          onClick={() => handleViewUser(userData)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {userData.kyc_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleKYCUpdate(userData.id, 'verified')}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleKYCUpdate(userData.id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {userData.kyc_status === 'verified' && (
                        <button
                          onClick={() => handleKYCUpdate(userData.id, 'pending')}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all duration-200"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Revoke
                        </button>
                      )}
                      {userData.kyc_status === 'rejected' && (
                        <button
                          onClick={() => handleKYCUpdate(userData.id, 'pending')}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Review
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewUser(userData)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredKYCData.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No KYC records found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* KYC Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">KYC Details</h3>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  User Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedUser.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  KYC Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Current Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                      selectedUser.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedUser.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.kyc_status === 'verified' ? (
                        <><CheckCircle className="w-4 h-4 mr-1" /> Verified</>
                      ) : selectedUser.kyc_status === 'pending' ? (
                        <><Clock className="w-4 h-4 mr-1" /> Pending Review</>
                      ) : selectedUser.kyc_status === 'rejected' ? (
                        <><AlertTriangle className="w-4 h-4 mr-1" /> Rejected</>
                      ) : (
                        <><Clock className="w-4 h-4 mr-1" /> Not Submitted</>
                      )}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Submission Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedUser.kyc_submitted_at ? new Date(selectedUser.kyc_submitted_at).toLocaleDateString() : 'Not submitted'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Documents ({selectedUser.documents_count || 0})
                </h4>
                {selectedUser.documents_count > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">Identity Document</p>
                            <p className="text-sm text-gray-500">Government ID</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-green-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">Address Proof</p>
                            <p className="text-sm text-gray-500">Utility Bill</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedUser.kyc_status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleKYCUpdate(selectedUser.id, 'rejected');
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleKYCUpdate(selectedUser.id, 'verified');
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCOverview;