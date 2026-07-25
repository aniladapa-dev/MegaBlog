import React, { useState, useEffect } from "react"
import { Container, Logo, LogoutBtn } from "../index"
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx"

function Header(){
    const { theme, toggleTheme } = useTheme()
    const authStatus = useSelector((state) => state.auth.status)
    const userData = useSelector((state) => state.auth.userData)
    const navigate = useNavigate()

    const [headerSearch, setHeaderSearch] = useState("")
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const [userSearchQuery, setUserSearchQuery] = useState("")
    const [userSearchResults, setUserSearchResults] = useState([])
    const [showUserSearchResults, setShowUserSearchResults] = useState(false)

    // Debounced search for users
    useEffect(() => {
        if (userSearchQuery.trim().length < 2) {
            setUserSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/auth/users/search?query=${encodeURIComponent(userSearchQuery)}`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(sessionStorage.getItem("token") ? { "Authorization": `Bearer ${sessionStorage.getItem("token")}` } : {})
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserSearchResults(data);
                }
            } catch (err) {
                console.error("Error searching users", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchQuery]);

    // Close user search dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUserSearchResults(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        setUserMenuOpen(false);
    }, [authStatus, userData]);

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (headerSearch.trim()) {
            navigate(`/all-posts?search=${encodeURIComponent(headerSearch.trim())}`)
        }
    }



    const authNavItems = [
        { name: 'Home', slug: '/', active: authStatus },
        { name: 'Bookmarks', slug: '/bookmarks', active: authStatus },
        { name: 'Add Post', slug: '/add-post', active: authStatus },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/85 dark:bg-[#030712]/85 backdrop-blur-md py-3 shadow-sm transition-colors duration-250">
            <Container>
                <nav className="flex items-center justify-between gap-4">
                    {/* Left: Logo & Core Nav */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link to='/'>
                            <Logo width="70px"/>
                        </Link>

                        {/* Authenticated Left Nav */}
                        {authStatus && (
                            <ul className="hidden md:flex items-center gap-1">
                                {authNavItems.map((item) => (
                                    <li key={item.name}>
                                        <button
                                            onClick={() => navigate(item.slug)}
                                            className="px-3 py-1.5 text-base font-medium text-gray-650 dark:text-gray-300 hover:text-purple-650 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/60 hover:cursor-pointer transition-all duration-200"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* User Search Bar */}
                    {authStatus && (
                        <div 
                            className="relative flex-1 max-w-sm hidden sm:block"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center bg-gray-50 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 focus-within:border-purple-500/50 transition">
                                <svg className="w-[17px] h-[17px] text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearchQuery}
                                    onChange={(e) => {
                                        setUserSearchQuery(e.target.value);
                                        setShowUserSearchResults(true);
                                    }}
                                    onFocus={() => setShowUserSearchResults(true)}
                                    className="w-full bg-transparent border-none outline-none text-sm ml-2 text-slate-800 dark:text-gray-200 placeholder-gray-400"
                                />
                                {userSearchQuery && (
                                    <button 
                                        onClick={() => setUserSearchQuery("")}
                                        className="text-gray-400 hover:text-gray-200 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showUserSearchResults && userSearchQuery.trim().length >= 2 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                                    {userSearchResults.length === 0 ? (
                                        <div className="p-3 text-[11px] text-gray-500 text-center">No users found</div>
                                    ) : (
                                        userSearchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    navigate(`/profile/${user.id}`);
                                                    setUserSearchQuery("");
                                                    setShowUserSearchResults(false);
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-purple-500/10 dark:hover:bg-purple-500/15 flex items-center gap-2.5 transition border-b border-gray-100 dark:border-gray-900/50 last:border-b-0 hover:cursor-pointer"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">{user.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-all duration-200 hover:cursor-pointer flex items-center justify-center"
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {theme === "dark" ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Unauthenticated Quick Buttons */}
                        {!authStatus && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-3.5 py-1.5 text-base font-medium text-gray-650 dark:text-gray-300 hover:text-purple-650 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-all duration-200"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/20"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {/* Authenticated Toolbar */}
                        {authStatus && (
                            <div className="flex items-center gap-2">
                                {/* User Dropdown Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 transition duration-200 hover:cursor-pointer"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-gray-200 max-w-[100px] truncate">
                                            {userData?.name || 'User'}
                                        </span>
                                    </button>

                                    {/* Profile Dropdown Items */}
                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#090d16] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-20 p-2 space-y-1 text-xs">
                                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800/80 mb-1">
                                                    <p className="font-bold text-slate-800 dark:text-white truncate">{userData?.name || 'Writer'}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{userData?.email || 'user@megablog.com'}</p>
                                                </div>
                                                <button
                                                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 hover:cursor-pointer"
                                                >
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/all-posts?filter=my'); setUserMenuOpen(false); }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 hover:cursor-pointer"
                                                >
                                                    My Articles
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/bookmarks'); setUserMenuOpen(false); }}
                                                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 hover:cursor-pointer"
                                                >
                                                    Bookmarks
                                                </button>
                                                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-1 mt-1">
                                                    <LogoutBtn onLogout={() => setUserMenuOpen(false)} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </nav>
            </Container>
        </header>
    )
}

export default Header;