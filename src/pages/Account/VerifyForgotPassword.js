import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyForgotPasswordService } from "../../redux/service/authService";
import { showErrorToast, showSuccessToast } from "../../components/Toast/ToastNotification";

const VerifyForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) {
      showErrorToast("Vui lòng nhập mã xác thực");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyForgotPasswordService(email, code, "123456789");
      showSuccessToast(response?.message || "Đặt lại mật khẩu thành công! Mật khẩu mới của bạn là: 123456789");
      navigate("/signin");
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể đặt lại mật khẩu";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex items-center justify-center py-10">
      <div className="w-[400px] bg-white rounded-sm shadow-sm">
        {/* Header */}
        <div className="bg-[#ee4d2d] p-4">
          <h2 className="text-white text-xl font-medium text-center">Xác Thực Email</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Mã xác thực đã được gửi đến email <strong className="text-[#ee4d2d]">{email}</strong>
            </p>
            <p className="text-sm text-[#ee4d2d] mt-2">
              Sau khi xác thực, mật khẩu của bạn sẽ được đặt lại thành: <strong>123456789</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Nhập mã xác thực"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#ee4d2d] text-white rounded-sm hover:bg-[#f05d40] transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Không nhận được mã?</span>
            <button 
              onClick={() => navigate("/forgot-password")}
              className="text-[#ee4d2d] hover:underline"
            >
              Gửi lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyForgotPassword; 