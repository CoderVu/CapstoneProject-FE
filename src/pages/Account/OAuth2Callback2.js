import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { oauth2LoginSuccess } from "../../redux/actions/authActions";

const OAuth2Callback2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOAuth2Data = async () => {
      try {
       // Gửi yêu cầu đến server để lấy dữ liệu người dùng
       const response = await fetch('http://192.168.1.28:8080/api/v1/auth/oauth2/callback', {
        method: 'GET',
        credentials: 'include', // Nếu cần thiết

        });
        const data = await response.json();
        if (data.statusCode === 200) {
          const { id, email, fullName, phoneNumber, address, avatar, token, roles } = data.data;
          const user = { id, email, fullName, phoneNumber, address, avatar, roles };
          dispatch(oauth2LoginSuccess(user, token)); // Save user info and token to Redux store
          navigate("/"); // Redirect to the home page or main page
        } else {
          navigate("/signin"); // Redirect to the sign-in page if not successful
        }
      } catch (error) {
        console.error("Error fetching OAuth2 data:", error);
        navigate("/signin"); // Redirect to the sign-in page if there's an error
      }
    };

    fetchOAuth2Data();
  }, [dispatch, navigate]);

  return <div>Loading...</div>;
};

export default OAuth2Callback2;