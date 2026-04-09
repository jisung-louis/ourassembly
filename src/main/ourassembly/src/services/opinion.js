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
  const authorization = getAuthorizationHeader()

  try {
    const response = await apiClient.get('/opinion/opinions', {
      params: { id: congressmanId },
      headers: authorization
        ? {
            Authorization: authorization,
          }
        : undefined,
    })

    const body = response.data

    return {
      boardMode: body?.boardMode === 'CLUSTER' ? 'CLUSTER' : 'LIST',
      updating: Boolean(body?.updating),
      clusterCount: typeof body?.clusterCount === 'number' ? body.clusterCount : 0,
      opinionCount: typeof body?.opinionCount === 'number' ? body.opinionCount : 0,
      myOpinionCount: typeof body?.myOpinionCount === 'number' ? body.myOpinionCount : 0,
      clusterItems: Array.isArray(body?.clusterItems) ? body.clusterItems : [],
      opinionItems: Array.isArray(body?.opinionItems) ? body.opinionItems : [],
      myOpinionItems: Array.isArray(body?.myOpinionItems) ? body.myOpinionItems : [],
    }
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('소통 게시판 목록을 불러오지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '소통 게시판 목록을 불러오지 못했습니다.'))
  }
}

export async function getClusterOpinions({ clusterId, page = 0, size = 5 }) {
  try {
    const response = await apiClient.get(`/opinion/clusters/${clusterId}/opinions`, {
      params: { page, size },
    })

    const body = response.data

    return {
      page: typeof body?.page === 'number' ? body.page : page,
      size: typeof body?.size === 'number' ? body.size : size,
      totalCount: typeof body?.totalCount === 'number' ? body.totalCount : 0,
      hasNext: Boolean(body?.hasNext),
      items: Array.isArray(body?.items) ? body.items : [],
    }
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('클러스터 의견 목록을 불러오지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '클러스터 의견 목록을 불러오지 못했습니다.'))
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

export async function checkSimilarOpinion({ congressmanId, title, content }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('메시지를 보내려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.post(
      '/opinion/similarity-check',
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

    const body = response.data

    return {
      matched: Boolean(body?.matched),
      similarityPercent: typeof body?.similarityPercent === 'number' ? body.similarityPercent : 0,
      daysAgo: typeof body?.daysAgo === 'number' ? body.daysAgo : 0,
      clusterId: body?.clusterId ?? null,
      clusterTitle: body?.clusterTitle ?? '',
      clusterContent: body?.clusterContent ?? '',
      answer: body?.answer ?? null,
    }
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('유사 의견 검사를 진행하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '유사 의견 검사를 진행하지 못했습니다.'))
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
      `/answer/${answerId}`,
      {
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
    await apiClient.delete(`/answer/${answerId}`, {
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

export async function createClusterAnswer({ clusterId, content, isDirect }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 작성하려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.post(
      '/cluster-answer',
      {
        content,
        isDirect,
      },
      {
        params: { cluster_id: clusterId },
        headers: {
          Authorization: authorization,
        },
      },
    )

    return response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('클러스터 답변을 저장하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '클러스터 답변을 저장하지 못했습니다.'))
  }
}

export async function updateClusterAnswer({ answerId, content, isDirect }) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 수정하려면 로그인이 필요합니다.')
  }

  try {
    const response = await apiClient.put(
      `/cluster-answer/${answerId}`,
      {
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
      throw new Error('클러스터 답변을 수정하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '클러스터 답변을 수정하지 못했습니다.'))
  }
}

export async function deleteClusterAnswer(answerId) {
  const authorization = getAuthorizationHeader()

  if (!authorization) {
    throw new Error('답변을 삭제하려면 로그인이 필요합니다.')
  }

  try {
    await apiClient.delete(`/cluster-answer/${answerId}`, {
      headers: {
        Authorization: authorization,
      },
    })
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('클러스터 답변을 삭제하지 못했습니다.')
    }

    throw new Error(extractErrorMessage(error.response.data, '클러스터 답변을 삭제하지 못했습니다.'))
  }
}
