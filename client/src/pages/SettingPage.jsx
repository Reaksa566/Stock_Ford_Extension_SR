import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaUserEdit, FaTrashAlt, FaTimes, FaSave, FaUsers, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api/auth/users'; // Admin-only endpoint

// --- User Management Modal ---
const UserModal = ({ isOpen, onClose, initialData, onSaveSuccess }) => {
    const [data, setData] = useState(initialData || { username: '', password: '', role: 'User' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setData(initialData || { username: '', password: '', role: 'User' });
        setError('');
    }, [initialData, isOpen]); // Reset state when modal opens/changes user

    const isEdit = initialData && initialData._id;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            let res;

            if (isEdit) {
                // Update (PUT)
                const updateData = { role: data.role };
                if (data.password) { updateData.password = data.password; } // Only send password if changed
                
                res = await axios.put(`${API_URL}/${data._id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create (POST - Register)
                if (!data.username || !data.password) {
                    setError('សូមបញ្ចូលឈ្មោះ និងពាក្យសម្ងាត់។');
                    setLoading(false);
                    return;
                }
                res = await axios.post('/api/auth/register', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            onSaveSuccess(); // Refresh list
            onClose(); 
        } catch (err) {
            setError(err.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ។ សូមសាកល្បងម្តងទៀត។');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 duration-300">
                
                <div className="p-5 border-b flex justify-between items-center bg-ford-blue text-white rounded-t-xl">
                    <h3 className="text-xl font-bold">
                        {isEdit ? 'កែសម្រួលអ្នកប្រើប្រាស់' : 'បង្កើតអ្នកប្រើប្រាស់ថ្មី'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-5 space-y-4">
                        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg flex items-center"><FaExclamationCircle className="mr-2" /> {error}</div>}

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={data.username} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue disabled:bg-gray-100" 
                                disabled={isEdit} // Prevent changing username on edit
                            />
                        </div>
                        
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{isEdit ? 'ពាក្យសម្ងាត់ថ្មី (ទុកចោលបើមិនកែ)' : 'ពាក្យសម្ងាត់'}</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={data.password} 
                                onChange={handleChange} 
                                required={!isEdit} // Required only for new user
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue" 
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">សិទ្ធិ (Role)</label>
                            <select 
                                name="role" 
                                value={data.role} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue bg-white"
                            >
                                <option value="Admin">Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            បោះបង់
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-ford-blue rounded-lg hover:bg-ford-blue/90 disabled:bg-ford-blue/60 flex items-center">
                            {loading ? 'កំពុងរក្សាទុក...' : <><FaSave className="mr-2" /> រក្សាទុក</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main SettingPage Component ---
const SettingPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'Admin') {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if authenticated as Admin
    if (user && user.role === 'Admin') {
        fetchUsers();
    } else {
        setLoading(false);
    }
  }, [fetchUsers, user]);

  const handleModalOpen = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };


  const handleDelete = async (id) => {
    if (user?.role !== 'Admin') return;
    
    // Custom confirm dialog (reused from AccessoryPage)
    const confirmed = await new Promise(resolve => {
        const confirmDialog = document.createElement('div');
        confirmDialog.innerHTML = `
            <div class="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    <h3 class="text-xl font-bold text-red-600 mb-4">បញ្ជាក់ការលុប</h3>
                    <p class="text-gray-700 mb-6">តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់នេះមែនទេ?</p>
                    <div class="flex justify-end space-x-3">
                        <button id="cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button>
                        <button id="confirm-btn" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">លុប</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmDialog);
        document.getElementById('cancel-btn').onclick = () => {
            document.body.removeChild(confirmDialog);
            resolve(false);
        };
        document.getElementById('confirm-btn').onclick = async () => {
            document.body.removeChild(confirmDialog);
            resolve(true);
        };
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6 text-center text-xl text-red-600 bg-red-50 rounded-xl shadow-lg mt-10">
        អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ផ្ទាំងនេះទេ (សម្រាប់តែ Admin)។
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center border-b pb-2">
        <FaUsers className="mr-3 text-ford-blue" /> ការគ្រប់គ្រងអ្នកប្រើប្រាស់ (User Settings)
      </h1>

      {/* Control Panel */}
      <div className="flex justify-end">
        <button 
          onClick={() => handleModalOpen()}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150"
        >
          <FaPlus className="mr-2" /> បង្កើតអ្នកប្រើប្រាស់ថ្មី
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="text-center p-8 text-ford-blue font-medium">កំពុងទាញទិន្នន័យអ្នកប្រើប្រាស់...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">សិទ្ធិ (Role)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">កាលបរិច្ឆេទបង្កើត</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ប្រតិបត្តិការ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ford-blue">{item.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleModalOpen(item)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-100 transition"
                        title="Edit User"
                      >
                        <FaUserEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-100 transition"
                        title="Delete User"
                        disabled={item.role === 'Admin'} // Prevent deleting Admin for safety
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && users.length === 0 && (
          <div className="text-center p-8 text-gray-500">មិនមានអ្នកប្រើប្រាស់ផ្សេងទៀតទេ។</div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedUser}
        onSaveSuccess={fetchUsers}
      />
    </div>
  );
};

export default SettingPage;
