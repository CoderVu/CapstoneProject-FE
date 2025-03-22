import React, { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";

const Payment = () => {
  const [orderDetails] = useState({
    orderId: "ORD" + Math.floor(Math.random() * 1000000),
    amount: 1275000, // Amount in VND
    items: [
      { name: "Premium T-shirt", price: 450000, quantity: 2 },
      { name: "Designer Jeans", price: 375000, quantity: 1 }
    ]
  });

  const [paymentStep, setPaymentStep] = useState(1); // 1: select method, 2: QR shown, 3: success
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown

  // Simulate payment confirmation
  const handleConfirmPayment = () => {
    setPaymentStep(3);
  };

  // Format currency in VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VND');
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Thanh toán" />

      <div className="pb-10">
        {paymentStep === 1 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Chọn phương thức thanh toán</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ZaloPay Option */}
              <div
                onClick={() => setPaymentStep(2)}
                className="border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer hover:bg-blue-50 transition duration-200"
              >
                <div className="flex-shrink-0 mr-4">
                  <img
                    src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                    alt="ZaloPay"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">ZaloPay</h3>
                  <p className="text-gray-600 text-sm">Thanh toán nhanh chóng và an toàn qua ứng dụng ZaloPay</p>
                </div>
              </div>

              {/* Other payment options (can be expanded later) */}
              <div className="border border-gray-200 rounded-lg p-4 flex items-center opacity-50 cursor-not-allowed">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Thẻ tín dụng</h3>
                  <p className="text-gray-600 text-sm">Chỉ khả dụng trong phiên bản Production</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                * Lưu ý: Trong môi trường phát triển, chỉ có tùy chọn ZaloPay được kích hoạt để kiểm thử.
              </p>
            </div>
          </div>
        )}

        {paymentStep === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center mb-4">
              <img
                src="https://brandlogos.net/wp-content/uploads/2022/05/zalopay-logo_brandlogos.net_fjcup.png"
                alt="ZaloPay"
                className="w-24 h-24 object-contain mx-auto"
              />
              <h2 className="text-2xl font-semibold mt-2 text-blue-600">Thanh toán với ZaloPay</h2>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-8">
              <div className="md:w-1/2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Chi tiết đơn hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(orderDetails.amount)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <p className="font-medium mb-2">Sản phẩm:</p>
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm mb-1">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Hướng dẫn thanh toán:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Mở ứng dụng ZaloPay hoặc Zalo trên điện thoại của bạn</li>
                    <li>Chọn "Thanh Toán" và quét mã QR</li>
                    <li>Xác nhận thanh toán trên ứng dụng</li>
                    <li>Đợi hệ thống xác nhận giao dịch</li>
                  </ol>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setPaymentStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                  >
                    Quay lại
                  </button>

                  {/* For demo purposes, allow confirming directly */}
                  <button
                    onClick={handleConfirmPayment}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Xác nhận đã thanh toán
                  </button>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col items-center">
                <div className="border-4 border-green-500 rounded-lg p-2 bg-white">
                  <img
                    src="https://docs.zalopay.vn/images/qrcode/qrcode_merchant.png"
                    alt="ZaloPay QR Code"
                    className="w-64 h-64 object-contain mx-auto"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Thời gian quét mã QR để thanh toán còn
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentStep === 3 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
            <p className="text-gray-600 mb-6">Mã đơn hàng: <span className="font-medium">{orderDetails.orderId}</span></p>

            <Link to="/">
              <button className="w-52 h-12 bg-primeColor text-white text-lg hover:bg-black duration-300 rounded">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
