import React, { useState } from 'react';
import axios from 'axios';

export default function User() {
    // 1. 입력 데이터 관리 (백엔드 UserDto 필드와 이름 맞춤)
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
        name: '',
        address: ''
    });

    // 2. 입력창 타이핑 시 데이터 저장
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. [인증번호 발송] 버튼 클릭 시
    const handleSendEmail = async () => {
        if (!formData.email) return alert("이메일을 입력해주세요.");
        try {
            // 주소를 풀(Full)로 다 적어서 프록시 설정 없이 보냅니다.
            await axios.post(`http://localhost:8080/api/user/email?email=${formData.email}`);
            alert("인증 메일이 발송되었습니다. 메일함을 확인하세요!");
        } catch (err) {
            alert("메일 발송 실패: " + (err.response?.data || err.message));
        }
    };

    // 4. [인증번호 확인] 버튼 클릭 시
    const handleCheckCode = async () => {
        try {
            await axios.post(`http://localhost:8080/api/user/emailcheck?email=${formData.email}&code=${formData.code}`);
            alert("인증 성공! 이제 회원가입을 완료할 수 있습니다.");
        } catch (err) {
            alert("인증 실패: " + (err.response?.data || err.message));
        }
    };

    // 5. [회원가입 완료] 버튼 클릭 시
    const handleSubmit = async (e) => {
        e.preventDefault(); // 페이지 새로고침 방지

        if (formData.password !== formData.confirmPassword) {
            return alert("비밀번호가 서로 다릅니다.");
        }

        try {
            // 백엔드 @RequestBody UserDto 형식에 맞춰서 데이터 전송
            await axios.post('http://localhost:8080/api/user/sign', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                address: formData.address
            });
            alert("축하합니다! 회원가입 성공!");
        } catch (err) {
            alert("회원가입 실패: " + (err.response?.data || err.message));
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
                <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">OurAssembly</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* 이메일 입력 섹션 */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">이메일</label>
                        <div className="flex gap-2">
                            <input
                                name="email" value={formData.email} onChange={handleChange}
                                className="flex-grow border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="example@test.com" type="email"
                            />
                            <button
                                type="button" onClick={handleSendEmail}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                            >
                                인증발송
                            </button>
                        </div>
                    </div>

                    {/* 인증번호 입력 섹션 */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">인증번호</label>
                        <div className="flex gap-2">
                            <input
                                name="code" value={formData.code} onChange={handleChange}
                                className="flex-grow border rounded-md px-3 py-2 outline-none"
                                placeholder="6자리 숫자" type="text"
                            />
                            <button
                                type="button" onClick={handleCheckCode}
                                className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-black text-sm"
                            >
                                확인
                            </button>
                        </div>
                    </div>

                    {/* 비밀번호 섹션 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">비밀번호</label>
                            <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-md px-3 py-2" type="password" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">비밀번호 확인</label>
                            <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border rounded-md px-3 py-2" type="password" />
                        </div>
                    </div>

                    {/* 이름 & 주소 */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">이름</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="홍길동" type="text" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">거주 지역</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="서울시 강남구" type="text" />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-900 text-white py-3 rounded-md font-bold hover:bg-blue-800 transition-all"
                    >
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}