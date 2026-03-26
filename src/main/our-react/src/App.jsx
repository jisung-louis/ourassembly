import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// 임시 Home 컴포넌트 (로그인 성공 후 이동 확인용)
const Home = () => (
    <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">우리동네국회의원 메인 페이지</h1>
    </div>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* 기본 경로를 로그인 페이지로 설정 */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* 인증 관련 경로 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />

                {/* 서비스 메인 경로 (로그인 성공 후 navigate('/home') 처리 시 필요) */}
                <Route path="/home" element={<Home />} />

                {/* 404 페이지 처리 (선택 사항) */}
                <Route path="*" element={<div className="p-10 text-center">페이지를 찾을 수 없습니다.</div>} />
            </Routes>
        </Router>
    );
}

export default App;