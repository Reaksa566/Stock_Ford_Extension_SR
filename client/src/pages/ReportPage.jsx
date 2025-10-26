import React, { useState } from 'react';
import axios from 'axios';
import { FaFileAlt, FaExclamationTriangle, FaCalendarDay, FaDownload, FaMagic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Set base URL for API (for local development)
const API_URL_BASE = '/api/reports';

const ReportPage = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('all'); // 'all', 'dangerous', 'daily'
  const [dailyType, setDailyType] = useState('accessory'); // 'accessory' or 'tool'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState('របាយការណ៍ស្តុកសរុប');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    setSummary('');

    try {
      const token = localStorage.getItem('token');
      let url = API_URL_BASE;
      let title = '';

      if (reportType === 'all') {
        url += '/all';
        title = 'របាយការណ៍ស្តុកសរុប';
      } else if (reportType === 'dangerous') {
        url += '/dangerous';
        title = 'របាយការណ៍ស្តុកគ្រោះថ្នាក់ (< 20% Total Stock)';
      } else if (reportType === 'daily') {
        if (!startDate || !endDate) {
          setError('សូមជ្រើសរើសកាលបរិច្ឆេទចាប់ផ្តើម និងបញ្ចប់សម្រាប់របាយការណ៍ប្រចាំថ្ងៃ។');
          setLoading(false);
          return;
        }
        url += `/daily/${dailyType}?startDate=${startDate}&endDate=${endDate}`;
        title = `របាយការណ៍ប្រចាំថ្ងៃ (${dailyType === 'accessory' ? 'គ្រឿងបន្លាស់' : 'ឧបករណ៍'})`;
      } else {
        setLoading(false);
        return;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReportData(res.data);
      setReportTitle(title);
    } catch (err) {
      setError(err.response?.data?.message || 'ការទាញយករាយការណ៍បរាជ័យ។');
    } finally {
      setLoading(false);
    }
  };

  const generateExecutiveSummary = async () => {
    if (!reportData || loading || summaryLoading) return;

    setSummaryLoading(true);
    setSummary('');

    try {
        let reportContent;
        if (reportType === 'all') {
            reportContent = {
                accessories: reportData.accessories.map(item => ({ desc: item.description, totalStock: item.totalStock, stockIn: item.stockIn, stockOut: item.stockOut })),
                tools: reportData.tools.map(item => ({ desc: item.description, totalStock: item.totalStock, stockIn: item.stockIn, stockOut: item.stockOut })),
            };
        } else if (reportType === 'dangerous') {
            reportContent = {
                dangerousAccessories: reportData.dangerousAccessories.map(item => ({ desc: item.description, totalStock: item.totalStock, stockIn: item.stockIn })),
                dangerousTools: reportData.dangerousTools.map(item => ({ desc: item.description, totalStock: item.totalStock, stockIn: item.stockIn })),
            };
        } else if (reportType === 'daily') {
             reportContent = reportData.report.map(item => ({
                desc: item.description,
                in: item.stockIn,
                out: item.stockOut,
                unit: item.unit
            }));
        }


        const systemPrompt = `Act as a senior inventory and financial analyst for 'Stock Ford Extension'. Your task is to provide a concise, single-paragraph executive summary based on the provided JSON stock data. Focus primarily on critical items: identify low stock (if applicable), items with high turnover, and any anomalies. Suggest high-level corrective actions (e.g., reorder, investigate usage). Write the summary in a professional, formal tone.`;
        
        const userQuery = `Analyze the following inventory report data for ${reportTitle}. The current date is ${getTodayDate()}. Data: ${JSON.stringify(reportContent, null, 2)}`;
        
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "មិនអាចបង្កើតសេចក្តីសង្ខេបបានទេ។";
        setSummary(generatedText);

    } catch (err) {
        console.error("Gemini API Error:", err);
        setSummary("មានបញ្ហាក្នុងការភ្ជាប់ទៅ AI Service។");
    } finally {
        setSummaryLoading(false);
    }
  };


  const renderTable = (dataArray, title) => {
    if (!dataArray || dataArray.length === 0) return <p className="text-gray-500">មិនមានទិន្នន័យ {title} ទេ។</p>;
    
    // Determine headers based on the first item's keys (excluding _id)
    const headers = Object.keys(dataArray[0]).filter(key => key !== '_id' && key !== 'stockHistory');

    const formatHeader = (key) => {
        if (key === 'description') return 'បរិយាយ';
        if (key === 'unit') return 'ឯកតា';
        if (key === 'stockIn' || key === 'in') return 'ស្តុកចូល';
        if (key === 'stockOut' || key === 'out') return 'ស្តុកចេញ';
        if (key === 'totalStock') return 'ស្តុកសរុប';
        if (key === 'dangerous') return 'គ្រោះថ្នាក់';
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    return (
        <div className="mt-4">
            <h4 className="font-semibold text-lg mb-2">{title}</h4>
            <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map(key => (
                                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{formatHeader(key)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dataArray.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {headers.map(key => (
                                    <td key={key} className={`px-6 py-4 whitespace-nowrap text-sm ${
                                        key === 'totalStock' || key === 'stockIn' ? 'font-bold' : 'text-gray-700'
                                    }`}>
                                        {item[key] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };
  
  const renderReportContent = () => {
    if (!reportData) return null;

    if (reportType === 'all') {
      return (
        <div className="space-y-6">
          {renderTable(reportData.accessories, 'គ្រឿងបន្លាស់ (Accessory)')}
          {renderTable(reportData.tools, 'ឧបករណ៍ (Tools)')}
        </div>
      );
    } 
    
    if (reportType === 'dangerous') {
      return (
        <div className="space-y-6">
          {renderTable(reportData.dangerousAccessories, 'គ្រឿងបន្លាស់គ្រោះថ្នាក់')}
          {renderTable(reportData.dangerousTools, 'ឧបករណ៍គ្រោះថ្នាក់')}
        </div>
      );
    } 
    
    if (reportType === 'daily') {
      return (
        <div className="space-y-6">
          {renderTable(reportData.report, reportTitle)}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <FaFileAlt className="mr-3 text-ford-blue" /> របាយការណ៍ស្តុក
      </h1>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-5 space-y-4">
        <h3 className="text-xl font-semibold text-gray-700">ជ្រើសរើសប្រភេទរបាយការណ៍</h3>
        
        {/* Report Type Selector */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setReportType('all')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${reportType === 'all' ? 'bg-ford-blue text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            របាយការណ៍សរុប
          </button>
          <button
            onClick={() => setReportType('dangerous')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${reportType === 'dangerous' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <FaExclamationTriangle className="mr-2" /> ស្តុកគ្រោះថ្នាក់
          </button>
          <button
            onClick={() => setReportType('daily')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${reportType === 'daily' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <FaCalendarDay className="mr-2" /> របាយការណ៍ប្រចាំថ្ងៃ
          </button>
        </div>
        
        {/* Daily Report Filters */}
        {reportType === 'daily' && (
          <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-3">
            <div className="flex space-x-4 items-center">
              <label className="text-sm font-medium text-gray-700">ប្រភេទ:</label>
              <select 
                value={dailyType} 
                onChange={(e) => setDailyType(e.target.value)} 
                className="p-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="accessory">គ្រឿងបន្លាស់ (Accessory)</option>
                <option value="tool">ឧបករណ៍ (Tool)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">
                ពីថ្ងៃ (Start Date):
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg" required />
              </label>
              <label className="text-sm font-medium text-gray-700">
                ដល់ថ្ងៃ (End Date):
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg" required />
              </label>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-600/60"
          >
            {loading ? 'កំពុងទាញយករាយការណ៍...' : <><FaDownload className="mr-2" /> ទាញយករាយការណ៍</>}
          </button>
        </div>
      </div>

      {/* Report Display Area */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {reportData && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-2xl font-bold text-gray-800">{reportTitle}</h2>
            <button
                onClick={generateExecutiveSummary}
                disabled={summaryLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 transition disabled:bg-purple-600/60"
            >
                {summaryLoading ? 'កំពុងវិភាគ...' : <><FaMagic className="mr-2" /> វិភាគរបាយការណ៍ (AI)</>}
            </button>
          </div>
          
          {/* Executive Summary by AI */}
          {summary && (
            <div className="mb-6 p-4 border-l-4 border-purple-500 bg-purple-50 rounded-lg shadow-inner">
                <h4 className="font-semibold text-purple-800 mb-2">សេចក្តីសង្ខេបប្រតិបត្តិការដោយ AI</h4>
                <p className="text-gray-700 text-sm italic">{summary}</p>
            </div>
          )}

          {/* Render Tables */}
          {renderReportContent()}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
