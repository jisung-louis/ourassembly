import axios from 'axios'
import { apiClient } from './apiClient.js'
import { getAuthorizationHeader } from './auth.js'

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

export async function getCongressmanOpinions(congressmanId) {
  try {
    const response = await apiClient.get('/opinion/opinions', {
      params: { id: congressmanId },
    })

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('소통 게시판 목록을 불러오지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '소통 게시판 목록을 불러오지 못했습니다.'))
  }
}

export async function createOpinion({ congressmanId, title, content }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('메시지를 보내려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.post(
      '/opinion',
      {
        congressmanId,
        title,
        content,
      },
      {
        headers: {
          Authorization: authorization,
        },
      },
    )

    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('메시지를 보내지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '메시지를 보내지 못했습니다.'))
  }
}

export async function createAnswer({ opinionId, content, isDirect }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 작성하려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.post(
      '/answer',
      {
        content,
        isDirect,
      },
      {
        params: { opinion_id: opinionId },
        headers: {
          Authorization: authorization,
        },
      },
    )

    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('답변을 저장하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '답변을 저장하지 못했습니다.'))
  }
}

export async function updateAnswer({ answerId, content, isDirect }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 수정하려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.put(
      '/answer',
      {
        id: answerId,
        content,
        isDirect,
      },
      {
        headers: {
          Authorization: authorization,
        },
      },
    )

    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('답변을 수정하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '답변을 수정하지 못했습니다.'))
  }
}

export async function deleteAnswer(answerId) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 삭제하려면 로그인이 필요합니다.')
  }

  try {
    await apiClient.delete('/answer', {
      params: { answer_id: answerId },
      headers: {
        Authorization: authorization,
      },
    })
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('답변을 삭제하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '답변을 삭제하지 못했습니다.'))
  }
}
