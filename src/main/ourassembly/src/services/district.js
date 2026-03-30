import axios from 'axios'
import { apiClient } from './apiClient.js'

function extractErrorMessage(body, fallbackMessage) {
  if (typeof body === 'string' && body.trim()) {
    return body
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message
    }

    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error
    }
  }

  return fallbackMessage
}

export async function searchDistricts(query, limit = 10) {
  try {
    const response = await apiClient.get('/district/search', {
      params: { q: query, limit },
    })

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('주소 검색 서버에 연결하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '주소 검색에 실패했습니다.'))
  }
}
