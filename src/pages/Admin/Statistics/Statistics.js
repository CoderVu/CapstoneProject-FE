import React, { useEffect, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import axios from "../../../redux/setup/axios";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, BarElement } from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, BarElement);

const Statistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatistics = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `/api/v1/admin/order/order-statistics`,
      });
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await getStatistics();
        setStatistics(data);
      } catch (error) {
        setError("Failed to fetch statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Prepare data for charts with null checks
  const sortedOrdersByDate = statistics?.ordersByDate 
    ? Object.entries(statistics.ordersByDate).sort((a, b) => new Date(a[0]) - new Date(b[0]))
    : [];

  const sortedRevenueByMonth = statistics?.revenueByMonthYear
    ? Object.entries(statistics.revenueByMonthYear).sort((a, b) => a[0].localeCompare(b[0]))
    : [];

  // Calculate today's orders
  const getTodayOrders = () => {
    if (!statistics?.ordersByDate) return 0;
    
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return statistics.ordersByDate[today] || 0;
  };

  // Calculate current month revenue
  const getCurrentMonthRevenue = () => {
    if (!statistics?.revenueByMonthYear) return 0;
    
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    return statistics.revenueByMonthYear[currentMonthYear] || 0;
  };

  const ordersByDateData = {
    labels: sortedOrdersByDate.map(([date]) => date),
    datasets: [
      {
        label: "Đơn hàng theo ngày",
        data: sortedOrdersByDate.map(([, count]) => count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueByMonthData = {
    labels: sortedRevenueByMonth.map(([month]) => month),
    datasets: [
      {
        label: "Doanh thu theo tháng",
        data: sortedRevenueByMonth.map(([, amount]) => amount),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(153, 102, 255, 1)",
        pointBorderColor: "#fff",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const ordersByStatusData = {
    labels: statistics?.ordersByStatus ? Object.keys(statistics.ordersByStatus) : [],
    datasets: [
      {
        label: "Orders by Status",
        data: statistics?.ordersByStatus ? Object.values(statistics.ordersByStatus) : [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const topProductsData = {
    labels: statistics?.topProducts ? statistics.topProducts.map(item => Object.keys(item)[0]) : [],
    datasets: [
      {
        label: "Số lượng bán ra",
        data: statistics?.topProducts ? statistics.topProducts.map(item => Object.values(item)[0]) : [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ordersByRegionData = {
    labels: statistics?.ordersByRegion 
      ? Object.keys(statistics.ordersByRegion).map(address => {
          // Extract province from address
          const provinceMatch = address.match(/Tỉnh ([^,]+)|Thành phố ([^,]+)/);
          if (provinceMatch) {
            return provinceMatch[1] || provinceMatch[2]; // Return either "Tỉnh" or "Thành phố" match
          }
          return "Không xác định";
        })
      : [],
    datasets: [
      {
        label: "Số đơn hàng",
        data: statistics?.ordersByRegion 
          ? Object.entries(statistics.ordersByRegion).reduce((acc, [address, count]) => {
              const provinceMatch = address.match(/Tỉnh ([^,]+)|Thành phố ([^,]+)/);
              const province = provinceMatch ? (provinceMatch[1] || provinceMatch[2]) : "Không xác định";
              acc[province] = (acc[province] || 0) + count;
              return acc;
            }, {})
          : [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thống kê tổng quan</h2>
          <p className="text-gray-600">Thống kê đơn hàng, doanh thu và hiệu suất kinh doanh</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-500 text-lg">Đang tải dữ liệu thống kê...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg text-center">
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Total Orders and Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Tổng đơn hàng</h3>
                    <p className="text-3xl font-bold text-blue-700">{statistics?.totalOrders || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">Tất cả thời gian</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-600 mb-2">Tổng doanh thu</h3>
                    <p className="text-3xl font-bold text-green-700">
                      {(statistics?.totalRevenue || 0).toLocaleString()} VND
                    </p>
                    <p className="text-xs text-green-500 mt-1">Tất cả thời gian</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-purple-600 mb-2">Đơn hàng hôm nay</h3>
                    <p className="text-3xl font-bold text-purple-700">
                      {getTodayOrders()}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">Hôm nay</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-orange-600 mb-2">Doanh thu tháng</h3>
                    <p className="text-3xl font-bold text-orange-700">
                      {getCurrentMonthRevenue().toLocaleString()} VND
                    </p>
                    <p className="text-xs text-orange-500 mt-1">Tháng hiện tại</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Line Chart for Orders by Date */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Đơn hàng theo ngày</h2>
                <div className="h-[400px]">
                  <Line
                    data={ordersByDateData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: "top",
                          labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                              size: 14
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Line Chart for Revenue by Month */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Doanh thu theo tháng</h2>
                <div className="h-[400px]">
                  <Line
                    data={revenueByMonthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: "top",
                          labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                              size: 14
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: 12
                            },
                            callback: function(value) {
                              return value.toLocaleString() + ' VND';
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Pie Chart for Orders by Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Đơn hàng theo trạng thái</h2>
                <div className="h-[400px]">
                  <Pie 
                    data={ordersByStatusData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: "top",
                          labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                              size: 14
                            }
                          }
                        } 
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Bar Chart for Top Products */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Top 5 sản phẩm bán chạy</h2>
                <div className="h-[400px]">
                  <Bar
                    data={topProductsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                              size: 14
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Bar Chart for Orders by Region */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Đơn hàng theo khu vực</h2>
                <div className="h-[400px]">
                  <Bar
                    data={ordersByRegionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            boxWidth: 15,
                            padding: 20,
                            font: {
                              size: 14
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: 12
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Top Customers Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Top 5 khách hàng</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng chi tiêu</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statistics?.topCustomers?.map((customer, index) => {
                        const name = Object.keys(customer)[0];
                        const amount = Object.values(customer)[0];
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{amount.toLocaleString()} VND</td>
                          </tr>
                        );
                      }) || (
                        <tr>
                          <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <p>Không có dữ liệu khách hàng</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;