import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/actions/authActions";
import { FcGoogle } from "react-icons/fc"; 
import { oauth2LoginSuccess } from "../../redux/actions/authActions";
import { fetchUserData } from "../../redux/service/authService";
import types from "../../redux/types";
const SignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errPhoneNumber, setErrPhoneNumber] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);
  const auth = useSelector(state => state.auth.auth);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const isAdmin = auth?.role?.name === "ROLE_ADMIN";
      if (isAdmin) {
        navigate("/admin/dashboard");  
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, auth, navigate]);
  useEffect(() => {
    // Reset auth state khi vào màn đăng nhập
    dispatch({ type: types.LOGIN_RESET });
  }, [dispatch]);
  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
    setErrPhoneNumber("");
  };    

  const handlePassword = (e) => {
    setPassword(e.target.value);
    setErrPassword("");
  };

  const handleSignIn = (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      setErrPhoneNumber("Enter your phone number");
    }

    if (!password) {
      setErrPassword("Enter your password");
    }

    if (phoneNumber && password) {
      dispatch(loginUser(phoneNumber, password));
      console.log ("error", error)
    }


  };
  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    
    window.open(
     // "http://localhost:8080/oauth2/authorization/google",
       "https://capstoneproject-be-iapt.onrender.com/oauth2/authorization/google",
      "_blank",
      `width=${width},height=${height},top=${top},left=${left}`
    );
    

  
    const messageListener = async (event) => {
      if (event.origin !== "https://capstoneproject-be-iapt.onrender.com") return; 
  
      const { token } = event.data;
  
      if (token) {
        try {
          localStorage.setItem("token", token);
  
          const data = await fetchUserData(token);
          if (data && data.data) {
            const { id, email, fullName, phoneNumber, address, avatar, role } = data.data;
            const user = { id, email, fullName, phoneNumber, address, avatar, role };
            const isAdmin = role?.name === "ROLE_ADMIN";
  
            dispatch(oauth2LoginSuccess(user, token));
            navigate(isAdmin ? "/admin/dashboard" : "/");
          } else {
            console.error("Invalid user data:", data);
            navigate("/signin");
          }
        } catch (error) {
          console.error("OAuth2 fetch error:", error);
          navigate("/signin");
        }
      }
  
      window.removeEventListener("message", messageListener);
    };
  
    window.addEventListener("message", messageListener);
  };
  
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-full lgl:w-1/2 h-full flex items-center justify-center">
        {successMsg ? (
          <div className="w-full lgl:w-[500px] h-full flex flex-col justify-center items-center">
            <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont text-center">
              {successMsg}
            </p>
            <Link to="/signup">
              <button
                className="w-full h-10 bg-primeColor text-gray-200 rounded-md text-base font-titleFont font-semibold 
            tracking-wide hover:bg-black hover:text-white duration-300"
              >
                Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <form className="w-full lgl:w-[450px] h-full flex items-center justify-center" onSubmit={handleSignIn}>
            <div className="px-6 py-4 w-full h-[90%] flex flex-col justify-center items-center overflow-y-scroll scrollbar-thin scrollbar-thumb-primeColor">
              <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-3xl mdl:text-4xl mb-4 text-center">
                Sign in
              </h1>
              <div className="flex flex-col gap-3 w-full">
                {/* Phone Number */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Phone Number
                  </p>
                  <input
                    onChange={handlePhoneNumber}
                    value={phoneNumber}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="tel"
                    placeholder="0763764915"
                  />
                  {errPhoneNumber && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {errPhoneNumber}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-.5">
                  <p className="font-titleFont text-base font-semibold text-gray-600">
                    Password
                  </p>
                  <input
                    onChange={handlePassword}
                    value={password}
                    className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                    type="password"
                    placeholder="********"
                  />
                  {errPassword && (
                    <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                      <span className="font-bold italic mr-1">!</span>
                      {errPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-primeColor hover:bg-black text-gray-200 hover:text-white cursor-pointer w-full text-base font-medium h-10 rounded-md  duration-300"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-blue-500 hover:bg-blue-700 text-white cursor-pointer w-full text-base font-medium h-10 rounded-md mt-4 duration-300 flex items-center justify-center gap-2"
                >
                  <FcGoogle className="text-xl" /> Sign In with Google
                </button>
                <p className="text-sm text-center font-titleFont font-medium">
                  Don't have an Account?{" "}
                  <Link to="/signup">
                    <span className="hover:text-blue-600 duration-300">
                      Sign up
                    </span>
                  </Link>
                </p>
              </div>
              {!isAuthenticated && error && (
                <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                  <span className="font-bold italic mr-1">!</span>
                  {error}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignIn;