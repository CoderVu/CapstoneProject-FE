import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { oauth2LoginSuccess } from "../../redux/actions/authActions";
import { fetchOAuth2UserData } from "../../redux/service/authService";

const OAuth2Callback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOAuth2Data = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');

                if (!token) {
                    console.error("Token is missing from URL");
                    navigate("/signin");
                    return;
                }

                // Use the service to fetch user data
                const data = await fetchOAuth2UserData(token);

                if (data && data.data) {
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

    return <div>Loading...</div>;
};

export default OAuth2Callback;
