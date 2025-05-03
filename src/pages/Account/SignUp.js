import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUserService } from "../../redux/service/authService";
import { showErrorToast } from "../../components/Toast/ToastNotification";
import { useNavigate } from "react-router-dom";


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

    if (!form.fullName) newErrors.fullName = "Enter your name";
    if (!form.email) newErrors.email = "Enter your email";
    else if (!validateEmail(form.email)) newErrors.email = "Enter a valid email";

    if (!form.phone) newErrors.phone = "Enter your phone number";
    else if (form.phone.length < 10 || !form.phone.startsWith("0"))
      newErrors.phone = "Enter a valid phone number";

    if (!form.password) newErrors.password = "Create a password";
    else if (form.password.length < 8)
      newErrors.password = "Passwords must be at least 8 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.address) newErrors.address = "Enter your address";
    if (!checked) newErrors.terms = "You must accept the terms";

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
        state: { email: form.email }  // Gửi email để trang OTP có thể dùng
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
      const msg = error?.response?.data?.message || "Registration failed";
      showErrorToast(msg);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full lgl:w-[500px] h-full flex flex-col justify-center">
        {successMsg ? (
          <div className="w-[500px]">
            <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont">
              {successMsg}
            </p>
            <Link to="/signin">
              <button className="w-full h-10 bg-primeColor rounded-md text-gray-200 font-semibold hover:bg-black hover:text-white duration-300">
                Sign in
              </button>
            </Link>
          </div>
        ) : (
          <form className="w-full h-screen flex items-center justify-center">
            <div className="px-6 py-4 w-full h-[96%] flex flex-col overflow-y-scroll scrollbar-thin scrollbar-thumb-primeColor">
              <h1 className="font-titleFont underline underline-offset-4 text-2xl font-semibold mb-4">
                Create your account
              </h1>

              {[
                { label: "Full Name", name: "fullName", type: "text", placeholder: "eg. John Doe" },
                { label: "Work Email", name: "email", type: "email", placeholder: "john@workemail.com" },
                { label: "Phone Number", name: "phone", type: "text", placeholder: "0123456789" },
                { label: "Password", name: "password", type: "password", placeholder: "Create password" },
                { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm password" },
                { label: "Address", name: "address", type: "text", placeholder: "road-001, house-115, example area" }
              ].map(({ label, name, type, placeholder }) => (
                <div key={name} className="flex flex-col gap-0.5 mb-3">
                  <p className="text-base font-semibold text-gray-600">{label}</p>
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full h-8 px-4 text-base font-medium rounded-md border border-gray-400 outline-none placeholder:text-sm"
                  />

                </div>
              ))}

              {/* Checkbox */}
              <div className="flex items-start gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
                <p className="text-sm text-primeColor">
                  I agree to the Clothes{" "}
                  <span className="text-blue-500">Terms of Service</span> and{" "}
                  <span className="text-blue-500">Privacy Policy</span>.
                </p>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500 font-semibold px-4 mb-2">
                  <span className="font-bold italic mr-1">!</span>
                  {errors.terms}
                </p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSignUp}
                className={`w-full h-10 rounded-md text-gray-200 font-medium duration-300 ${checked
                    ? "bg-primeColor hover:bg-black hover:text-white cursor-pointer"
                    : "bg-gray-500 cursor-not-allowed"
                  }`}
              >
                Create Account
              </button>

              <p className="text-sm text-center mt-4 font-medium">
                Already have an Account?{" "}
                <Link to="/signin">
                  <span className="hover:text-blue-600 duration-300">Sign in</span>
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
