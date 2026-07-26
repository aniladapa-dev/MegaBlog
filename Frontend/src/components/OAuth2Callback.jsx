import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import authService from "../services/auth";

function OAuth2Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Save token and clear stale data from previous session/database
            sessionStorage.setItem("token", token);
            localStorage.removeItem("recentlyViewed");

            // Fetch current user details
            authService.getCurrentUser()
                .then((userData) => {
                    if (userData) {
                        dispatch(authLogin({ userData }));
                        navigate("/");
                    } else {
                        navigate("/login");
                    }
                })
                .catch((err) => {
                    console.error("OAuth2 Callback login error:", err);
                    navigate("/login");
                });
        } else {
            navigate("/login");
        }
    }, [searchParams, dispatch, navigate]);

    return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-bold">Completing authentication...</h2>
            <p className="text-gray-400 mt-2">Please wait while we set up your session.</p>
        </div>
    );
}

export default OAuth2Callback;
