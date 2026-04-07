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

export async function getCongressmanNews(congressmanId) {
    try {
        const response = await apiClient.get(`/news/${congressmanId}`);
        return response.data;
    } catch (error) {
        if (!axios.isAxiosError(error) || !error.response) {
            throw new Error(`${congressmanId} 국회의원의 뉴스 정보를 불러오지 못했습니다.`)
        }

        throw new Error(
            extractErrorMessage(error.response.data, '뉴스 정보를 불러오지 못했습니다.'),
        )
    }
}