import React, { useState, useEffect } from "react"
import { Container, PostCard } from "../components"
import appwriteService from "../appwrite/config"

function Bookmarks() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        appwriteService.getBookmarks().then((postsResponse) => {
            if (postsResponse) {
                setPosts(postsResponse.documents || [])
            }
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="w-full py-12 text-center text-slate-650 dark:text-gray-400">
                Loading your bookmarks...
            </div>
        )
    }

    return (
        <div className="w-full py-8">
            <Container>
                <div className="w-full mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-250">My Bookmarks</h1>
                    <p className="text-slate-600 dark:text-gray-400 transition-colors duration-250">Your curated list of saved articles.</p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-250 dark:border-gray-700 p-8 text-slate-600 dark:text-gray-400 text-lg transition-colors duration-250 shadow-sm dark:shadow-none">
                        You haven't bookmarked any articles yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {posts.map((post) => (
                            <PostCard key={post.$id} {...post}/>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default Bookmarks;
