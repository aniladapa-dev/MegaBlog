import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Home from './Pages/Home.jsx'
import { AuthLayout, Login, Signup, OAuth2Callback } from './components/index.js'

import AllPosts from './Pages/AllPosts.jsx'
import AddPost from './Pages/AddPost.jsx'
import EditPost from './Pages/EditPost.jsx'
import Post from './Pages/Post.jsx'
import Profile from './Pages/Profile.jsx'
import Bookmarks from './Pages/Bookmarks.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: '/profile/:userId?',
        element: (
          <AuthLayout authentication={true}>
            <Profile/>
          </AuthLayout>
        )
      },
      {
        path: '/login',
        element: (
          <AuthLayout authentication={false}>
            <Login/>
          </AuthLayout>
        )
      },
      {
        path: '/signup',
        element: (
          <AuthLayout authentication={false}>
            <Signup/>
          </AuthLayout>
        )
      },
      {
        path: '/oauth2/callback',
        element: <OAuth2Callback/>
      },
      {
        path: '/all-posts',
        element: (
          <AuthLayout authentication={true}>
            {" "}
            <AllPosts/>
          </AuthLayout>
        )
      },
      {
        path: '/bookmarks',
        element: (
          <AuthLayout authentication={true}>
            {" "}
            <Bookmarks/>
          </AuthLayout>
        )
      },
      {
        path: '/add-post',
        element: (
          <AuthLayout authentication={true}>
            {" "}
            <AddPost/>
          </AuthLayout>
        )
      },
      {
        path: '/edit-post/:slug',
        element: (
          <AuthLayout authentication={true}>
            {" "}
            <EditPost/>
          </AuthLayout>
        )
      },
      {
        path: "post/:slug",
        element: (
          <AuthLayout authentication={true}>
            <Post/>
          </AuthLayout>
        )
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store ={store} >
      <ThemeProvider>
        <RouterProvider router = {router}/>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
