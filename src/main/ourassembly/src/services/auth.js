import axios from 'axios'

const AUTH_STORAGE_KEY = 'ourassembly.auth'
const DEFAULT_API_BASE_URL = 'http://localhost:8080'

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
  return configuredBaseUrl.replace(/\/$/, '')
}

const authClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
})

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

async function request(path, { method = 'GET', body, queryParams } = {}, fallbackMessage) {
  try {
    const response = await authClient.request({
      url: path,
      method,
      data: body,
      params: queryParams,
    })

    return { body: response.data, response }
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new Error('백엔드 서버에 연결하지 못했습니다. 서버가 실행 중인지 확인해 주세요.')
    }

    throw new Error(extractErrorMessage(error.response.data, fallbackMessage))
  }
}

function persistAuthSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

function normalizeToken(authorizationHeader) {
  if (!authorizationHeader) {
    return ''
  }

  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : authorizationHeader
}

export async function sendVerificationEmail(email) {
  const { body } = await request(
    '/api/user/email',
    {
      method: 'POST',
      queryParams: { email },
    },
    '인증 메일 발송에 실패했습니다.',
  )

  return typeof body === 'string' ? body : '인증 메일이 발송되었습니다.'
}

export async function verifyEmailCode(email, code) {
  const { body } = await request(
    '/api/user/emailcheck',
    {
      method: 'POST',
      queryParams: { email, code },
    },
    '이메일 인증에 실패했습니다.',
  )

  return typeof body === 'string' ? body : '이메일 인증이 완료되었습니다.'
}

export async function signUp({ name, email, address, password }) {
  const { body } = await request(
    '/api/user/sign',
    {
      method: 'POST',
      body: { name, email, address, password },
    },
    '회원가입에 실패했습니다.',
  )

  return typeof body === 'string' ? body : '회원가입이 완료되었습니다.'
}

export async function login({ email, password }) {
  const { body, response } = await request(
    '/api/user/login',
    {
      method: 'POST',
      body: { email, password },
    },
    '로그인에 실패했습니다.',
  )

  const token = normalizeToken(
    response.headers.authorization ?? response.headers.Authorization,
  )

  if (!token) {
    throw new Error('로그인 토큰을 받지 못했습니다.')
  }

  const session = { token, user: body }
  persistAuthSession(session)

  return session
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAuthSession() {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function getStoredAuthUser() {
  return getAuthSession()?.user ?? null
}

export function getAuthorizationHeader() {
  const session = getAuthSession()

  if (!session?.token) {
    return null
  }

  return `Bearer ${session.token}`
}
