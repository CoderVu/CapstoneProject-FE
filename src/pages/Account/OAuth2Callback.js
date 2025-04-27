
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { oauth2LoginSuccess } from "../../redux/actions/authActions";
import { fetchUserData } from "../../redux/service/authService";

const OAuth2Callback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOAuth2Data = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get("token");

                if (!token) {
                    console.error("Token is missing from URL");
                    navigate("/signin");
                    return;
                }
                const data = await fetchUserData(token);
                console.log("OAuth2 data:", data);
                if (data && data.data) {
                    const { id, email, fullName, phoneNumber, address, avatar, role } = data.data;
                    const user = { id, email, fullName, phoneNumber, address, avatar, role };
                    dispatch(oauth2LoginSuccess(user, token));
                    const isAdmin = role?.name === "ROLE_ADMIN";
                    console.log("Is admin:", isAdmin);
                    if (isAdmin) {
                        navigate("/admin/dashboard");
                    } else {
                        navigate("/");
                    }
                } else {
                    console.error("Invalid user data:", data);
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