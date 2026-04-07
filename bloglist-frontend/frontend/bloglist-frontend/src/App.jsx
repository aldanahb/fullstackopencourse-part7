import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Notification from './components/Notification'
import NotificationContext from './NotificationContext'
import UserContext from './UserContext'
import { useContext } from 'react'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const blogFormRef = useRef()

  const [, notificationDispatch] = useContext(NotificationContext)
  const [user, userDispatch] = useContext(UserContext)

  const queryClient = useQueryClient()

  const newBlogMutation = useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: (newBlog) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(['blogs'], blogs.concat(newBlog))
    },
  })

  const updateBlogMutation = useMutation({
    mutationFn: blogService.updateBlog,
    onSuccess: (updatedBlog) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.map((b) =>
          b.id === updatedBlog.id ? { ...updatedBlog, user: b.user } : b,
        ),
      )
    },
  })

  const removeBlogMutation = useMutation({
    mutationFn: blogService.removeBlog,
    onSuccess: (_, deletedBlog) => {
      const blogs = queryClient.getQueryData(['blogs'])
      queryClient.setQueryData(
        ['blogs'],
        blogs.filter((b) => b.id !== deletedBlog.id),
      )
    },
  })

  const result = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
  })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      userDispatch({ payload: user, type: 'SET_USER' })
      blogService.setToken(user.token)
    }
  }, [userDispatch])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const userLogin = await loginService.login({ username, password }) // DEVUELVE TOKEN
      window.localStorage.setItem(
        'loggedBlogAppUser',
        JSON.stringify(userLogin),
      )
      blogService.setToken(userLogin.token)
      userDispatch({ payload: userLogin, type: 'SET_USER' })
      setUsername('')
      setPassword('')
    } catch {
      notificationDispatch({
        payload: { content: 'Wrong username or password', type: 'error' },
        type: 'SET_NOTIFICATION',
      })

      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const logout = () => (
    <div>
      <p>
        {`${user.name} logged in`}
        <button
          onClick={() => {
            window.localStorage.removeItem('loggedBlogAppUser')
            blogService.setToken(null)
            userDispatch({ type: 'CLEAR_USER' })
          }}
        >
          logout
        </button>
      </p>
    </div>
  )

  const createBlog = async (blogObject) => {
    try {
      await newBlogMutation.mutateAsync(blogObject)

      notificationDispatch({
        payload: {
          content: `a new blog ${blogObject.title} by ${blogObject.author} added`,
          type: 'exit',
        },
        type: 'SET_NOTIFICATION',
      })

      blogFormRef.current.toggleVisibility()

      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    } catch {
      notificationDispatch({
        payload: {
          content: 'An error occurred while trying to save the blog',
          type: 'error',
        },
        type: 'SET_NOTIFICATION',
      })

      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    }
  }

  const handleLike = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id,
    }

    try {
      await updateBlogMutation.mutateAsync(updatedBlog)
    } catch {
      notificationDispatch({
        payload: { content: 'Error updating likes', type: 'error' },
        type: 'SET_NOTIFICATION',
      })

      setTimeout(() => {
        notificationDispatch({ type: 'CLEAR_NOTIFICATION' })
      }, 5000)
    }
  }

  const removeBlog = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      try {
        await removeBlogMutation.mutateAsync(blog)
      } catch {
        notificationDispatch({
          payload: { content: 'Error removing blog', type: 'error' },
          type: 'SET_NOTIFICATION',
        })

        setTimeout(() => {
          notificationDispatch({ type: 'CLEAR_NOTIFICATION' })
        }, 5000)
      }
    }
  }

  const blogForm = () => {
    return (
      // todo lo que está dentro de <Togglable> se guarda en props.children
      <>
        <h2>blogs</h2>
        {logout()}
        <Togglable buttonLabel="create new blog" ref={blogFormRef}>
          <BlogForm createBlog={createBlog} />
        </Togglable>
      </>
    )
  }

  // controlar que ya estén cargados los blogs
  if (result.isLoading) {
    return <div>cargando blogs...</div>
  }

  const blogs = result.data || []

  const listBlogs = () => (
    <div>
      {[...blogs]
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            handleLike={handleLike}
            removeBlog={removeBlog}
          />
        ))}
    </div>
  )

  return (
    <div>
      <Notification />
      {user === null ? (
        loginForm()
      ) : (
        <div>
          {blogForm()}
          {listBlogs()}
        </div>
      )}
    </div>
  )
}

export default App
