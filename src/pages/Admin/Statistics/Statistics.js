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
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Thống kê</h1>
        <p className="text-sm md:text-base text-gray-600">Thống kê đơn hàng và doanh thu</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-center">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total Orders and Revenue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-blue-600 mb-1">Tổng đơn hàng</h3>
              <p className="text-2xl font-bold text-blue-700">{statistics?.totalOrders || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-green-600 mb-1">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-green-700">
                {(statistics?.totalRevenue || 0).toLocaleString()} VND
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart for Orders by Date */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Đơn hàng theo ngày</h2>
              <div className="h-[300px]">
                <Line
                  data={ordersByDateData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 0,
                          font: {
                            size: 11
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
                            size: 11
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Doanh thu theo tháng</h2>
              <div className="h-[300px]">
                <Line
                  data={revenueByMonthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 0,
                          font: {
                            size: 11
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
                            size: 11
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Đơn hàng theo trạng thái</h2>
              <div className="h-[300px]">
                <Pie 
                  data={ordersByStatusData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      } 
                    }
                  }} 
                />
              </div>
            </div>

            {/* Bar Chart for Top Products */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Top 5 sản phẩm bán chạy</h2>
              <div className="h-[300px]">
                <Bar
                  data={topProductsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 0,
                          font: {
                            size: 11
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
                            size: 11
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Đơn hàng theo khu vực</h2>
              <div className="h-[300px]">
                <Bar
                  data={ordersByRegionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45,
                          minRotation: 0,
                          font: {
                            size: 11
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
                            size: 11
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Top 5 khách hàng</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistics?.topCustomers?.map((customer, index) => {
                      const name = Object.keys(customer)[0];
                      const amount = Object.values(customer)[0];
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{amount.toLocaleString()} VND</td>
                        </tr>
                      );
                    }) || (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">Không có dữ liệu</td>
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
  );
};

export default Statistics;