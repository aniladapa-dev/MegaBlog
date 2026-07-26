import postService from "../services/config"
import React from "react"
import { Link } from "react-router-dom"

function PostCard({ 
    $id, 
    id,
    title, 
    featuredImage, 
    category = "General",
    description,
    authorName = "Author",
    authorAvatar,
    readTime = "3 min read",
    likesCount,
    commentsCount,
    viewsCount,
    createdAt,
    linkTo
}) {
    const postId = $id || id;
    const targetUrl = linkTo || `/post/${postId}`;
    const dateFormatted = createdAt 
        ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : 'Recently';

    return (
      <Link to={targetUrl} className="group flex flex-col h-full">
        <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-[#0f172a]/20 border border-gray-200 dark:border-gray-800/80 hover:border-purple-500/50 hover:scale-[1.02] rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-purple-500/5 backdrop-blur-sm">
          
          <div>
            {/* Image container */}
            <div className="w-full h-48 mb-4 overflow-hidden rounded-xl relative bg-gray-100 dark:bg-gray-950">
              {featuredImage ? (
                <img
                  src={featuredImage.startsWith('http') ? featuredImage : postService.getFileView(featuredImage)}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-slate-900 to-rose-900/30 flex items-center justify-center text-3xl">
                  ✍️
                </div>
              )}
              {category && (
                <span className="absolute top-3 right-3 bg-purple-600/90 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
                  {category}
                </span>
              )}
            </div>

            {/* Author info & Read Time */}
            <div className="flex items-center justify-between gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] overflow-hidden">
                  {authorAvatar ? <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" /> : authorName.charAt(0)}
                </div>
                <span className="font-medium text-slate-700 dark:text-gray-300 truncate max-w-[110px]">{authorName}</span>
              </div>
              <span className="text-[11px] text-gray-400">{readTime} • {dateFormatted}</span>
            </div>
    
            <h2 className="text-base font-bold text-left text-gray-850 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 line-clamp-2 leading-snug mb-2">
              {title}
            </h2>

            {description && (
              <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {/* Card footer metrics */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-3">
              {likesCount !== undefined && likesCount !== null && (
                <span className="flex items-center gap-1 hover:text-purple-400">
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {likesCount}
                </span>
              )}
              {commentsCount !== undefined && commentsCount !== null && (
                <span className="flex items-center gap-1 hover:text-purple-400">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  {commentsCount}
                </span>
              )}
              {viewsCount !== undefined && viewsCount !== null && (
                <span className="flex items-center gap-1 hover:text-purple-400">
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  {viewsCount}
                </span>
              )}
            </div>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-purple-600 dark:text-purple-400 font-bold">Read Article →</span>
          </div>
        </div>
      </Link>
    );
  }

export default PostCard;