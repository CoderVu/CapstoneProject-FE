import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";

const AddressSelector = ({ onAddressChange, initialAddress = null }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

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

  // Set initial address values if provided
  useEffect(() => {
    if (initialAddress && provinces.length > 0) {
      // Find province by name
      const province = provinces.find(p => p.name === initialAddress.city);
      if (province) {
        setSelectedProvince(province.code.toString());
        setDistricts(province.districts);

        // Find district by name
        const district = province.districts.find(d => d.name === initialAddress.district);
        if (district) {
          setSelectedDistrict(district.code.toString());
        }
      }

      setStreet(initialAddress.street || "");
      setHouseNumber(initialAddress.houseNumber || "");
    }
  }, [initialAddress, provinces]);

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.code === parseInt(selectedProvince));
      if (province && province.districts) {
        setDistricts(province.districts);
        if (!initialAddress) {
          setSelectedDistrict(""); // Reset district when province changes, only if not setting initial values
        }
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
  }, [selectedProvince, provinces, initialAddress]);

  // Update parent component when address changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      const province = provinces.find(p => p.code === parseInt(selectedProvince));
      const district = districts.find(d => d.code === parseInt(selectedDistrict));

      if (province && district) {
        onAddressChange({
          city: province.name,
          district: district.name,
          street: street,
          houseNumber: houseNumber
        });
      }
    }
  }, [selectedProvince, selectedDistrict, street, houseNumber, provinces, districts, onAddressChange]);

  // Handle province change
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Đang tải dữ liệu địa chỉ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg p-3 flex items-center justify-center">
        <FaMapMarkerAlt className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
          <select
  value={selectedProvince}
  onChange={handleProvinceChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-20 bg-white"
  required
>
  <option value="">-- Chọn Tỉnh/Thành phố --</option>
  {provinces.map((province) => (
    <option key={province.code} value={province.code}>
      {province.name}
    </option>
  ))}
</select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!selectedProvince ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đường <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tên đường"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số nhà <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Số nhà, căn hộ, tòa nhà..."
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
