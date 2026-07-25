import React, {useState} from 'react'
import authService from '../appwrite/auth.js'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice.js'
import {Button, Input, Logo} from './index.js'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("")
        try {
            const userData = await authService.createAccount(data)
            if (userData) {
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(login(userData));
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className="flex items-center justify-center w-full min-h-[70vh]">
            <div className="mx-auto w-full max-w-lg bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 shadow-xl backdrop-blur-md transition-colors duration-250">
                <div className="mb-6 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-250">Sign up to create account</h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400 transition-colors duration-250">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 hover:underline hover:cursor-pointer"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-500 mt-6 text-center text-sm font-semibold">{error}</p>}

                <form onSubmit={handleSubmit(create)} className="mt-8">
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            {...register("name", {
                                required: true,
                            })}
                        />
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            type="email"
                            {...register("email", {
                                required: true,
                                validate: {
                                    matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
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
                        <Button type="submit" className="w-full mt-2">
                            Create Account
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
                    onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
                    className="w-full mt-4 flex items-center justify-center gap-3 bg-gray-950/70 border border-gray-850 hover:border-gray-800 text-gray-200 font-semibold py-2.5 rounded-xl hover:bg-gray-900/60 hover:cursor-pointer transition duration-200 shadow-md text-xs"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Sign up with Google
                </button>
            </div>
        </div>
    )
}

export default Signup