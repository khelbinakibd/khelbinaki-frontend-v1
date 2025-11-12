// import axios from 'axios'

// export const api = axios.create({
// baseURL: import.meta.env.VITE_API_URL,
// headers: { 'Content-Type': 'application/json' },
// withCredentials: true,
// })


// api.interceptors.request.use((config) => {
// const token = getAccessToken()
// if (token) config.headers.Authorization = `Bearer ${token}`
// return config
// })


// api.interceptors.response.use(
// (res) => res,
// async (error) => {
// if (error?.response?.status === 401) {
// const retried = await refreshAuthToken()
// if (retried) return api.request(error.config)
// }
// return Promise.reject(error)
// }
// )