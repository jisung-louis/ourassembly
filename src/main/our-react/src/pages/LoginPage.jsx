import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api/user";

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // @RequestBody 매핑
            const res = await axios.post(`${API}/login`, form);

            // 팩트 체크: 백엔드가 헤더에 토큰을 담아 보냈으므로 headers에서 추출해야 함
            const token = res.headers['authorization'];
            if (token) {
                localStorage.setItem("token", token);
                setMessage("로그인 성공!");
                // 로그인 성공 후 메인 페이지로 이동 (경로는 프로젝트에 맞게 수정)
                setTimeout(() => navigate("/"), 1000);
            }
        } catch (error) {
            setMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4">
            <main className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-[0_32px_48px_rgba(25,28,30,0.04)] min-h-[700px]">
                {/* 왼쪽 브랜딩 영역 */}
                <section className="relative hidden lg:flex flex-col justify-between p-12 bg-[#000666] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#000666] via-[#000666]/80 to-transparent z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                            <span className="text-white font-extrabold text-2xl tracking-tight">우리동네국회의원</span>
                        </div>
                    </div>
                    <div className="relative z-10 max-w-md">
                        <h1 className="text-white text-5xl font-extrabold leading-tight mb-6">
                            시민과 국회를 잇는 <br/>가장 투명한 통로
                        </h1>
                        <p className="text-[#8690ee] text-lg leading-relaxed">더 나은 우리 동네를 위한 첫걸음을 시작하세요.</p>
                    </div>
                </section>

                {/* 오른쪽 로그인 폼 영역 */}
                <section className="flex flex-col justify-center p-8 md:p-16 lg:p-20 bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">반갑습니다</h2>
                            <p className="text-gray-500 font-medium">서비스 이용을 위해 로그인해주세요.</p>
                        </header>
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-600 ml-1">이메일 주소</label>
                                <input className="w-full px-4 py-3.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-[#000666] transition-all outline-none"
                                       name="email" type="email" placeholder="example@email.com" onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-600 ml-1">비밀번호</label>
                                <input className="w-full px-4 py-3.5 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-[#000666] transition-all outline-none"
                                       name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
                            </div>

                            {message && <p className="text-red-500 text-sm font-bold">{message}</p>}

                            <button type="submit" className="w-full py-4 bg-[#000666] text-white font-bold rounded-lg shadow-lg hover:bg-[#1a237e] transition-all flex items-center justify-center gap-2">
                                <span>로그인</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </form>
                        <footer className="text-center mt-8">
                            <p className="text-gray-500 font-medium">
                                계정이 없으신가요?
                                <span className="text-[#000666] font-bold ml-2 hover:underline cursor-pointer" onClick={() => navigate("/signup")}>회원가입</span>
                            </p>
                        </footer>
                    </div>
                </section>
            </main>
        </div>
    );
}