import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtpService } from "../../redux/service/authService"; // Bạn cần tạo hàm này
import { showErrorToast, showSuccessToast } from "../../components/Toast/ToastNotification";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [code, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!code) {
      showErrorToast("Please enter the OTP code.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtpService(email, code); // Gọi hàm verifyOtpService với email và OTP
      showSuccessToast(response?.message || "OTP verified successfully!");
      navigate("/signin");
    } catch (error) {
        console.error("Error verifying OTP:", error);
      const msg = error?.response?.data?.message || "An error occurred. Please try again.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-[400px]">
        <h2 className="text-2xl font-semibold text-center mb-4">Verify Your Email</h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          We've sent an OTP code to <strong>{email}</strong>. Please enter it below.
        </p>
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={code}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primeColor text-white py-2 rounded-md hover:bg-black transition duration-300 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-3">
          Didn't receive the code? <span className="text-blue-500 cursor-pointer">Resend</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
