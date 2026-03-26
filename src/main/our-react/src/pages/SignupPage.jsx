import React, { useState } from 'react';
import { Building2, ArrowRight, Mail, ShieldCheck, User, MapPin, Lock, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { userService } from '../services/userService';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        address: '',
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    // 이메일 정규식 검증 함수
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (id === 'email') setError(''); // 입력 시 에러 메시지 초기화
    };

    const handleCompletePostcode = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';
        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }
        setFormData((prev) => ({ ...prev, address: fullAddress }));
        setIsPostcodeOpen(false);
    };

    const handleSendEmail = async () => {
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        // 팩트 체크: 이메일 형식 검증 추가
        if (!validateEmail(formData.email)) {
            setError('올바른 이메일 형식이 아닙니다. (예: example@email.com)');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await userService.sendEmail(formData.email);
            setIsEmailSent(true);
            alert('인증 메일이 발송되었습니다.');
        } catch (err) {
            setError(err.response?.data || '메일 발송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            setError('인증번호를 입력해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await userService.verifyCode(formData.email, verificationCode);
            setIsVerified(true);
            alert('인증 성공!');
        } catch (err) {
            setError(err.response?.data || '인증번호가 일치하지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!isVerified) {
            setError('이메일 인증을 먼저 완료해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await userService.signUp(formData);
            alert('회원가입 성공!');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-4 md:p-8 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[1100px] bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row min-h-[750px]"
            >
                {/* Left Section (Visual) */}
                <div className="relative hidden lg:flex lg:w-[40%] bg-[#000666] p-12 flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src="https://images.unsplash.com/photo-1575517111478-7f6afd0973db?q=80&w=2070&auto=format&fit=crop" alt="Civic Building" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#000666]/80 via-[#000666]/60 to-[#000666]/90" />
                    </div>
                    <div className="relative z-10 text-white flex items-center gap-2">
                        <Building2 size={28} />
                        <span className="text-xl font-bold">우리동네국회의원</span>
                    </div>
                    <div className="relative z-10 mb-12">
                        <h1 className="text-white text-4xl font-extrabold leading-[1.3] mb-6">더 나은 내일을 위한<br />당신의 목소리</h1>
                        <p className="text-white/70 text-lg">회원가입을 통해 우리 동네의 변화에 참여하세요.</p>
                    </div>
                </div>

                {/* Right Section (Form) */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-[450px] mx-auto w-full">
                        <header className="mb-8">
                            <h2 className="text-3xl font-bold text-[#191C1E] mb-2">회원가입</h2>
                            <p className="text-[#515F74]">정보를 입력하여 계정을 생성하세요.</p>
                        </header>

                        {error && <p className="text-red-500 text-sm mb-4 font-medium">⚠️ {error}</p>}

                        <form className="space-y-5" onSubmit={handleSignUp}>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#515F74] ml-1">이메일 주소</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isVerified}
                                            placeholder="example@email.com"
                                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 transition-all ${error && !validateEmail(formData.email) ? 'ring-2 ring-red-400' : 'focus:ring-[#000666]'}`}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendEmail}
                                        disabled={loading || isVerified}
                                        className="px-4 py-3.5 bg-[#000666] text-white text-sm font-bold rounded-xl hover:bg-[#1A237E] disabled:opacity-50 whitespace-nowrap"
                                    >
                                        인증요청
                                    </button>
                                </div>
                            </div>

                            {isEmailSent && !isVerified && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[#515F74] ml-1">인증번호</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                placeholder="6자리 번호 입력"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 focus:ring-[#000666] transition-all"
                                            />
                                        </div>
                                        <button type="button" onClick={handleVerifyCode} className="px-4 py-3.5 bg-[#000666] text-white text-sm font-bold rounded-xl hover:bg-[#1A237E]">확인</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#515F74] ml-1">이름</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                                    <input type="text" id="name" value={formData.name} onChange={handleInputChange} placeholder="홍길동" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 focus:ring-[#000666]" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#515F74] ml-1">주소</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                                        <input type="text" id="address" value={formData.address} readOnly className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F4F6] border-none" />
                                    </div>
                                    <button type="button" onClick={() => setIsPostcodeOpen(true)} className="px-4 py-3.5 bg-[#000666] text-white text-sm font-bold rounded-xl flex items-center gap-2"><Search size={16} />검색</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#515F74] ml-1">비밀번호</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={18} />
                                    <input type="password" id="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F2F4F6] border-none focus:ring-2 focus:ring-[#000666]" required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isVerified}
                                className="w-full py-4 bg-[#000666] text-white font-bold rounded-xl shadow-lg hover:bg-[#1A237E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                <span>회원가입 완료</span>
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Daum Postcode Modal */}
            <AnimatePresence>
                {isPostcodeOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostcodeOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[500px] bg-white rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="font-bold text-lg">주소 검색</h3>
                                <button onClick={() => setIsPostcodeOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="h-[450px]"><DaumPostcode onComplete={handleCompletePostcode} style={{ height: '100%' }} /></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SignUpPage;