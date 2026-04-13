import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/Home/HomePage.jsx'
import { CongressOpinionPage } from './pages/CongressOpinion/CongressOpinionPage.jsx'
import { CongressDetailPage } from './pages/CongressDetail/CongressDetailPage.jsx'
import { CommunityLayout } from './pages/Community/CommunityLayout.jsx'
import { MyPagePage } from './pages/Community/MyPagePage.jsx'
import { useFcm } from './components/Notification/usefcm.js';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage.jsx'
import '../src/firebase.js'
function App() {
  useFcm();

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<HomePage />} path="/" />
                <Route element={<CongressDetailPage />} path="/members/:memberId" />
                <Route element={<CongressOpinionPage />} path="/members/:memberId/board" />
                <Route path="/community/*" element={<CommunityLayout />} />
                <Route path="/mypage" element={<MyPagePage />} />
                <Route element={<Navigate replace to="/" />} path="*" />
                <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App