import React, { useState, useEffect } from "react";
import axios from "axios";

export const AddressSelector = ({ onAddressChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // Fetch provinces data on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://provinces.open-api.vn/api/?depth=2");
        setProvinces(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu tỉnh/thành phố");
        setLoading(false);
        console.error("Error fetching provinces:", err);
      }
    };

    fetchProvinces();
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.code === parseInt(selectedProvince));
      if (province && province.districts) {
        setDistricts(province.districts);
        setSelectedDistrict(""); // Reset district when province changes
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedProvince, provinces]);

  // Update parent component when address changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && detailAddress) {
      const province = provinces.find(p => p.code === parseInt(selectedProvince));
      const district = districts.find(d => d.code === parseInt(selectedDistrict));

      if (province && district) {
        const fullAddress = `${detailAddress}, ${district.name}, ${province.name}`;
        onAddressChange(fullAddress);
      }
    }
  }, [selectedProvince, selectedDistrict, detailAddress, provinces, districts, onAddressChange]);

  // Handle province change
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  // Handle detail address change
  const handleDetailAddressChange = (e) => {
    setDetailAddress(e.target.value);
  };

  if (loading) {
    return <div className="text-center py-2 text-gray-500">Đang tải dữ liệu địa chỉ...</div>;
  }

  if (error) {
    return <div className="text-center py-2 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-gray-700 mb-1">Tỉnh/Thành phố *</label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="">-- Chọn Tỉnh/Thành phố --</option>
          {provinces.map(province => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Quận/Huyện *</label>
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          disabled={!selectedProvince}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${!selectedProvince ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          required
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map(district => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Địa chỉ cụ thể *</label>
        <input
          type="text"
          value={detailAddress}
          onChange={handleDetailAddressChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Số nhà, tên đường, phường/xã..."
          required
        />
      </div>

      <div className="text-xs text-gray-500 mt-1">
        * Vui lòng nhập đầy đủ địa chỉ để đảm bảo giao hàng chính xác
      </div>
    </div>
  );
};

export default AddressSelector;
