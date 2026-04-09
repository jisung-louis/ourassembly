import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/Home/HomePage.jsx'
import { CongressOpinionPage } from './pages/CongressOpinion/CongressOpinionPage.jsx'
import { CongressDetailPage } from './pages/CongressDetail/CongressDetailPage.jsx'
import { useFcm } from './components/Notification/useFcm.js';

function App() {
  useFcm();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<CongressDetailPage />} path="/members/:memberId" />
        <Route element={<CongressOpinionPage />} path="/members/:memberId/board" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
