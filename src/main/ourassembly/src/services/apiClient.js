import axios from 'axios'

function normalizeApiBaseUrl(rawBaseUrl) {
  return rawBaseUrl.trim().replace(/\/$/, '').replace(/\/api$/, '')
}

const configuredBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '')

export function getApiBaseUrl() {
  return configuredBaseUrl
}

export function resolveApiAssetUrl(path) {
  if (!path) {
    return ''
  }

  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return configuredBaseUrl ? `${configuredBaseUrl}${normalizedPath}` : normalizedPath
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
})
