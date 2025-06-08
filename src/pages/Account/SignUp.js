import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUserService } from "../../redux/service/authService";
import { showErrorToast } from "../../components/Toast/ToastNotification";

const SignUp = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!form.email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(form.email)) newErrors.email = "Email không hợp lệ";

    if (!form.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (form.phone.length < 10 || !form.phone.startsWith("0"))
      newErrors.phone = "Số điện thoại không hợp lệ";

    if (!form.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 8)
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";

    if (!form.address) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!checked) newErrors.terms = "Vui lòng đồng ý với điều khoản";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await registerUserService({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        address: form.address,
      });

      setSuccessMsg(response.message);
      navigate("/verify-otp", {
        state: { email: form.email }
      });
      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
      });
      setChecked(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Đăng ký thất bại";
      showErrorToast(msg);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex items-center justify-center py-10">
      <div className="w-[400px] bg-white rounded-sm shadow-sm">
        {/* Header */}
        <div className="bg-[#ee4d2d] p-4">
          <h2 className="text-white text-xl font-medium text-center">Đăng Ký</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {successMsg ? (
            <div className="flex flex-col items-center">
              <p className="text-green-500 font-medium text-center mb-4">
                {successMsg}
              </p>
              <Link to="/signin" className="w-full">
                <button className="w-full h-10 bg-[#ee4d2d] text-white rounded-sm hover:bg-[#f05d40] transition duration-300">
                  Đăng Nhập
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              {[
                { label: "Họ tên", name: "fullName", type: "text", placeholder: "Nhập họ tên" },
                { label: "Email", name: "email", type: "email", placeholder: "Nhập email" },
                { label: "Số điện thoại", name: "phone", type: "tel", placeholder: "Nhập số điện thoại" },
                { label: "Mật khẩu", name: "password", type: "password", placeholder: "Nhập mật khẩu" },
                { label: "Xác nhận mật khẩu", name: "confirmPassword", type: "password", placeholder: "Nhập lại mật khẩu" },
                { label: "Địa chỉ", name: "address", type: "text", placeholder: "Nhập địa chỉ" }
              ].map(({ label, name, type, placeholder }) => (
                <div key={name} className="flex flex-col gap-1">
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full h-10 px-3 border border-gray-300 rounded-sm outline-none focus:border-[#ee4d2d]"
                  />
                  {errors[name] && (
                    <p className="text-[#ee4d2d] text-sm">
                      {errors[name]}
                    </p>
                  )}
                </div>
              ))}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <p className="text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <span className="text-[#ee4d2d] cursor-pointer">Điều khoản dịch vụ</span> và{" "}
                  <span className="text-[#ee4d2d] cursor-pointer">Chính sách bảo mật</span>
                </p>
              </div>
              {errors.terms && (
                <p className="text-[#ee4d2d] text-sm">
                  {errors.terms}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!checked}
                className={`w-full h-10 rounded-sm text-white transition duration-300 ${
                  checked
                    ? "bg-[#ee4d2d] hover:bg-[#f05d40] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Đăng Ký
              </button>

              <div className="flex items-center justify-center gap-2 text-sm mt-4">
                <span className="text-gray-500">Bạn đã có tài khoản?</span>
                <Link to="/signin" className="text-[#ee4d2d] hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;