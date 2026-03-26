import React, { useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await userService.login(formData);
            if (response.data === true) {
                const token = response.headers['authorization'];
                if (token) {
                    localStorage.setItem('token', token);
                }
                alert('로그인 성공!');
                // navigate('/home'); // Redirect to home or dashboard after successful login
            }
        } catch (err) {
            setError(err.response?.data || '로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-4 md:p-8 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[1100px] bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row min-h-[650px]"
            >
                {/* Left Section: Branding & Visual */}
                <div className="relative hidden lg:flex lg:w-[45%] bg-[#000666] p-12 flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1590674000180-8cc059b85f44?q=80&w=2070&auto=format&fit=crop"
                            alt="National Assembly"
                            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#000666]/80 via-[#000666]/60 to-[#000666]/90" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white">
                            <Building2 size={28} strokeWidth={2.5} />
                            <span className="text-xl font-bold tracking-tight">우리동네국회의원</span>
                        </div>
                    </div>

                    <div className="relative z-10 mb-12">
                        <h1 className="text-white text-4xl xl:text-5xl font-extrabold leading-[1.3] mb-6 break-keep">
                            시민과 국회를 잇는 가장 투명한 통로
                        </h1>
                        <p className="text-white/70 text-lg font-medium">
                            더 나은 우리 동네를 위한 첫걸음을 시작하세요.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                        <div className="w-10 h-1 bg-white rounded-full" />
                        <div className="w-3 h-1 bg-white/30 rounded-full" />
                        <div className="w-3 h-1 bg-white/30 rounded-full" />
                    </div>
                </div>

                {/* Right Section: Login Form */}
                <div className="flex-1 p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                    <div className="max-w-[400px] mx-auto w-full">
                        <header className="mb-10">
                            <h2 className="text-3xl font-bold text-[#191C1E] mb-2">반갑습니다</h2>
                            <p className="text-[#515F74]">서비스 이용을 위해 로그인해주세요.</p>
                        </header>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-[#515F74] ml-1">
                                    이메일 주소
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    className="w-full px-5 py-4 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 focus:ring-[#000666] transition-all placeholder:text-[#9E9E9E]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" id="password-label" className="block text-sm font-semibold text-[#515F74] ml-1">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 focus:ring-[#000666] transition-all placeholder:text-[#9E9E9E]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4.5 bg-[#000666] text-white font-bold rounded-xl shadow-lg hover:bg-[#1A237E] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                <span>로그인</span>
                                <ArrowRight size={20} />
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-[#515F74] font-medium">
                                계정이 없으신가요?
                                <Link to="/signup" className="text-[#000666] font-bold ml-2 hover:underline underline-offset-4">
                                    회원가입
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
