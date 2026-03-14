import axios from 'axios'

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  config.withCredentials = true
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url ?? ''

    if (status === 401) {
      const isLoginRequest = requestUrl.includes('/api/auth/login')
      if (!isLoginRequest) {
        import('../store/authStore').then(({ authStore }) => {
          authStore.getState().clearAuth()
          window.location.href = '/login'
        })
      }
    }

    return Promise.reject(error)
  }
)
