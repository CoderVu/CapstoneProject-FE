import React, { useState } from "react";

const ProductTabs = ({ productDescription, careInstructions }) => {
  console.log("productDescriptionn", productDescription);
  const [activeTab, setActiveTab] = useState("description");

  // Dữ liệu của từng tab
  const tabData = {
    description: {
      title: "MÔ TẢ SẢN PHẨM",
      content: productDescription.productDescription.description,
      table: productDescription.productDescription.attributes
      ? Object.entries(productDescription.productDescription.attributes)
      : [],
    },
    returnPolicy: {
      title: "QUY ĐỊNH ĐỔI TRẢ",
      content: `Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm đổi trả phải còn nguyên vẹn, chưa qua sử dụng.`,
      table: [
        ["Thời gian đổi trả", "7 ngày"],
        ["Điều kiện sản phẩm", "Chưa qua sử dụng"],
        ["Chi phí đổi trả", "Miễn phí"],
      ],
    },
    careInstructions: {
      title: "HƯỚNG DẪN CHĂM SÓC",
      content: careInstructions.productCareInstructions.description,
      table: [
        ["Giặt máy", "Không"],
        ["Giặt tay", "Có"],
        ["Nhiệt độ nước", "Dưới 30°C"],
      ],
    },
    storageInstructions: {
      title: "HƯỚNG DẪN BẢO QUẢN",
      content: `Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp.`,
      table: [
        ["Nhiệt độ bảo quản", "Dưới 25°C"],
        ["Độ ẩm", "Tránh ẩm ướt"],
        ["Tránh ánh nắng", "Có"],
      ],
    },
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b pb-2">
        {Object.keys(tabData).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabData[tab].title}
          </button>
        ))}
      </div>

      {/* Nội dung của tab */}
      <div>
        <h3 className="text-lg font-semibold">{tabData[activeTab].title}</h3>
        <p className="text-gray-600">{tabData[activeTab].content}</p>
      </div>

      {/* Bảng thông tin sản phẩm */}
      <div className="mt-4">
        <table className="w-full border border-gray-300">
          <tbody>
            {tabData[activeTab].table.map(([label, value], index) => (
              <tr key={index} className="border-b">
                <td className="p-2 border-r bg-gray-100 font-semibold">{label}</td>
                <td className="p-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTabs;