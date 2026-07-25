// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import appwriteService from "../appwrite/config";
// import { Button, Container } from "../components";
// import parse from "html-react-parser";
// import { useSelector } from "react-redux";



// export default function Post() {
//     const [post, setPost] = useState(null);
//     const { slug } = useParams();
//     const navigate = useNavigate();

//     const userData = useSelector((state) => state.auth.userData);

//     const isAuthor = post && userData ? post.userid === userData.$id : false;

//     useEffect(() => {
//         if (slug) {
//             appwriteService.getPost(slug).then((post) => {
//                 if (post) setPost(post);
//                 else navigate("/");
//             });
//         } else navigate("/");
//     }, [slug, navigate]);

//     if (!post) {
//         return (
//           <div className="text-center py-10 text-gray-400">
//             Loading post...
//           </div>
//         );
//     }

//         // 1️⃣ Generate preview URL
//     const previewUrl = post?.featuredImage
//     ? appwriteService.getFilePreview(post.featuredImage)
//     : null;

//     // 2️⃣ Debug logs
//     console.log("FEATURED IMAGE ID:", post?.featuredImage);
//     console.log("PREVIEW URL:", previewUrl);


//     // console.log("POST OBJECT:", post);
//     // console.log("POST KEYS:", Object.keys(post));


//     const deletePost = () => {
//         appwriteService.deletePost(post.$id).then((status) => {
//             if (status) {
//                 appwriteService.deleteFile(post.featuredImage);
//                 navigate("/");
//             }
//         });
//     };

//     // console.log("FEATURED IMAGE VALUE:", post.featuredImage);
//     // console.log("FEATURED IMAGE TYPE:", typeof post.featuredImage);

//     // console.log("FEATURED IMAGE ID:", post.featuredImage);
//     // console.log("IMAGE URL:", appwriteService.getFilePreview(post.featuredImage));

   



//     return post ? (
//         <div className="py-8">
//             <Container>
//             <div className="w-full mb-6 relative overflow-hidden rounded-xl">
//             {previewUrl ? (
//                 <img
//                     src={previewUrl}
//                     alt={post.title}
//                     className="rounded-xl border"
//                 />
//             ) : (
//                 <p className="text-gray-400">No preview URL</p>
//             )}


//             {isAuthor && (
//                 <div className="absolute top-4 right-4 flex gap-2">
//                 <Link to={`/edit-post/${post.$id}`}>
//                 <Button bgColor="bg-green-500">Edit</Button>
//                     </Link>
//                     <Button bgColor="bg-red-500" onClick={deletePost}>
//                         Delete
//                     </Button>
//                     </div>
//                 )}
//                 </div>

//                 <div className="w-full mb-6">
//                     <h1 className="text-2xl font-bold">{post.title}</h1>
//                 </div>
//                 <div className="browser-css">
//                 {post.content ? parse(String(post.content)) : null}
//                 </div>

//             </Container>
//         </div>
//     ) : null;


    
// }


import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [bookmarked, setBookmarked] = useState(false);
    const [following, setFollowing] = useState(false);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = Boolean(
        post && userData && (
            (post.authorEmail && userData.email && post.authorEmail.toLowerCase() === userData.email.toLowerCase()) ||
            String(post.userId || post.userid) === String(userData.$id || userData.id)
        )
    );

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((dbPost) => {
                if (dbPost) {
                    setPost(dbPost);

                    // Save to recentlyViewed in localStorage
                    try {
                        const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                        const filtered = existing.filter((item) => item.$id !== dbPost.$id);
                        const updated = [dbPost, ...filtered].slice(0, 4);
                        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                    } catch (e) {
                        console.error('Error saving to recentlyViewed', e);
                    }

                    const targetId = dbPost.id || dbPost.slug || dbPost.$id || slug;

                    // Fetch likes count and user liked status
                    appwriteService.getLikeStatus(targetId).then((status) => {
                        if (status) {
                            setLiked(status.liked);
                            setLikesCount(status.likesCount);
                        }
                    });
                    // Fetch comments
                    appwriteService.getComments(targetId).then((commentsList) => {
                        if (Array.isArray(commentsList)) {
                            setComments(commentsList);
                        }
                    });
                    // Fetch bookmark status
                    appwriteService.getBookmarkStatus(targetId).then((status) => {
                        if (status) {
                            setBookmarked(status.bookmarked);
                        }
                    });

                    // Check followed state in global follows array
                    if (dbPost && userData) {
                        try {
                            const followsList = JSON.parse(localStorage.getItem('follows') || '[]');
                            const isFollowed = followsList.some(
                                (f) =>
                                    (String(f.followerId) === String(userData.$id || userData.id) ||
                                        f.followerEmail?.toLowerCase() === userData.email?.toLowerCase()) &&
                                    (String(f.followedId) === String(dbPost.userId || dbPost.userid) ||
                                        f.followedEmail?.toLowerCase() === dbPost.authorEmail?.toLowerCase())
                            );
                            setFollowing(isFollowed);
                        } catch (e) {
                            console.error('Error reading follows from localStorage', e);
                        }
                    }
                }
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate, userData]);

    const handleToggleFollow = () => {
        if (!userData) {
            alert("Please log in to follow authors!");
            return;
        }
        if (isAuthor) {
            alert("You cannot follow yourself!");
            return;
        }

        const followerId = String(userData.$id || userData.id);
        const followerEmail = userData.email;
        const followerName = userData.name || "Anil";

        const followedId = String(post?.userId || post?.userid);
        const followedEmail = post?.authorEmail;
        const followedName = authorName;

        if (!followedId && !followedEmail) return;

        try {
            const existing = JSON.parse(localStorage.getItem('follows') || '[]');
            let updated = [];
            if (following) {
                // Unfollow
                updated = existing.filter(
                    (f) =>
                        !(
                            (String(f.followerId) === followerId ||
                                f.followerEmail?.toLowerCase() === followerEmail?.toLowerCase()) &&
                            (String(f.followedId) === followedId ||
                                f.followedEmail?.toLowerCase() === followedEmail?.toLowerCase())
                        )
                );
                setFollowing(false);
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
                };
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
                ];
                setFollowing(true);
            }
            localStorage.setItem('follows', JSON.stringify(updated));

            // Also sync followedAuthors for backward compatibility
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
            console.error('Error updating follows list', e);
        }
    };

    const deletePost = () => {
        const targetId = post?.id || post?.slug || post?.$id || slug;
        appwriteService.deletePost(targetId).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    const handleLike = () => {
        if (!userData) {
            alert("Please log in to like this post!");
            return;
        }
        const targetId = post?.id || post?.slug || post?.$id || slug;
        appwriteService.toggleLike(targetId).then((status) => {
            if (status) {
                setLiked(status.liked);
                setLikesCount(status.likesCount);
            }
        });
    };

    const handleBookmark = () => {
        if (!userData) {
            alert("Please log in to bookmark this post!");
            return;
        }
        const targetId = post?.id || post?.slug || post?.$id || slug;
        appwriteService.toggleBookmark(targetId).then((status) => {
            if (status) {
                setBookmarked(status.bookmarked);
            }
        });
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!userData) {
            alert("Please log in to write comments!");
            return;
        }
        if (!commentInput.trim()) return;

        const targetId = post?.id || post?.slug || post?.$id || slug;
        appwriteService.addComment(targetId, commentInput).then((newComment) => {
            if (newComment) {
                setComments((prev) => [newComment, ...prev]);
                setCommentInput("");
            }
        });
    };

    const handleDeleteComment = (commentId) => {
        if (!userData) return;
        if (window.confirm("Are you sure you want to delete this comment?")) {
            appwriteService.deleteComment(commentId).then((success) => {
                if (success) {
                    setComments((prev) => prev.filter((c) => c.id !== commentId));
                }
            });
        }
    };

    const authorName = post?.authorName || (post?.userId === userData?.$id ? userData?.name : 'Author');
    const authorEmail = post?.authorEmail || (post?.userId === userData?.$id ? userData?.email : '');
    const authorInitial = authorName ? authorName.charAt(0).toUpperCase() : 'A';

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex justify-center mb-6 relative border border-gray-800 rounded-2xl p-3 bg-gray-950/40 shadow-lg">
                    <img
                        src={appwriteService.getFileView(post.featuredImage)}
                        alt={post.title}
                        className="rounded-xl max-h-[400px] object-cover"
                    />

                    {isAuthor && (
                        <div className="absolute right-6 top-6 flex gap-2">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-md rounded-xl" className="font-semibold px-5 py-2">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition-all shadow-md rounded-xl" className="font-semibold px-5 py-2" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="w-full mb-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{post.title}</h1>
                        {post.category && (
                            <span className="bg-purple-600/90 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                {post.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Author Card & Follow Section */}
                <div className="w-full bg-white dark:bg-[#0f172a]/40 border border-gray-200 dark:border-gray-800/80 p-4 rounded-2xl mb-6 flex items-center justify-between gap-4 backdrop-blur-sm shadow-sm">
                    <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 hover:opacity-80 transition duration-200 hover:cursor-pointer">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                            {authorInitial}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                                {authorName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {authorEmail ? `${authorEmail} • ` : ''}Author
                            </p>
                        </div>
                    </Link>
                    {!isAuthor ? (
                        <button
                            onClick={handleToggleFollow}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:cursor-pointer shadow-sm ${
                                following 
                                    ? 'bg-gray-200 dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                            {following ? '✓ Following' : '+ Follow Author'}
                        </button>
                    ) : (
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            You (Author)
                        </span>
                    )}
                </div>

                {/* Interactive Action Bar */}
                <div className="w-full flex items-center gap-6 py-3 border-t border-b border-gray-800 mb-8 text-gray-400">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-gray-200/50 dark:hover:bg-gray-900/60 hover:text-gray-850 dark:hover:text-gray-200 hover:cursor-pointer ${liked ? 'text-rose-500 font-bold bg-rose-500/10 dark:bg-rose-950/20' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
                        <span className="text-sm font-semibold">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                    <button 
                        onClick={handleBookmark}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-gray-200/50 dark:hover:bg-gray-900/60 hover:text-gray-850 dark:hover:text-gray-200 hover:cursor-pointer ${bookmarked ? 'text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 dark:bg-purple-950/20' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {bookmarked ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                            </svg>
                        )}
                        <span className="text-sm font-semibold">{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                </div>

                <div className="browser-css text-slate-800 dark:text-gray-200 leading-relaxed mb-12 text-lg">
                    {parse(post.content)}
                </div>

                {/* Comments Section */}
                <div className="w-full border-t border-gray-250 dark:border-gray-800 pt-8 mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Comments ({comments.length})</h2>

                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className="mb-8">
                        <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Write a comment..."
                            rows="4"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-950/70 border border-gray-250 dark:border-gray-800 rounded-xl text-slate-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-200 text-sm"
                        ></textarea>
                        <button
                            type="submit"
                            className="mt-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl transition duration-200 hover:cursor-pointer shadow-md shadow-purple-900/10"
                        >
                            Post Comment
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => {
                                const canDelete = userData && (
                                    String(comment.userId) === String(userData.$id) || 
                                    String(post.userId) === String(userData.$id)
                                );

                                return (
                                    <div key={comment.id} className="bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-5 flex justify-between items-start shadow-sm backdrop-blur-sm transition-colors duration-250">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-semibold text-slate-800 dark:text-white">{comment.userName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-slate-650 dark:text-gray-300 text-sm whitespace-pre-line leading-relaxed">{comment.content}</p>
                                        </div>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-rose-600 dark:text-rose-400 hover:text-rose-500 text-xs font-semibold transition duration-200 ml-4 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 hover:cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}