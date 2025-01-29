import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { oauth2LoginSuccess } from "../../redux/actions/authActions";

const OAuth2Callback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOAuth2Data = async () => {
            try {
                // Lấy token từ URL
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token'); 

                if (!token) {
                    console.error("Token is missing from URL");
                    navigate("/signin");
                    return;
                }

                // Fetch user data using the token
                const response = await fetch(`http://localhost:8080/api/v1/user/info/${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
            
                if (response.ok) {
                    const { id, email, fullName, phoneNumber, address, avatar, roles } = data.data;
                    const user = { id, email, fullName, phoneNumber, address, avatar, roles };
                    dispatch(oauth2LoginSuccess(user, token)); 
                    navigate("/"); 
                } else {
                    console.error("Failed to fetch user data:", data);
                    navigate("/signin"); 
                }
            } catch (error) {
                console.error("Error fetching OAuth2 data:", error);
                navigate("/signin"); 
            }
        };

        fetchOAuth2Data();
    }, [dispatch, navigate]);

    return <div>Loading...</div>; // Display loading while fetching data
};

export default OAuth2Callback;