import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import postService from "../services/config";
import { Container, PostCard } from '../components'

function Home() {
    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const authStatus = useSelector((state) => state.auth.status)
    const userData = useSelector((state) => state.auth.userData)
    const navigate = useNavigate()

    // Interactive 3D Parallax Hover States for Hero Graphic
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - left) / width - 0.5) * 30
        const y = ((e.clientY - top) / height - 0.5) * 30
        setCoords({ x, y })
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
        setIsHovered(false)
        setCoords({ x: 0, y: 0 })
    }

    const fetchPosts = () => {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;

        postService.getPosts(params).then((posts) => {
            if (posts) {
                const docs = posts.documents || [];
                setPosts(docs);
                // If database is completely empty and no filters are active, clear stale local recentlyViewed cache
                if (docs.length === 0 && !category && !search) {
                    localStorage.removeItem('recentlyViewed');
                    setRecentlyViewed([]);
                }
            }
        });
    }

    useEffect(() => {
        fetchPosts()
    }, [authStatus, category])

    const categoriesList = [
        "general", "technology", "react", "spring boot", "java", "devops", "docker", "ai", "comedy", "motivation", "travel", "others"
    ];

    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [bookmarksCount, setBookmarksCount] = useState(0);

    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setRecentlyViewed(history);
        } catch (e) {
            console.error('Error reading recentlyViewed', e);
        }

        if (authStatus) {
            postService.getBookmarks().then((res) => {
                if (res && res.documents) {
                    setBookmarksCount(res.documents.length);
                }
            }).catch((err) => console.error('Error fetching bookmarks count', err));
        }
    }, [authStatus]);

    // Extract unique real authors from fetched posts, sort by followers, limit to 4
    const communityAuthors = React.useMemo(() => {
        const authorMap = {};
        posts.forEach((p) => {
            const name = p.authorName || (p.userId === userData?.$id ? (userData?.name || 'Anil Kumar') : 'Anil Kumar');
            const authorUserId = p.userId || p.userid;
            if (!authorMap[name]) {
                authorMap[name] = { name, userId: authorUserId, count: 0, followerCount: 0 };
            }
            authorMap[name].count += 1;
        });

        let followsList = [];
        try {
            followsList = JSON.parse(localStorage.getItem('follows') || '[]');
        } catch (e) {
            console.error("Error reading follows in Home communityAuthors", e);
        }

        const list = Object.values(authorMap);
        list.forEach((author) => {
            const authorFollowers = followsList.filter(f => 
                (author.userId && String(f.followedId) === String(author.userId)) ||
                (author.name && f.followedName?.toLowerCase() === author.name.toLowerCase())
            );
            author.followerCount = authorFollowers.length;
        });

        return list.sort((a, b) => b.followerCount - a.followerCount).slice(0, 4);
    }, [posts, userData]);

    // ==========================================
    // PUBLIC HOME PAGE (BEFORE LOGIN)
    // ==========================================
    if (!authStatus) {
        return (
            <div className="w-full py-10 md:py-16 space-y-24">
                
                {/* ------------------------------------------------- */}
                {/* HERO SECTION (PRESERVED 100% UNCHANGED) */}
                {/* ------------------------------------------------- */}
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[50vh]">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-7 text-left space-y-6 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full w-fit uppercase tracking-wider">
                            ✨ Creative Writing Platform
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-850 dark:text-white">
                            Publish Your Passion. <br />
                            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 dark:from-purple-400 dark:via-pink-500 dark:to-rose-400 bg-clip-text text-transparent">
                                Share Your Stories.
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 dark:text-slate-400 leading-relaxed max-w-xl">
                            A modern, production-grade writing space built to help you publish, share, and bookmark articles, stories, comedy, and tech insights. Powered by Spring Boot and MySQL.
                        </p>
                        <div className="pt-4 flex flex-wrap items-center gap-4">
                            <Link 
                                to="/login"
                                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-650 hover:from-purple-700 hover:to-pink-750 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-purple-900/20 hover:cursor-pointer text-center"
                            >
                                Start Writing
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Interactive 3D Parallax Graphic */}
                    <div className="lg:col-span-5 flex items-center justify-center">
                        <div 
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-800/80 cursor-pointer bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"
                            style={{ perspective: '1000px' }}
                        >
                            <img 
                                src="/hero_graphic.png" 
                                alt="Megablog Hero" 
                                className="w-full h-full object-cover select-none pointer-events-none"
                                style={{
                                    transform: isHovered 
                                        ? `translate3d(${coords.x}px, ${coords.y}px, 0) rotateX(${-coords.y / 2}deg) rotateY(${coords.x / 2}deg) scale(1.05)` 
                                        : 'translate3d(0px, 0px, 0) scale(1)',
                                    transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 1. PLATFORM STATISTICS */}
                {/* ------------------------------------------------- */}
                <div className="max-w-6xl mx-auto px-4">
                    {(() => {
                        const verifiedAuthorsCount = new Set(posts.map(p => p.authorEmail?.toLowerCase() || p.userId)).size || 1;

                        return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { value: posts.length ? `${posts.length}` : '0', label: 'Articles Published', icon: '📝' },
                                    { value: `${verifiedAuthorsCount}`, label: 'Verified Authors', icon: '✍️' },
                                    { value: '12', label: 'Diverse Categories', icon: '📑' },
                                    { value: '5 Min', label: 'Avg Reading Time', icon: '⏱️' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-6 rounded-2xl text-center space-y-2 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md">
                                        <span className="text-2xl mb-1 block">{stat.icon}</span>
                                        <h3 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                            {stat.value}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* ------------------------------------------------- */}
                {/* 2. LATEST COMMUNITY ARTICLES */}
                {/* ------------------------------------------------- */}
                <div className="max-w-6xl mx-auto px-4 space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800/80 pb-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider mb-1">
                                🔥 Community Insights
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Latest Articles</h2>
                        </div>
                        <Link 
                            to="/login" 
                            className="px-5 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold rounded-xl text-xs transition-colors duration-200 border border-purple-500/20 flex items-center gap-2"
                        >
                            <span>Sign In to Read Full Articles</span>
                            <span>→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.length === 0 ? (
                            <div className="col-span-full py-12 text-center bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">✍️</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">No published articles yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    Join the MegaBlog community to publish your first article.
                                </p>
                            </div>
                        ) : (
                            posts.map((blog) => (
                                <PostCard key={blog.$id || blog.id} linkTo="/login" {...blog} />
                            ))
                        )}
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 3. WHY CHOOSE MEGABLOG (COMPARISON & FEATURES MATRIX) */}
                {/* ------------------------------------------------- */}
                <div className="max-w-5xl mx-auto px-4 space-y-8 text-center">
                    <div className="space-y-2">
                        <div className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                            ✨ Core Advantages
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Why Creators Choose MegaBlog</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                            Built from the ground up for developer ergonomics, fullstack security, and modern reader experiences.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800 p-8 sm:p-10 rounded-3xl backdrop-blur-sm shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                        {[
                            'Google OAuth Single Sign-On',
                            'Secure Local JWT Authentication',
                            'TinyMCE Rich Text Editor',
                            'Fast Keyword & Category Search',
                            'Interactive Comments & Discussions',
                            'Upvotes & Real-Time Likes',
                            'Bookmark Articles to Personal Library',
                            'Fluid Dark Theme & Outfit Typography',
                            'Spring Boot 3 RESTful Backend',
                            'MySQL Relational Data Persistence',
                            'Production-Grade React Architecture',
                            'Author Follow & Profile Features'
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/10 dark:border-purple-800/30 hover:border-purple-500/30 transition duration-200">
                                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">✓</span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-gray-200">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 4. CALL TO ACTION CARD */}
                {/* ------------------------------------------------- */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 p-10 md:p-14 text-center space-y-6 shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                            <span className="text-3xl block">🚀</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                Ready to share your perspective with the world?
                            </h2>
                            <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                                Join hundreds of developers and writers publishing tech guides, stories, and insights on MegaBlog today.
                            </p>
                            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                                <Link 
                                    to="/signup" 
                                    className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                                >
                                    Create Free Account
                                </Link>
                                <Link 
                                    to="/login" 
                                    className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    // ==========================================
    // AUTHENTICATED DASHBOARD (AFTER LOGIN)
    // ==========================================
    return (
        <div className="w-full py-8 space-y-10">
            <Container>
                
                {/* ------------------------------------------------- */}
                {/* 1. WELCOME BANNER */}
                {/* ------------------------------------------------- */}
                <div className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm shadow-sm">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">
                            👋 Welcome Back
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            Hello, <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 bg-clip-text text-transparent">{userData?.name || 'Anil Kumar'}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Here is what's happening across your MegaBlog publishing workspace today.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => navigate('/add-post')}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-900/20 flex items-center gap-1.5 hover:cursor-pointer"
                        >
                            Create Blog
                        </button>
                        <button 
                            onClick={() => navigate('/bookmarks')}
                            className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 text-slate-800 dark:text-gray-300 font-semibold rounded-xl text-xs transition hover:cursor-pointer"
                        >
                            Bookmarks
                        </button>
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 2. DASHBOARD STATS */}
                {/* ------------------------------------------------- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {(() => {
                        const myBlogsCount = posts.filter((p) => String(p.userId || p.userid) === String(userData?.$id || userData?.id)).length;
                        return [
                            { title: 'My Blogs', value: myBlogsCount },
                            { title: 'Bookmarks', value: bookmarksCount },
                            { title: 'Likes Received', value: '0' },
                            { title: 'Total Articles', value: posts.length }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-5 rounded-2xl text-left space-y-1">
                                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                                    <span>{stat.title}</span>
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                        ));
                    })()}
                </div>

                {/* ------------------------------------------------- */}
                {/* 3. SEARCH & CATEGORY FILTER BAR */}
                {/* ------------------------------------------------- */}
                <div className="pt-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#0f172a]/40 p-5 rounded-2xl border border-gray-250 dark:border-gray-800/80 shadow-sm">
                        <div className="flex-1 min-w-[240px] flex gap-2.5">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:border-purple-500"
                            />
                            <button 
                                onClick={fetchPosts}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition hover:cursor-pointer"
                            >
                                Search
                            </button>
                        </div>

                        {/* Category Dropdown */}
                        <div className="flex items-center gap-3 relative">
                            <label className="text-gray-500 dark:text-gray-400 text-xs font-medium">Category:</label>
                            <div className="relative min-w-[160px]">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-200 text-xs text-left hover:cursor-pointer"
                                >
                                    <span className="capitalize">{category || 'All Categories'}</span>
                                    <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                                        <ul className="absolute z-20 mt-1.5 w-full bg-white dark:bg-[#030712] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                            {[{ value: '', label: 'All Categories' }, ...categoriesList.map(c => ({ value: c.toLowerCase(), label: c }))].map((opt) => (
                                                <li key={opt.value}>
                                                    <button
                                                        onClick={() => {
                                                            setCategory(opt.value);
                                                            setDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-xs capitalize hover:cursor-pointer ${category === opt.value ? 'bg-purple-500/10 text-purple-400 font-bold' : 'text-gray-300 hover:bg-gray-900'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 4. LATEST REAL COMMUNITY ARTICLES */}
                {/* ------------------------------------------------- */}
                <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800/80 pb-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>⚡ Latest Articles</span>
                        </h2>
                    </div>

                    {/* Real Posts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.$id || post.id} {...post} />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">📚</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">No articles published yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Be the first creator to share your knowledge with the MegaBlog community.
                                </p>
                                <button onClick={() => navigate('/add-post')} className="mt-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition hover:cursor-pointer">
                                    Write an Article
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 5. BROWSE CATEGORIES CHIPS */}
                {/* ------------------------------------------------- */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Browse Categories</h2>
                    <div className="flex flex-wrap gap-2">
                        {categoriesList.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat.toLowerCase())}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition hover:cursor-pointer ${category === cat.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#0f172a]/40 border border-gray-200 dark:border-gray-800 text-gray-300 hover:text-purple-400'}`}
                            >
                                #{cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* 6. REAL COMMUNITY AUTHORS */}
                {/* ------------------------------------------------- */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top Community Authors</h2>
                    {communityAuthors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {communityAuthors.map((author, idx) => (
                                <Link 
                                    to={`/profile/${author.userId}`} 
                                    key={idx} 
                                    className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-5 rounded-2xl flex items-center gap-4 hover:border-purple-500/40 hover:cursor-pointer transition duration-150"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-lg shrink-0">
                                        {author.name.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{author.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {author.followerCount} {author.followerCount === 1 ? 'Follower' : 'Followers'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500 dark:text-gray-400">
                            No community authors yet.
                        </div>
                    )}
                </div>

                {/* ------------------------------------------------- */}
                {/* 7. REAL RECENTLY VIEWED HISTORY */}
                {/* ------------------------------------------------- */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recently Viewed</h2>
                    {recentlyViewed.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentlyViewed.map((blog) => (
                                <Link 
                                    to={`/post/${blog.$id || blog.id}`} 
                                    key={`history-${blog.$id || blog.id}`} 
                                    className="bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl flex gap-4 items-center hover:border-purple-500/50 transition duration-200"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 text-xl flex items-center justify-center shrink-0">
                                        📖
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <span className="text-[10px] uppercase font-bold text-purple-400">{blog.category || 'General'}</span>
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-sm">{blog.title}</h3>
                                        <p className="text-[11px] text-gray-400">Read recently</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-2xl text-center text-xs text-gray-500 dark:text-gray-400">
                            No recently viewed articles.
                        </div>
                    )}
                </div>

            </Container>
        </div>
    )
}

export default Home;