export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession()

  // If user is already logged in, redirect to app
  if (user.value) {
    return navigateTo('/app')
  }
}) 
