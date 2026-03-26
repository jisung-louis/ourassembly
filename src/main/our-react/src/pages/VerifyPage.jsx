import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:8080/api/user";

export default function VerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const signupData = location.state?.signupData;

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(174);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!signupData) {
            alert("잘못된 접근입니다.");
            navigate("/signup");
        }
        const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(interval);
    }, [signupData, navigate]);

    const formatTime = () => {
        const m = Math.floor(timer / 60);
        const s = timer % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const handleOtpChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        if (val && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1].focus();
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) return alert("6자리 번호를 입력해주세요.");
        setLoading(true);
        try {
            await axios.post(`${API}/emailcheck`, null, { params: { email: signupData.email, code } });
            await axios.post(`${API}/sign`, {
                email: signupData.email,
                password: signupData.password,
                name: signupData.name,
                address: signupData.address,
            });
            alert("회원가입 완료! 로그인 해주세요.");
            navigate("/login");
        } catch (error) {
            alert(error.response?.data || "인증 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6">
            <main className="w-full max-w-md space-y-12">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbaxbtE6yapB9o0RSXSrSG1mi-ELn1A-wwvRYEWF6we072zcaqDTuCyXMHqjjE7nJjGl3bOjPQsYjtRbQHznWpr89hLqOaQMWmz02pgcBInGTxxdBzoxZpgkeclC9PuJm9IGfRN8HNgzlxmeXf9Sjg0DCKzFXdN40e-SMhUa0egdxw5O3gjQVcxsbO186an-WkU9OmBH3mmBC_2TedovL1SfHuHvvkcFxc3cBYKXyRElDAiPpX-EXeIZ4uBLrfIidP77EIUrzzNkw" alt="Logo" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary">우리동네국회의원</h1>
                        <p className="text-on-surface-variant mt-2 font-medium">인증번호를 입력해주세요</p>
                    </div>
                </div>

                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_48px_rgba(25,28,30,0.04)] space-y-8">
                    <p className="text-center text-on-surface-variant text-sm">{signupData?.email}로 발송되었습니다.</p>
                    <div className="flex justify-between gap-2 md:gap-3">
                        {otp.map((data, i) => (
                            <input key={i} ref={(el) => (inputRefs.current[i] = el)} className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border-none bg-surface-container-low text-primary focus:ring-2 focus:ring-primary-container outline-none" type="text" maxLength="1" value={data} placeholder="·" onChange={(e) => handleOtpChange(e, i)} onKeyDown={(e) => handleKeyDown(e, i)} />
                        ))}
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-2 text-on-tertiary-container font-semibold">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{formatTime()}</span>
                        </div>
                        <button className="text-sm font-semibold text-secondary flex items-center gap-1 group">인증번호 재전송 <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">refresh</span></button>
                    </div>
                    <button onClick={handleVerify} disabled={loading} className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                        {loading ? "처리 중..." : "확인"} <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </section>
            </main>
        </div>
    );
}