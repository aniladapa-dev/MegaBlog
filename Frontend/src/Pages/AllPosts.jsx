import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { Container, PostCard } from "../components"
import postService from "../services/config"

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchParams] = useSearchParams()

    const isMyArticles = searchParams.get("filter") === "my";
    const userData = useSelector((state) => state.auth.userData);

    const categoriesList = [
        "general", "technology", "react", "spring boot", "java", "devops", "docker", "ai", "comedy", "motivation", "travel", "others"
    ];

    const fetchPosts = () => {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;

        postService.getPosts(params).then((postsData) => {
            if (postsData) {
                setPosts(postsData.documents || [])
            }
        })
    }

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const displayPosts = isMyArticles
        ? posts.filter((p) => String(p.userId || p.userid) === String(userData?.$id))
        : posts;

    return (
        <div className="w-full py-8">
            <Container>
                {/* Header Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {isMyArticles ? "My Articles" : "All Articles"}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isMyArticles ? "Articles written and published by you" : "Browse all community articles across topics"}
                    </p>
                </div>

                {/* Search and Filter Controls */}
                <div className="w-full flex flex-wrap gap-4 items-center justify-between mb-8 bg-white dark:bg-[#0f172a]/40 p-5 rounded-2xl border border-gray-250 dark:border-gray-800/80 shadow-sm dark:shadow-md backdrop-blur-sm transition-colors duration-250">
                    <div className="flex-1 min-w-[280px] flex gap-2.5">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                        />
                        <button 
                            onClick={fetchPosts}
                            className="bg-purple-600 hover:bg-purple-700 hover:cursor-pointer text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-purple-900/10 text-xs"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <label className="text-gray-500 dark:text-gray-400 text-sm font-medium">Category:</label>
                        <div className="relative min-w-[160px]">
                            {/* Trigger */}
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-purple-500 transition-all duration-200 text-xs hover:cursor-pointer text-left capitalize"
                            >
                                <span>{category || 'All Categories'}</span>
                                <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                                    
                                    <ul className="absolute z-20 mt-1.5 w-full bg-white dark:bg-[#030712] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-200 max-h-60 overflow-y-auto">
                                        {[{ value: '', label: 'All Categories' }, ...categoriesList.map(c => ({ value: c.toLowerCase(), label: c }))].map((opt) => (
                                            <li key={opt.value}>
                                                <button
                                                    onClick={() => {
                                                        setCategory(opt.value);
                                                        setDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs transition-colors duration-150 hover:cursor-pointer capitalize
                                                        ${category === opt.value 
                                                            ? 'bg-purple-500/10 text-purple-650 dark:text-purple-400 font-semibold' 
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/60'
                                                        }`}
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

                {displayPosts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl text-gray-500 dark:text-gray-400 text-sm transition-colors duration-250 space-y-3">
                        <span className="text-3xl block">📝</span>
                        <p>{isMyArticles ? "You haven't written any articles yet." : "No posts found matching your criteria."}</p>
                        {isMyArticles && (
                            <Link to="/add-post" className="inline-block px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition">
                                Create an Article
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayPosts.map((post) => (
                            <PostCard key={post.$id || post.id} {...post}/>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default AllPosts;