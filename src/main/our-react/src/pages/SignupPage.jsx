import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";

const API = "http://localhost:8080/api/user";

export default function SignupPage() {
    const navigate = useNavigate();
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "", email: "", password: "", passwordConfirm: "", address: "", zonecode: ""
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCompletePostcode = (data) => {
        setForm({ ...form, address: data.address, zonecode: data.zonecode });
        setIsPostcodeOpen(false);
    };

    const handleRequestVerification = async (e) => {
        e.preventDefault();
        if (form.password !== form.passwordConfirm) return alert("비밀번호가 일치하지 않습니다.");
        if (!form.address) return alert("주소를 입력해주세요.");

        setLoading(true);
        try {
            await axios.post(`${API}/email`, null, { params: { email: form.email } });
            // 입력한 폼 데이터를 그대로 들고 인증 페이지로 이동
            navigate("/verify", { state: { signupData: form } });
        } catch (error) {
            alert(error.response?.data || "메일 발송에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/10 h-16 flex items-center justify-between px-6">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <img alt="로고" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0uiTfeeEK0igrb6kOMznDzAyxO-kdW0aG4Kl37wdVmRCZsGu55l3LiRlM5NuaL26nsPMd2gJ_3pom5lSh7-wgjIn8LhlFWX-N8VBQhnXIN_cda39-ZnpD9q8A-rXf0MCIAfMDqM3tTHuRgfSqaQdU3kOGGOLjr7DK6WLV9fVnSQnDbvJRWwTlvwjQqbRRlOSAUZTzECVH_dWXowojjwTfzaAff5xDesSxi12vppc6eOaQD-HgcUGWis3kqXwAfM9YIOeUX826M4EAQ" />
                        <span className="text-primary text-xl font-extrabold headline-font hidden sm:block">우리동네국회의원</span>
                    </div>
                    <button onClick={() => navigate("/login")} className="text-on-surface-variant font-semibold hover:text-primary text-sm">로그인</button>
                </div>
            </header>

            <main className="mt-24 mb-16 w-full max-w-lg px-6">
                <section className="mb-10">
                    <h1 className="headline-font text-4xl font-extrabold text-primary mb-2">새로운 시작</h1>
                    <p className="text-on-surface-variant font-medium">더 나은 지역 사회를 위한 첫걸음을 함께하세요.</p>
                </section>

                <form className="space-y-6" onSubmit={handleRequestVerification}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">성명</label>
                            <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3.5 outline-none focus:border-primary" name="name" placeholder="홍길동" type="text" onChange={handleChange} required />
                        </div>
                        <div className="relative group">
                            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 ml-1">이메일 주소</label>
                            <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3.5 outline-none focus:border-primary" name="email" placeholder="example@citizen.kr" type="email" onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3.5 outline-none" name="password" placeholder="비밀번호" type="password" onChange={handleChange} required />
                            <input className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3.5 outline-none" name="passwordConfirm" placeholder="비밀번호 확인" type="password" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="p-6 bg-surface-container-low rounded-lg space-y-4 border border-outline-variant/20">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                            <h3 className="font-bold text-primary">주소 설정</h3>
                        </div>
                        <div className="flex gap-2">
                            <input className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 outline-none text-sm" value={form.address} placeholder="주소를 검색하세요" readOnly />
                            <button type="button" onClick={() => setIsPostcodeOpen(!isPostcodeOpen)} className="bg-primary text-on-primary px-4 rounded font-bold text-sm">주소 검색</button>
                        </div>
                        {isPostcodeOpen && <div className="border border-outline-variant/30 rounded-lg overflow-hidden"><DaumPostcode onComplete={handleCompletePostcode} /></div>}
                    </div>

                    <button className="w-full py-4 bg-primary text-on-primary font-bold rounded shadow-lg headline-font text-lg" type="submit" disabled={loading}>
                        {loading ? "전송 중..." : "인증번호 발송 및 다음"}
                    </button>
                </form>
            </main>
        </div>
    );
}