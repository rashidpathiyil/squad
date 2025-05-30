export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Forward the login request to the backend API
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password }
    })

    if (response.token && response.user) {
      // Set user session with the response data
      await setUserSession(event, {
        user: {
          ...response.user,
          token: response.token
        },
        loggedInAt: Date.now()
      })

      return {
        success: true,
        message: response.message,
        user: response.user
      }
    }

    throw new Error('Invalid response from auth service')
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message || 'Authentication failed'
    })
  }
}) 
