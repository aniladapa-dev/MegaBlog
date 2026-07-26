import { useEffect, useState } from 'react'
import './App.css'
import { useDispatch } from 'react-redux'
import authService from "./services/auth";
import { login, logout } from './store/authSlice'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'


function App() {
  
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
        if(userData){
          dispatch(login({userData}))
        }
        else{
          dispatch(logout())
        }
    })
    .finally(() => setLoading(false))
  }, [])
  
  

  return !loading ? (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100 transition-colors duration-250">
      <Header />
  
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
  
      <Footer />
    </div>
  ) : null;
  
}

export default App
