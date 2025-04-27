import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "../../../redux/setup/axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

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
      const { data } = response.data;
      return data;
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

  // Prepare data for charts
  const sortedOrdersByDate = statistics
    ? Object.entries(statistics.ordersByDate).sort((a, b) => new Date(a[0]) - new Date(b[0]))
    : [];

  const ordersByDateData = {
    labels: sortedOrdersByDate.map(([date]) => date),
    datasets: [
      {
        label: "Orders by Date",
        data: sortedOrdersByDate.map(([, count]) => count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ordersByStatusData = {
    labels: statistics ? Object.keys(statistics.ordersByStatus) : [],
    datasets: [
      {
        label: "Orders by Status",
        data: statistics ? Object.values(statistics.ordersByStatus) : [],
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Thống kê</h1>
      <p className="text-gray-600 mb-4">Thống kê đơn hàng và doanh thu</p>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart for Orders by Date */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Đơn hàng theo ngày</h2>
            <Bar data={ordersByDateData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>

          {/* Pie Chart for Orders by Status */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Đơn hàng theo trạng thái</h2>
            <Pie data={ordersByStatusData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>

          {/* Total Orders and Revenue */}
          <div className="col-span-1 md:col-span-2 text-center mt-6">
            <h2 className="text-lg font-semibold">Tổng quan</h2>
            <p>
              Tổng đơn hàng: <span className="font-bold">{statistics.totalOrders}</span>
            </p>
            <p>
              Tổng doanh thu: <span className="font-bold">{statistics.totalRevenue.toLocaleString()} VND</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;