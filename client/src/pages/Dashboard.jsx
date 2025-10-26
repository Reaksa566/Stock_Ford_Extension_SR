import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBoxes, FaTools, FaExclamationTriangle, FaCalendarDay } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Card Component for Dashboard Summary
const StatCard = ({ title, value, icon: Icon, colorClass, link }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 flex items-center justify-between transition-transform duration-300 hover:scale-[1.02] border-t-4 ${colorClass}`}>
    <div>
      <p className="text-sm font-semibold text-gray-500 uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${colorClass.replace('border-t-4', 'bg-opacity-20 text-opacity-100')}`}>
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAccessories: 0,
    totalTools: 0,
    dangerousItems: 0,
    lastUpdate: 'N/A',
  });
  const [loading, setLoading] = useState(true);
  const [dangerousStock, setDangerousStock] = useState({
    accessories: [],
    tools: [],
  });

  const API_BASE = '/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Total Stock Stats
      const statsRes = await axios.get(`${API_BASE}/reports/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Calculate Totals for Stats Card
      const totalAccessories = statsRes.data.accessories.reduce((acc, item) => acc + item.totalStock, 0);
      const totalTools = statsRes.data.tools.reduce((acc, item) => acc + item.totalStock, 0);

      // Fetch Dangerous Stock Report
      const dangerousRes = await axios.get(`${API_BASE}/reports/dangerous`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allDangerous = [...dangerousRes.data.dangerousAccessories, ...dangerousRes.data.dangerousTools];

      setStats({
        totalAccessories: totalAccessories,
        totalTools: totalTools,
        dangerousItems: allDangerous.length,
        lastUpdate: new Date().toLocaleTimeString('en-US'),
      });

      setDangerousStock({
        accessories: dangerousRes.data.dangerousAccessories,
        tools: dangerousRes.data.dangerousTools,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback for demo
      setStats({
        totalAccessories: 120,
        totalTools: 45,
        dangerousItems: 7,
        lastUpdate: 'Demo Data',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDangerousTableData = () => {
    const accessoryData = dangerousStock.accessories.map(item => ({
        ...item,
        type: 'Accessory',
        percentage: ((item.totalStock / item.stockIn) * 100).toFixed(1),
    }));
    const toolData = dangerousStock.tools.map(item => ({
        ...item,
        type: 'Tool',
        percentage: ((item.totalStock / item.stockIn) * 100).toFixed(1),
    }));
    return [...accessoryData, ...toolData].sort((a, b) => a.percentage - b.percentage);
  };

  const dangerousTableData = getDangerousTableData();

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-2">Dashboard Overview</h1>

      {loading && <div className="text-center text-ford-blue font-medium">Loading data...</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Accessories Stock"
          value={stats.totalAccessories}
          icon={FaBoxes}
          colorClass="border-t-4 border-ford-blue text-ford-blue"
          link="/accessories"
        />
        <StatCard
          title="Total Tools Stock"
          value={stats.totalTools}
          icon={FaTools}
          colorClass="border-t-4 border-green-500 text-green-600"
          link="/tools"
        />
        <StatCard
          title="Low/Dangerous Stock"
          value={stats.dangerousItems}
          icon={FaExclamationTriangle}
          colorClass="border-t-4 border-red-500 text-red-600"
          link="/reports"
        />
        <StatCard
          title="Last Data Refresh"
          value={stats.lastUpdate}
          icon={FaCalendarDay}
          colorClass="border-t-4 border-yellow-500 text-yellow-600"
        />
      </div>

      {/* Dangerous Stock Report Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-red-600 flex items-center mb-4">
          <FaExclamationTriangle className="w-5 h-5 mr-2" />
          Stock គ្រោះថ្នាក់ (Total Stock &lt; 20% of Stock In)
        </h2>

        {dangerousTableData.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">Remaining (%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dangerousTableData.map((item, index) => (
                  <tr key={item._id} className="hover:bg-red-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{item.totalStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.stockIn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No dangerous stock items found. Inventory looks healthy!</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
