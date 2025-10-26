import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaFilter, FaSearch, FaFileUpload, FaEdit, FaEye, FaTrashAlt, FaTimes, FaSave, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL_BASE = '/api/tools';

// --- Modal component for Add/Edit/View (StockModal) ---
// This is reusable logic for both Accessory and Tool pages.
const StockModal = ({ isOpen, onClose, initialData, isView, itemType, fetchItems }) => {
  const { user } = useAuth();
  const [data, setData] = useState(initialData || { description: '', unit: '', initialStock: 0, stockIn: 0, stockOut: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quantityChange, setQuantityChange] = useState(0); // For Stock In/Out movement
  const [changeType, setChangeType] = useState('IN'); // 'IN' or 'OUT'
  const [reference, setReference] = useState('');

  useEffect(() => {
    setData(initialData || { description: '', unit: '', initialStock: 0, stockIn: 0, stockOut: 0 });
    setQuantityChange(0);
    setReference('');
    setError('');
  }, [initialData, isOpen]);

  const isEdit = initialData && initialData._id;
  const isWritable = user?.role === 'Admin' && !isView;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleQuantityChange = (e) => {
      setQuantityChange(Number(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isWritable) return;

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let res;
      let payload = { description: data.description, unit: data.unit };
      
      if (isEdit) {
          // If editing, handle stock movement separately from description/unit update
          if (quantityChange > 0) {
              payload = {
                  ...payload,
                  quantityChange,
                  changeType,
                  reference,
              };
          }
          res = await axios.put(`${API_URL_BASE}/${data._id}`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });

      } else {
        // Create (POST)
        payload = { ...payload, initialStock: data.initialStock };
        res = await axios.post(API_URL_BASE, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onClose(true); // Close and refresh
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ។ សូមសាកល្បងម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 duration-300">
        
        {/* Modal Header */}
        <div className="p-5 border-b flex justify-between items-center bg-ford-blue text-white rounded-t-xl">
          <h3 className="text-xl font-bold">
            {isView ? 'មើលព័ត៌មានលម្អិត' : isEdit ? `កែសម្រួលសម្ភារៈ` : `បន្ថែមសម្ភារៈថ្មី`}
          </h3>
          <button onClick={() => onClose(false)} className="text-white hover:text-gray-300">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg flex items-center"><FaExclamationCircle className="mr-2" /> {error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">បរិយាយ (Description)</label>
                    <input type="text" name="description" value={data.description} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue" disabled={isView} />
                </div>
                {/* Unit */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">ឯកតា (Unit)</label>
                    <input type="text" name="unit" value={data.unit} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue" disabled={isView} />
                </div>
            </div>
            
            {/* Stock Display */}
            <div className="grid grid-cols-3 gap-4 border p-3 rounded-lg bg-gray-50">
                <div className="text-sm font-medium text-gray-700">Stock In: <span className="text-green-600 font-bold">{data.stockIn}</span></div>
                <div className="text-sm font-medium text-gray-700">Stock Out: <span className="text-red-600 font-bold">{data.stockOut}</span></div>
                <div className="text-sm font-medium text-gray-700">Total Stock: <span className="text-ford-blue font-bold">{data.totalStock}</span></div>
            </div>

            {/* Initial Stock (Only for new item) */}
            {!isEdit && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">ស្តុកដំបូង (Initial Stock)</label>
                    <input type="number" name="initialStock" value={data.initialStock} onChange={handleChange} required={!isEdit} min="0" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue" disabled={isView} />
                </div>
            )}
            
            {/* Stock Movement (Only for editing Admin) */}
            {isEdit && isWritable && (
                <div className="border border-yellow-300 p-4 rounded-lg bg-yellow-50 space-y-3">
                    <h4 className="font-semibold text-orange-700">កែសម្រួលស្តុក (Stock Movement)</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ប្រភេទ</label>
                            <select value={changeType} onChange={(e) => setChangeType(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg bg-white">
                                <option value="IN">ស្តុកចូល (IN)</option>
                                <option value="OUT">ស្តុកចេញ (OUT)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ចំនួន</label>
                            <input type="number" value={quantityChange} onChange={handleQuantityChange} min="1" required className="mt-1 w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700">ឯកសារយោង (Reference/Note)</label>
                            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                </div>
            )}

            {/* Stock History (View Only) */}
            {isView && data.stockHistory && (
                <div className="pt-4 border-t mt-4">
                    <h4 className="font-semibold mb-2">ប្រវត្តិស្តុកចេញ-ចូល (History)</h4>
                    <div className="h-40 overflow-y-auto bg-gray-100 p-3 rounded-lg scrollbar-thin">
                      {data.stockHistory.length > 0 ? (
                        data.stockHistory.slice().reverse().map((history, index) => (
                            <div key={index} className={`flex justify-between text-sm py-1 border-b ${history.type === 'IN' ? 'text-green-700' : 'text-red-700'}`}>
                                <span>[{history.type}] {history.quantity} {data.unit} - {history.reference || 'N/A'}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(history.date).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">មិនមានប្រវត្តិស្តុក</p>
                      )}
                    </div>
                </div>
            )}
            
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
            <button type="button" onClick={() => onClose(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
              {isView ? 'បិទ' : 'បោះបង់'}
            </button>
            {isWritable && (
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-ford-blue rounded-lg hover:bg-ford-blue/90 disabled:bg-ford-blue/60 flex items-center">
                {loading ? 'កំពុងរក្សាទុក...' : <><FaSave className="mr-2" /> រក្សាទុក</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal component for Import Excel (ImportModal) ---
const ImportModal = ({ isOpen, onClose, itemType, onImportSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Note: itemType here is 'tool'
  const API_IMPORT_URL = `/api/${itemType}s/import`; 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('សូមជ្រើសរើសឯកសារ Excel (.xlsx) មួយ។');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(API_IMPORT_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setMessage(`ជោគជ័យ! បញ្ចូលទិន្នន័យ ${res.data.importedCount} កំណត់ត្រា (Updated: ${res.data.updatedCount}, Created: ${res.data.createdCount})`);
      onImportSuccess(); 
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'ការ Import បរាជ័យ។ សូមពិនិត្យមើលទ្រង់ទ្រាយឯកសារ។');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        
        <div className="p-5 border-b flex justify-between items-center bg-ford-blue text-white rounded-t-xl">
          <h3 className="text-xl font-bold">
            <FaFileUpload className="inline mr-2" /> នាំចូលសម្ភារៈពី Excel
          </h3>
          <button onClick={() => onClose(false)} className="text-white hover:text-gray-300">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              ឯកសារ Excel ត្រូវតែមានជួរឈរ (Columns) ដូចខាងក្រោម៖ **Description**, **Unit**, **Stock In**។
              បើសិនជា **Description** មានឈ្មោះដូចគ្នា វានឹងធ្វើការ **បូកបញ្ចូល Stock In** លើទិន្នន័យចាស់។
            </p>
            
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg flex items-center text-sm">{error}</div>}
            {message && <div className="bg-green-100 text-green-600 p-3 rounded-lg flex items-center text-sm">{message}</div>}

            <label className="block text-sm font-medium text-gray-700">ជ្រើសរើសឯកសារ (.xlsx)</label>
            <input 
              type="file" 
              accept=".xlsx" 
              onChange={handleFileChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue"
              required
              disabled={loading}
            />
            {file && <p className="text-xs text-gray-500">ឯកសារដែលបានជ្រើសរើស: {file.name}</p>}
          </div>

          <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-600/60 flex items-center">
              {loading ? 'កំពុងនាំចូល...' : <><FaFileUpload className="mr-2" /> នាំចូល</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main ToolsPage Component ---
const ToolsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'description', direction: 'asc' });

  const itemType = 'សម្ភារៈ';
  
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(`Error fetching ${itemType}s:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    setIsViewMode(false);
    setSelectedItem(null);
    if (shouldRefresh) {
      fetchItems();
    }
  };
  
  const handleImportClose = (shouldRefresh = false) => {
      setIsImportModalOpen(false);
      if (shouldRefresh) {
          fetchItems();
      }
  };

  const handleDelete = async (id) => {
    if (user?.role !== 'Admin') return;
    
    // Custom confirm dialog (reused logic)
    const confirmed = await new Promise(resolve => {
        const confirmDialog = document.createElement('div');
        confirmDialog.innerHTML = `
            <div class="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    <h3 class="text-xl font-bold text-red-600 mb-4">បញ្ជាក់ការលុប</h3>
                    <p class="text-gray-700 mb-6">តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ? ប្រតិបត្តិការនេះមិនអាចត្រឡប់វិញបានទេ។</p>
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
      await axios.delete(`${API_URL_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      // Show error message (ideally using a toast notification)
    }
  };

  const handleSort = (key) => {
    setSortBy(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy.key];
    const bValue = b[sortBy.key];

    // Handle numerical sorting (Stock fields)
    if (typeof aValue === 'number') {
      if (sortBy.direction === 'asc') return aValue - bValue;
      return bValue - aValue;
    }

    // Handle string sorting (Description, Unit)
    const comparison = String(aValue).localeCompare(String(bValue));
    if (sortBy.direction === 'asc') return comparison;
    return -comparison;
  });

  const filteredData = sortedData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key) => {
    if (sortBy.key !== key) return null;
    return sortBy.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">គ្រប់គ្រងសម្ភារៈ (Tool Management)</h1>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="ស្វែងរកតាមបរិយាយ (Description)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-ford-blue focus:border-ford-blue"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Action Buttons (Admin Only) */}
        {user?.role === 'Admin' && (
          <div className="flex space-x-3 w-full md:w-auto justify-end">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition duration-150"
            >
              <FaFileUpload className="mr-2" /> Import Excel
            </button>
            <button 
              onClick={() => { setSelectedItem(null); setIsViewMode(false); setIsModalOpen(true); }}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-ford-blue rounded-lg shadow-md hover:bg-ford-blue/90 transition duration-150"
            >
              <FaPlus className="mr-2" /> បន្ថែមថ្មី
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="text-center p-8 text-ford-blue font-medium">កំពុងទាញទិន្នន័យ...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th onClick={() => handleSort('description')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900">បរិយាយ (Description){getSortIcon('description')}</th>
                  <th onClick={() => handleSort('unit')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900">ឯកតា (Unit){getSortIcon('unit')}</th>
                  <th onClick={() => handleSort('stockIn')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900">ស្តុកចូល (Stock In){getSortIcon('stockIn')}</th>
                  <th onClick={() => handleSort('stockOut')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900">ស្តុកចេញ (Stock Out){getSortIcon('stockOut')}</th>
                  <th onClick={() => handleSort('totalStock')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900">ស្តុកសរុប (Total Stock){getSortIcon('totalStock')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ច្រើនទៀត (More)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{item.stockIn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{item.stockOut}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">{item.totalStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => { setSelectedItem(item); setIsViewMode(true); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-100 transition"
                        title="View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {user?.role === 'Admin' && (
                        <>
                          <button 
                            onClick={() => { setSelectedItem(item); setIsViewMode(false); setIsModalOpen(true); }}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-100 transition"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-100 transition"
                            title="Delete"
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filteredData.length === 0 && (
          <div className="text-center p-8 text-gray-500">មិនមានទិន្នន័យសម្ភារៈទេ។</div>
        )}
      </div>

      {/* Add/Edit/View Modal */}
      <StockModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedItem}
        isView={isViewMode}
        itemType="សម្ភារៈ"
        fetchItems={fetchItems}
      />

      {/* Import Modal */}
      <ImportModal
          isOpen={isImportModalOpen}
          onClose={handleImportClose}
          itemType="tool"
          onImportSuccess={fetchItems}
      />
    </div>
  );
};

export default ToolsPage;
