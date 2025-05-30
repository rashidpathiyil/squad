import type { NitroFetchRequest } from 'nitropack'
import { ofetch, type FetchOptions } from 'ofetch'

interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const { user } = useUserSession()

  // Create authenticated fetch instance
  const api = ofetch.create({
    baseURL: config.public.apiBase,
    timeout: 30000, // Default 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest({ options }) {
      // Add auth token if user is logged in
      if (user.value?.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${user.value.token}`,
        }
      }
    },
    onResponseError({ response }) {
      console.error('API Error:', response.status, response._data)
    }
  })

  // Create a separate instance for bulk operations with longer timeout
  const bulkApi = ofetch.create({
    baseURL: config.public.apiBase,
    timeout: 300000, // 5 minute timeout for bulk operations
    headers: {
      'Content-Type': 'application/json',
    },
    onRequest({ options }) {
      // Add auth token if user is logged in
      if (user.value?.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${user.value.token}`,
        }
      }
    },
    onResponseError({ response }) {
      console.error('API Error:', response.status, response._data)
    }
  })

  // Wrapper for GET requests
  const get = async <T = any>(
    endpoint: string, 
    options?: FetchOptions<NitroFetchRequest>
  ): Promise<T> => {
    return await api<T>(endpoint, { method: 'GET', ...options })
  }

  // Wrapper for POST requests
  const post = async <T = any>(
    endpoint: string, 
    body?: any, 
    options?: FetchOptions<NitroFetchRequest>
  ): Promise<T> => {
    return await api<T>(endpoint, { method: 'POST', body, ...options })
  }

  // Wrapper for bulk POST requests with longer timeout
  const postBulk = async <T = any>(
    endpoint: string, 
    body?: any, 
    options?: FetchOptions<NitroFetchRequest>
  ): Promise<T> => {
    return await bulkApi<T>(endpoint, { method: 'POST', body, ...options })
  }

  // Wrapper for PUT requests
  const put = async <T = any>(
    endpoint: string, 
    body?: any, 
    options?: FetchOptions<NitroFetchRequest>
  ): Promise<T> => {
    return await api<T>(endpoint, { method: 'PUT', body, ...options })
  }

  // Wrapper for DELETE requests
  const del = async <T = any>(
    endpoint: string, 
    options?: FetchOptions<NitroFetchRequest>
  ): Promise<T> => {
    return await api<T>(endpoint, { method: 'DELETE', ...options })
  }

  return {
    api,
    get,
    post,
    postBulk,
    put,
    delete: del,
  }
} 
