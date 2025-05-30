import { computed, readonly } from 'vue'

interface User {
  _id: string
  email: string
  name: string
  isActive: boolean
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  user: User
}

interface ApiError {
  response?: {
    data?: {
      error?: string
    }
  }
  data?: {
    error?: string
  }
  message?: string
}

export const useAuth = () => {
  const { post } = useApi()
  const { user, clear, fetch: fetchSession } = useUserSession()

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email })
      
      // Use the server-side login endpoint
      const response = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      console.log('Login response received:', response)

      // Refresh the user session
      await fetchSession()
      console.log('Session fetched successfully')
      
      return response
    } catch (error: unknown) {
      console.error('Login error details:', error)
      console.error('Error type:', typeof error)
      
      const err = error as ApiError
      console.error('Error properties:', Object.keys(err))
      
      // Better error handling
      if (err.response) {
        throw new Error(err.response.data?.error || 'Login failed - API error')
      } else if (err.data) {
        throw new Error(err.data.error || 'Login failed - Data error')
      } else {
        throw new Error(err.message || 'Login failed - Unknown error')
      }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await post<{ message: string; user: User }>('/auth/register', userData)
      return response
    } catch (error: unknown) {
      const err = error as ApiError
      throw new Error(err.data?.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await clear()
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getProfile = async () => {
    try {
      const response = await post<{ user: User }>('/profile')
      return response.user
    } catch (error: unknown) {
      const err = error as ApiError
      throw new Error(err.data?.error || 'Failed to fetch profile')
    }
  }

  return {
    user: readonly(user),
    login,
    register,
    logout,
    getProfile,
    isLoggedIn: computed(() => !!user.value)
  }
} 
