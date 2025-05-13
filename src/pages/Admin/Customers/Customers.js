import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsersAction, fetchUserByIdAction, deleteUserAction } from "../../../redux/actions/adminActions";
import { Search, Edit, Trash2, UserPlus, Filter, X } from "lucide-react";
import { toast } from "react-toastify";
import CustomerList from './CustomerList';

const Customers = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllUsersAction());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality if needed
      toast.info("Search functionality to be implemented");
    } else {
      dispatch(fetchAllUsersAction());
    }
  };

  const handleViewUser = async (userId) => {
    try {
      await dispatch(fetchUserByIdAction(userId));
      // Handle viewing user details
    } catch (error) {
      toast.error("Error fetching user details");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUserAction(userId));
      toast.success("Xóa khách hàng thành công");
    } catch (error) {
      toast.error("Lỗi khi xóa khách hàng");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý khách hàng</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <UserPlus size={20} />
          Thêm khách hàng
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </form>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
          <Filter size={20} />
          Lọc
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <CustomerList 
          users={users} 
          onViewUser={handleViewUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default Customers; 