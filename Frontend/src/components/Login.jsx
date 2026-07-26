import React, { useState } from "react"
import {login as authLogin} from "../store/authSlice"
import {Button, Input, Logo} from "./index"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import authService, { AuthService } from "../services/auth"
import { useForm } from "react-hook-form"

function Login(){
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")

    const login = async(data) => {
        setError("")
        try {
            const session = await authService.login(data)
            if(session){
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(authLogin(userData))
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

    return (
    <div className="flex items-center justify-center w-full min-h-[70vh]">
        <div className="mx-auto w-full max-w-lg bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 shadow-xl backdrop-blur-md transition-colors duration-250">
            <div className="mb-6 flex justify-center">
                <span className="inline-block w-full max-w-[100px]">
                    <Logo width="100%" />
                </span>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-250">Sign in to account</h2>
            <p className="mt-2 text-center text-sm text-slate-650 dark:text-gray-400 transition-colors duration-250">
                Don&apos;t have any account?&nbsp;
                <Link
                    to="/signup"
                    className="font-semibold text-purple-650 dark:text-purple-400 hover:text-purple-750 dark:hover:text-purple-300 transition-all duration-200 hover:underline hover:cursor-pointer"
                >
                    Sign Up
                </Link>
            </p>
            {error && <p className="text-red-500 mt-6 text-center text-sm font-semibold">{error}</p>}

            <form onSubmit={handleSubmit(login)} className="mt-8">
                <div className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required: true,
                        })}
                    />
                    <Button
                        type="submit"
                        className="w-full mt-2"
                    >
                        Sign in
                    </Button>
                </div>
            </form>

            <div className="mt-6 flex items-center justify-between">
                <span className="border-b border-gray-800 w-[40%]"></span>
                <span className="text-xs text-center text-gray-500 uppercase font-semibold">or</span>
                <span className="border-b border-gray-800 w-[40%]"></span>
            </div>

            <button
                type="button"
                onClick={() => window.location.href = `${backendUrl}/oauth2/authorization/google`}
                className="w-full mt-4 flex items-center justify-center gap-3 bg-gray-950/70 border border-gray-850 hover:border-gray-800 text-gray-200 font-semibold py-2.5 rounded-xl hover:bg-gray-900/60 hover:cursor-pointer transition duration-200 shadow-md"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
            </button>
        </div>
    </div>
  )

}

export default Login


