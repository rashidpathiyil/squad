export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession()

  // If user is not logged in, redirect to login
  if (!user.value) {
    return navigateTo('/auth/login')
  }
}) 
