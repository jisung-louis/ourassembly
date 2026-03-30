import axios from 'axios'

const DEFAULT_API_BASE_URL = 'http://localhost:8082'

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
  return configuredBaseUrl.replace(/\/$/, '')
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
})
