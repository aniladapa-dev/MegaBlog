import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Container, PostCard } from '../components'
import postService from '../services/config'
import authService from '../services/auth'
import { login, logout } from '../store/authSlice'

function Profile() {
    const { userId } = useParams()
    const userData = useSelector((state) => state.auth.userData)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isOwnProfile = !userId || String(userId) === String(userData?.$id || userData?.id)

    const [profileUser, setProfileUser] = useState(isOwnProfile ? userData : null)
    const [activeTab, setActiveTab] = useState('articles')
    const [userPosts, setUserPosts] = useState([])
    const [bookmarkedPosts, setBookmarkedPosts] = useState([])
    const [loading, setLoading] = useState(true)

    // Edit Profile Form State
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [updating, setUpdating] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Followers & Following state
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [isFollowed, setIsFollowed] = useState(false)

    // Sync form name when profile user name changes
    useEffect(() => {
        if (profileUser?.name) {
            setName(profileUser.name)
        }
    }, [profileUser])

    // Load profile user details (if other user)
    useEffect(() => {
        const loadProfileDetails = async () => {
            if (isOwnProfile) {
                setProfileUser(userData)
            } else if (userId) {
                setLoading(true)
                try {
                    const user = await authService.getUserProfile(userId)
                    if (user) {
                        setProfileUser(user)
                    } else {
                        navigate('/')
                    }
                } catch (e) {
                    console.error('Error loading author profile', e)
                } finally {
                    setLoading(false)
                }
            }
        }
        loadProfileDetails()
    }, [userId, isOwnProfile, userData, navigate])

    // Fetch user-specific posts & bookmarks
    useEffect(() => {
        const fetchUserData = async () => {
            const targetProfileUserId = isOwnProfile ? (userData?.$id || userData?.id) : userId
            if (!targetProfileUserId) return

            setLoading(true)
            try {
                // Fetch user posts
                const allPosts = await postService.getPosts({})
                if (allPosts && allPosts.documents) {
                    const myPosts = allPosts.documents.filter(
                        (p) => String(p.userId || p.userid) === String(targetProfileUserId)
                    )
                    setUserPosts(myPosts)
                }

                // If viewing own profile, fetch bookmarks
                if (isOwnProfile) {
                    const bookmarked = await postService.getBookmarks()
                    if (bookmarked && bookmarked.documents) {
                        setBookmarkedPosts(bookmarked.documents)
                    }
                }
            } catch (e) {
                console.error('Error fetching profile data', e)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [userData, userId, isOwnProfile])

    // Fetch followers and following dynamically based on profileUser details from global follows key
    useEffect(() => {
        const calculateFollows = () => {
            const targetProfileUserId = isOwnProfile ? (userData?.$id || userData?.id) : userId;
            const targetProfileUserEmail = profileUser?.email;

            if (!targetProfileUserId && !targetProfileUserEmail) return;

            try {
                const allFollows = JSON.parse(localStorage.getItem('follows') || '[]');
                
                // Followers: people who followed this profile user
                const userFollowers = allFollows.filter(f => 
                    (targetProfileUserId && String(f.followedId) === String(targetProfileUserId)) || 
                    (targetProfileUserEmail && f.followedEmail?.toLowerCase() === targetProfileUserEmail.toLowerCase())
                );
                setFollowers(userFollowers);

                // Following: people followed by this profile user
                const userFollowing = allFollows.filter(f => 
                    (targetProfileUserId && String(f.followerId) === String(targetProfileUserId)) || 
                    (targetProfileUserEmail && f.followerEmail?.toLowerCase() === targetProfileUserEmail.toLowerCase())
                );
                setFollowing(userFollowing);
            } catch (err) {
                console.error('Error calculating follows in Profile', err);
            }
        };

        calculateFollows();
    }, [userData, userId, isOwnProfile, profileUser]);

    // Check followed status for public author
    useEffect(() => {
        if (!isOwnProfile && profileUser) {
            const authorId = profileUser.email || String(profileUser.id);
            try {
                const followedList = JSON.parse(localStorage.getItem('follows') || '[]');
                const found = followedList.some(
                    (f) =>
                        (String(f.followerId) === String(userData?.$id || userData?.id) ||
                            f.followerEmail?.toLowerCase() === userData?.email?.toLowerCase()) &&
                        (String(f.followedId) === String(profileUser.id) ||
                            f.followedEmail?.toLowerCase() === profileUser.email?.toLowerCase())
                );
                setIsFollowed(found)
            } catch (e) {
                console.error('Error reading followed status', e)
            }
        }
    }, [profileUser, isOwnProfile, userData])

    const handleToggleFollowProfile = () => {
        if (!userData) {
            alert("Please log in to follow authors!")
            return
        }
        const followerId = String(userData.$id || userData.id);
        const followerEmail = userData.email;
        const followerName = userData.name || "Anil";

        const followedId = String(profileUser?.id);
        const followedEmail = profileUser?.email;
        const followedName = profileUser?.name || "Author";

        if (!followedId && !followedEmail) return

        try {
            const existing = JSON.parse(localStorage.getItem('follows') || '[]');
            let updated = []
            if (isFollowed) {
                // Unfollow
                updated = existing.filter(
                    (f) =>
                        !(
                            (String(f.followerId) === followerId ||
                                f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()) &&
                            (String(f.followedId) === followedId ||
                                f.followedEmail?.toLowerCase() === followedEmail?.toLowerCase())
                        )
                )
                setIsFollowed(false)
            } else {
                // Follow
                const newFollowObj = {
                    followerId,
                    followerEmail,
                    followerName,
                    followedId,
                    followedEmail,
                    followedName,
                    followedAt: new Date().toISOString()
                }
                updated = [
                    newFollowObj,
                    ...existing.filter(
                        (f) =>
                            !(
                                (String(f.followerId) === followerId ||
                                    f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()) &&
                                (String(f.followedId) === followedId ||
                                    f.followedEmail?.toLowerCase() === followedEmail?.toLowerCase())
                            )
                    )
                ]
                setIsFollowed(true)
            }
            localStorage.setItem('follows', JSON.stringify(updated))

            // Sync followedAuthors for backward compatibility
            const followedAuthorsList = updated
                .filter(
                    (f) =>
                        String(f.followerId) === followerId ||
                        f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()
                )
                .map((f) => ({
                    id: f.followedId || f.followedEmail,
                    name: f.followedName,
                    email: f.followedEmail,
                    followedAt: f.followedAt
                }));
            localStorage.setItem('followedAuthors', JSON.stringify(followedAuthorsList));

            // Trigger re-render of follows stats
            const targetProfileUserEmail = profileUser?.email;
            const targetProfileUserId = isOwnProfile ? (userData?.$id || userData?.id) : userId;
            const userFollowers = updated.filter(f => 
                (targetProfileUserId && String(f.followedId) === String(targetProfileUserId)) || 
                (targetProfileUserEmail && f.followedEmail?.toLowerCase() === targetProfileUserEmail.toLowerCase())
            );
            setFollowers(userFollowers);
        } catch (e) {
            console.error('Error updating followed status on Profile', e)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setUpdating(true)
        setMessage({ type: '', text: '' })

        try {
            const updatedUser = await authService.updateProfile({ name, password })
            if (updatedUser) {
                dispatch(login({ userData: updatedUser }))
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                setPassword('')
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        } finally {
            setUpdating(false)
        }
    }

    const handleUnfollow = (authorId) => {
        const followerId = String(userData?.$id || userData?.id);
        const followerEmail = userData?.email;
        if (!followerId && !followerEmail) return;

        try {
            const existing = JSON.parse(localStorage.getItem('follows') || '[]');
            const updated = existing.filter(
                (f) =>
                    !(
                        (String(f.followerId) === followerId ||
                            f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()) &&
                        (String(f.followedId) === String(authorId) ||
                            f.followedEmail?.toLowerCase() === String(authorId).toLowerCase())
                    )
            );
            localStorage.setItem('follows', JSON.stringify(updated));

            // Sync following state variables
            const userFollowing = updated.filter(f => 
                (followerId && String(f.followerId) === String(followerId)) || 
                (followerEmail && f.followerEmail?.toLowerCase() === followerEmail.toLowerCase())
            );
            setFollowing(userFollowing);

            const followedAuthorsList = updated
                .filter(
                    (f) =>
                        String(f.followerId) === followerId ||
                        f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()
                )
                .map((f) => ({
                    id: f.followedId || f.followedEmail,
                    name: f.followedName,
                    email: f.followedEmail,
                    followedAt: f.followedAt
                }));
            localStorage.setItem('followedAuthors', JSON.stringify(followedAuthorsList));
        } catch (e) {
            console.error('Error unfollowing author', e)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
        );
        if (!confirmDelete) return;

        try {
            // 1. Call Backend to delete all posts, comments, likes, bookmarks, and user record
            await authService.deleteAccount();

            // 2. Clear follow lists from localStorage
            const currentUserId = String(userData?.$id || userData?.id);
            const currentUserEmail = userData?.email;

            try {
                const allFollows = JSON.parse(localStorage.getItem('follows') || '[]');
                // Filter out any relationship where the deleted user is the follower or the followed
                const updatedFollows = allFollows.filter(f => 
                    !(String(f.followerId) === currentUserId ||
                      f.followerEmail?.toLowerCase() === currentUserEmail?.toLowerCase() ||
                      String(f.followedId) === currentUserId ||
                      f.followedEmail?.toLowerCase() === currentUserEmail?.toLowerCase())
                );
                localStorage.setItem('follows', JSON.stringify(updatedFollows));
            } catch (err) {
                console.error("Error cleaning up follows in localStorage", err);
            }

            try {
                const followedAuthors = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
                const updatedFollowedAuthors = followedAuthors.filter(a => 
                    !(String(a.id) === currentUserId || a.email?.toLowerCase() === currentUserEmail?.toLowerCase())
                );
                localStorage.setItem('followedAuthors', JSON.stringify(updatedFollowedAuthors));
            } catch (err) {
                console.error("Error cleaning up followedAuthors", err);
            }

            // 3. Clear session storage token, dispatch logout, and redirect
            sessionStorage.removeItem("token");
            dispatch(logout());
            navigate("/");
            alert("Your account has been deleted successfully.");
        } catch (error) {
            console.error("Error deleting account:", error);
            alert(error.message || "Failed to delete account. Please try again.");
        }
    };

    const userInitial = profileUser?.name ? profileUser.name.charAt(0).toUpperCase() : 'U'

    // Tabs filtering
    const tabsList = isOwnProfile ? [
        { id: 'articles', label: 'My Articles', count: userPosts.length },
        { id: 'bookmarks', label: 'Bookmarks', count: bookmarkedPosts.length },
        { id: 'followers', label: 'Followers', count: followers.length },
        { id: 'following', label: 'Following', count: following.length },
        { id: 'settings', label: 'Account Settings' }
    ] : [
        { id: 'articles', label: 'Articles', count: userPosts.length },
        { id: 'followers', label: 'Followers', count: followers.length },
        { id: 'following', label: 'Following', count: following.length }
    ]

    return (
        <div className="w-full py-8">
            <Container>
                {/* ------------------------------------------------- */}
                {/* PROFILE HEADER BANNER */}
                {/* ------------------------------------------------- */}
                <div className="bg-white dark:bg-[#0f172a]/40 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 rounded-3xl mb-8 shadow-md backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 text-white font-extrabold text-3xl flex items-center justify-center shadow-xl shadow-purple-900/20 shrink-0">
                                {userInitial}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {profileUser?.name || 'MegaBlog Creator'}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {profileUser?.email || 'creator@megablog.com'}
                                </p>
                                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
                                        Verified Author
                                    </span>
                                    {!isOwnProfile && (
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
                                            Community Member
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons & Stats Badges */}
                        <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                            {!isOwnProfile && (
                                <button
                                    onClick={handleToggleFollowProfile}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:cursor-pointer shadow-md ${
                                        isFollowed 
                                            ? 'bg-gray-200 dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700' 
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                                >
                                    {isFollowed ? '✓ Following' : '+ Follow Author'}
                                </button>
                            )}

                            <div className={`grid ${isOwnProfile ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center`}>
                                <div className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-2xl min-w-[75px]">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">{userPosts.length}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Posts</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-2xl min-w-[75px]">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">{followers.length}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Followers</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-2xl min-w-[75px]">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">{following.length}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Following</span>
                                </div>
                                {isOwnProfile && (
                                    <div className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-2xl min-w-[75px]">
                                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white block">{bookmarkedPosts.length}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Saved</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------- */}
                {/* NAVIGATION TABS */}
                {/* ------------------------------------------------- */}
                {tabsList.length > 1 && (
                    <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto gap-2">
                        {tabsList.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-4 text-[13px] md:text-sm font-bold transition duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 hover:cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* ------------------------------------------------- */}
                {/* TAB CONTENT */}
                {/* ------------------------------------------------- */}

                {/* TAB 1: ARTICLES */}
                {activeTab === 'articles' && (
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-xs text-gray-400">Loading articles...</p>
                        ) : userPosts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">📝</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No published articles yet</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    This author hasn't published any articles yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {userPosts.map((post) => (
                                    <PostCard key={post.$id || post.id} {...post} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: BOOKMARKS */}
                {isOwnProfile && activeTab === 'bookmarks' && (
                    <div className="space-y-6">
                        {bookmarkedPosts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">🔖</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No bookmarks saved yet</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    Bookmark articles while reading to quickly access them later.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {bookmarkedPosts.map((post) => (
                                    <PostCard key={`bm-${post.$id || post.id}`} {...post} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FOLLOWERS */}
                {activeTab === 'followers' && (
                    <div>
                        {followers.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">👥</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No followers yet</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    When other members follow this account, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                                {followers.map((f, i) => (
                                    <div key={i} className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                                        <Link to={`/profile/${f.followerId}`} className="flex items-center gap-3 min-w-0 hover:opacity-85 transition duration-150 hover:cursor-pointer">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-base shrink-0">
                                                {f.followerName ? f.followerName.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{f.followerName || 'Author'}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.followerEmail}</p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: FOLLOWING */}
                {activeTab === 'following' && (
                    <div>
                        {following.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800 rounded-3xl space-y-3">
                                <span className="text-4xl block">➕</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Not following anyone yet</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                    Authors followed by this account will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                                {following.map((f, i) => (
                                    <div key={i} className="bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                                        <Link to={`/profile/${f.followedId}`} className="flex items-center gap-3 min-w-0 hover:opacity-85 transition duration-150 hover:cursor-pointer">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-base shrink-0">
                                                {f.followedName ? f.followedName.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{f.followedName || 'Author'}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.followedEmail}</p>
                                            </div>
                                        </Link>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => handleUnfollow(f.followedId || f.followedEmail)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 transition hover:cursor-pointer shrink-0"
                                            >
                                                Unfollow
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: EDIT PROFILE SETTINGS */}
                {isOwnProfile && activeTab === 'settings' && (
                    <div className="max-w-xl mx-auto bg-white dark:bg-[#0f172a]/30 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Edit Account Information</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                            Update your public display name or set a new password.
                        </p>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-xs mb-6 font-semibold ${
                                message.type === 'success' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address (Read only)</label>
                                <input
                                    type="email"
                                    value={profileUser?.email || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password (Leave blank to keep current)</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950/70 border border-gray-300 dark:border-gray-800 rounded-xl text-sm text-slate-800 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl transition duration-200 shadow-md shadow-purple-900/20 hover:cursor-pointer disabled:opacity-50"
                            >
                                {updating ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                        </form>

                        {/* Danger Zone */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-rose-500 mb-2">Danger Zone</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
                                Once you delete your account, there is no going back. All your articles, bookmarks, likes, comments, and follower connections will be permanently removed.
                            </p>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="w-full py-3 bg-transparent hover:bg-rose-600 border border-rose-500 hover:border-rose-600 text-rose-500 hover:text-white font-bold text-xs rounded-xl transition duration-200 hover:cursor-pointer"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

            </Container>
        </div>
    )
}

export default Profile
