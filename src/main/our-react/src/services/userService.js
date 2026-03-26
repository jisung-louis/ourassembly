import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/user';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const userService = {
    // 1. 인증번호 발송 (@RequestParam String email)
    sendEmail: async (email) => {
        return apiClient.post(`/email`, null, {
            params: { email: email }
        });
    },

    // 2. 인증번호 확인 (@RequestParam String email, String code)
    verifyCode: async (email, code) => {
        return apiClient.post(`/emailcheck`, null, {
            params: {
                email: email,
                code: code
            }
        });
    },

    // 3. 회원가입 (@RequestBody UserDto)
    signUp: async (userData) => {
        return apiClient.post(`/sign`, userData);
    },

    // 4. 로그인 (@RequestBody UserDto)
    login: async (loginData) => {
        return apiClient.post(`/login`, loginData);
    },
};