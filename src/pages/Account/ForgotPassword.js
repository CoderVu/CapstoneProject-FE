import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordService } from "../../redux/service/authService";
import { showErrorToast, showSuccessToast } from "../../components/Toast/ToastNotification";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showErrorToast("Vui lòng nhập email của bạn");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPasswordService(email);
      showSuccessToast(response?.message || "Mã xác thực đã được gửi!");
      navigate("/verify-forgot-password", { state: { email } });
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể gửi mã xác thực";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex items-center justify-center py-10">
      <div className="w-[400px] bg-white rounded-sm shadow-sm">
        {/* Header */}
        <div className="bg-[#ee4d2d] p-4">
          <h2 className="text-white text-xl font-medium text-center">Đặt Lại Mật Khẩu</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-sm text-gray-600 mb-6">
            Vui lòng nhập email đã đăng ký để nhận mã xác thực đặt lại mật khẩu.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#ee4d2d] text-white rounded-sm hover:bg-[#f05d40] transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang gửi..." : "Tiếp tục"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Bạn đã có tài khoản?</span>
            <Link to="/signin" className="text-[#ee4d2d] hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 