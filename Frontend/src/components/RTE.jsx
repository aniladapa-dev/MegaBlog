import React from "react"
import {Editor } from '@tinymce/tinymce-react';
import {Controller } from 'react-hook-form';
import { useTheme } from "../context/ThemeContext";

//Rich Text Editor (RTE) wrapper that integrates TinyMCE with React Hook Form using Controller.
//Controller is used to connect non-standard inputs (like TinyMCE) to React Hook Form


export default function RTE({name, control, label, defaultValue = " "}){
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className='w-full'> 
            {label && <label className='inline-block mb-1.5 pl-1 text-sm font-semibold text-slate-650 dark:text-gray-400 transition-colors duration-250'>{label}</label>}
            
            <Controller
                name={name || "content"}
                control={control}
                render={({field: {onChange}}) => (
                    <Editor
                    key={theme}
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    initialValue={defaultValue}
                    init={{
                        initialValue: defaultValue,
                        height: 500,
                        menubar: true,
                        plugins: [
                            "image",
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                            "anchor",
                        ],
                        toolbar:
                        "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
                        skin: isDark ? "oxide-dark" : "oxide",
                        content_css: isDark ? "dark" : "default",
                        content_style: isDark 
                            ? "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #0c1222; color: #e2e8f0; }"
                            : "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #ffffff; color: #000000; }"
                    }}
                    onEditorChange={onChange}
                    />
                )}
                />
                
        </div>
    )
}