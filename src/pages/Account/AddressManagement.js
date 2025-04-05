import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaTimes, FaSave, FaHome, FaBriefcase, FaHeart } from "react-icons/fa";
import AddressSelector from "../payment/AddressSelector";
import { fetchAddress, updateAddress, deleteAddress } from "../../redux/service/authService";

const AddressCard = ({ address, onEdit, onDelete, isDefault }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative group"
        >
            {isDefault && (
                <span className="absolute top-0 right-0 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                    Mặc định
                </span>
            )}

            <div className="mb-2 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    <FaMapMarkerAlt />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">
                        {address.label || "Địa chỉ"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {address.houseNumber || ""}, {address.street || ""}
                    </p>
                </div>
            </div>

            <p className="text-gray-700">
                {address.district}, {address.city}
            </p>

            {confirmDelete ? (
                <div className="mt-3 flex justify-between items-center border-t pt-3 border-gray-200">
                    <span className="text-sm text-red-500">Xác nhận xóa?</span>
                    <div className="space-x-2">
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="px-3 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => onDelete(address.id)}
                            className="px-3 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 flex justify-end space-x-2 border-t pt-3 border-gray-200">
                    <button
                        onClick={() => onEdit(address)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Chỉnh sửa"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Xóa"
                    >
                        <FaTrash />
                    </button>
                </div>
            )}
        </motion.div>
    );
};


const AddressForm = ({ address, onSave, onCancel, token }) => {
    const [formData, setFormData] = useState({
        id: address?.id || null,
        label: address?.label || "Nhà riêng",
        city: address?.city || "",
        district: address?.district || "",
        street: address?.street || "",
        houseNumber: address?.houseNumber || "",
        isDefault: address?.isDefault || false
    });

    const [validationError, setValidationError] = useState("");

    const handleAddressChange = useCallback((addressData) => {
        setFormData((prev) => ({
            ...prev,
            ...addressData
        }));
    }, []); // Empty dependency array ensures the function is memoized

    const handleLabelChange = (label) => {
        setFormData((prev) => ({
            ...prev,
            label
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.city || !formData.district || !formData.street || !formData.houseNumber) {
            setValidationError("Vui lòng điền đầy đủ thông tin địa chỉ");
            return;
        }

        onSave(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-hidden mb-6"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    {address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                <button
                    onClick={onCancel}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhãn địa chỉ
                    </label>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => handleLabelChange("Nhà riêng")}
                            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${formData.label === "Nhà riêng"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <FaHome className="mr-1.5" /> Nhà riêng
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLabelChange("Văn phòng")}
                            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${formData.label === "Văn phòng"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <FaBriefcase className="mr-1.5" /> Văn phòng
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLabelChange("Khác")}
                            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${formData.label === "Khác"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <FaHeart className="mr-1.5" /> Khác
                        </button>
                    </div>
                </div>

                <AddressSelector onAddressChange={handleAddressChange} initialAddress={address} />

                <div className="mt-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
                    </label>
                </div>

                {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center"
                    >
                        <FaSave className="mr-1.5" /> Lưu địa chỉ
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const AddressManagement = ({ token }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // Load addresses on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setLoading(true);
                // Use token from props or fallback to localStorage
                const authToken = token || localStorage.getItem('token');
                const response = await fetchAddress(authToken);

                // Extract addresses from the response
                const addressList = response?.data?.addressList || [];

                // Process addresses to ensure they have all required fields
                const processedAddresses = addressList.map(addr => ({
                    id: addr.id,
                    city: addr.city || "",
                    district: addr.district || "",
                    street: addr.street || "",
                    houseNumber: addr.houseNumber || "",
                    label: addr.label || "Địa chỉ",
                    isDefault: addr.isDefault || false
                }));

                setAddresses(processedAddresses);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching addresses:", err);

                setLoading(false);
            }
        };

        fetchAddresses();
    }, [token]);

    // Add or update address
    const handleSaveAddress = async (addressData) => {
        try {
            setLoading(true);
            const authToken = token || localStorage.getItem('token');
            await updateAddress(addressData, authToken);
            // Update local state
            setAddresses(prev =>
                prev.map(address => address.id === addressData.id ? addressData : address)
            );


            // Reset form state
            setIsAddingAddress(false);
            setEditingAddress(null);
            setLoading(false);
        } catch (error) {
            console.error("Error saving address:", error);

            setLoading(false);
        }
        // call fetchAddresses to refresh the address list
        const fetchAddresses = async () => {
            try {
                setLoading(true);
                const authToken = token || localStorage.getItem('token');
                const response = await fetchAddress(authToken);

                const addressList = response?.data?.addressList || [];

                const processedAddresses = addressList.map(addr => ({
                    id: addr.id,
                    city: addr.city || "",
                    district: addr.district || "",
                    street: addr.street || "",
                    houseNumber: addr.houseNumber || "",
                    label: addr.label || "Địa chỉ",
                    isDefault: addr.isDefault || false
                }));

                setAddresses(processedAddresses);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching addresses:", err);

                setLoading(false);
            }
        };
        fetchAddresses();
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        try {
            setLoading(true);
            const authToken = token || localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            };

            await deleteAddress(addressId, authToken, config);


            // Update local state by removing the deleted address
            setAddresses(prev => prev.filter(address => address.id !== addressId));
            setLoading(false);
        } catch (error) {
            console.error("Error deleting address:", error);

            setLoading(false);
        }
    };

    // Handle edit address
    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setIsAddingAddress(false);
    };

    // Handle form cancel
    const handleCancelForm = () => {
        setIsAddingAddress(false);
        setEditingAddress(null);
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center justify-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách địa chỉ</h2>

                {!isAddingAddress && !editingAddress && (
                    <button
                        onClick={() => setIsAddingAddress(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-300 flex items-center"
                    >
                        <FaPlus className="mr-1.5" size={14} />
                        <span>Thêm địa chỉ mới</span>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isAddingAddress && (
                    <AddressForm
                        onSave={handleSaveAddress}
                        onCancel={handleCancelForm}
                        token={token}
                    />
                )}

                {editingAddress && (
                    <AddressForm
                        address={editingAddress}
                        onSave={handleSaveAddress}
                        onCancel={handleCancelForm}
                        token={token}
                    />
                )}
            </AnimatePresence>

            {addresses.length === 0 && !isAddingAddress ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaMapMarkerAlt className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
                    <p className="text-gray-600 mb-6">Hãy thêm địa chỉ của bạn để thuận tiện cho việc giao hàng sau này</p>
                    <button
                        onClick={() => setIsAddingAddress(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <FaPlus className="inline mr-1.5" size={14} />
                        <span>Thêm địa chỉ mới</span>
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {addresses.map(address => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                isDefault={address.isDefault}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AddressManagement;
