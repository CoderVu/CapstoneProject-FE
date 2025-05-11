import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, updateUserStatusAction, deleteUserAction, searchUsersAction, updateUserAction } from "../../../redux/actions/adminActions";
import { Search, Edit, Trash2, UserPlus, Filter, X } from "lucide-react";
import { toast } from "react-toastify";

const Customers = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const { users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllUsers(currentPage, pageSize));
  }, [dispatch, currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchUsersAction(searchQuery));
    } else {
      dispatch(fetchAllUsers(currentPage, pageSize));
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatusAction(userId, newStatus));
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await dispatch(deleteUserAction(userId));
        toast.success("Xóa khách hàng thành công");
      } catch (error) {
        toast.error("Lỗi khi xóa khách hàng");
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserAction(editingUser.id, editingUser));
      toast.success("Cập nhật thông tin thành công");
      setEditingUser(null);
    } catch (error) {
      toast.error("Lỗi khi cập nhật thông tin");
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tham gia
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.content?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar || "https://via.placeholder.com/40"}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    className={`text-sm rounded-full px-3 py-1 ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Hiển thị {users?.content?.length || 0} trên tổng số {users?.totalElements || 0} khách hàng
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= users?.totalPages - 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chỉnh sửa thông tin khách hàng</h2>
              <button onClick={handleCloseEdit} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editingUser.phoneNumber}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 