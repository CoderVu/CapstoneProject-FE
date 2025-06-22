import React, { useState } from "react";

const ProductTabs = ({ productDescription, productCareInstructions }) => {
  const [activeTab, setActiveTab] = useState("description");

  // Dữ liệu của từng tab
  const tabData = {
    description: {
      title: "MÔ TẢ SẢN PHẨM",
      content: productDescription === null
        ? "Chưa có mô tả chi tiết cho sản phẩm này."
        : (productDescription?.description || "Không có mô tả sản phẩm."),
      table: productDescription === null
        ? []
        : (productDescription?.attributes ? Object.entries(productDescription.attributes) : []),
    },
    returnPolicy: {
      title: "QUY ĐỊNH ĐỔI TRẢ",
      content: "Chúng tôi chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày mua hàng.",
      table: [
        ["Thời gian đổi trả", "7 ngày"],
        ["Điều kiện sản phẩm", "Chưa qua sử dụng"],
        ["Chi phí đổi trả", "Miễn phí"],
      ],
    },
    careInstructions: {
      title: "HƯỚNG DẪN BẢO QUẢN",
      content: productCareInstructions === null
        ? "Chưa có hướng dẫn chăm sóc cho sản phẩm này."
        : (productCareInstructions?.description || "Không có hướng dẫn sử dụng."),
      table: productCareInstructions === null
        ? []
        : (productCareInstructions?.attributes ? Object.entries(productCareInstructions.attributes) : []),
    },
    storageInstructions: {
      title: "HƯỚNG DẪN SỬ DỤNG",
      content: "Sản phẩm này không cần hướng dẫn sử dụng.",
      table: [
        ["Cách bảo quản", "Nơi khô ráo, tránh ánh nắng trực tiếp"],
        ["Cách sử dụng", "Mặc trực tiếp hoặc phối cùng trang phục khác tùy theo mục đích sử dụng"],
        
      ],
    },
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
        {Object.keys(tabData).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 rounded transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabData[tab].title}
          </button>
        ))}
      </div>

      {/* Nội dung của tab */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{tabData[activeTab].title}</h3>
        <div className="text-gray-700 leading-relaxed">
          {tabData[activeTab].content}
        </div>
      </div>

      {/* Bảng thông tin sản phẩm */}
      {tabData[activeTab].table.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-3">Thông số chi tiết:</h4>
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <tbody>
              {tabData[activeTab].table.map(([label, value], index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 border-r border-gray-300 font-medium w-1/3">{label}</td>
                  <td className="p-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        (activeTab === "description" && productDescription === null) ||
        (activeTab === "careInstructions" && productCareInstructions === null) ? (
          <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-700">
            <p className="text-center">
              {activeTab === "description"
                ? "Chưa có thông số kỹ thuật cho sản phẩm này."
                : "Chưa có thông số hướng dẫn chăm sóc cho sản phẩm này."}
            </p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ProductTabs;
