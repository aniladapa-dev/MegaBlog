import React from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import authService from "../../services/auth"
import { logout } from "../../store/authSlice"

function LogoutBtn({ onLogout }){
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logoutHandler = () => {
        if (onLogout) onLogout();
        authService.logout().then( ()=> {
            dispatch(logout())
            navigate('/')
        })
    }

    return (
        <button
        className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg hover:cursor-pointer transition-all duration-200"
        onClick={logoutHandler}
        >Logout</button>
    )

}

export default LogoutBtn; 