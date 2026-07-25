import React from "react"

function Logo({width = '100px'}){
    return (
        <div className="flex items-center gap-2 font-extrabold text-xl tracking-wider select-none">
            <span className="text-2xl">✨</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400 bg-clip-text text-transparent">
                megablog
            </span>
        </div>
    )
}

export default Logo;