import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage.jsx'
import { MemberBoardPage } from './pages/MemberBoardPage.jsx'
import { MemberDetailPage } from './pages/MemberDetailPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<MemberDetailPage />} path="/members/:memberId" />
        <Route element={<MemberBoardPage />} path="/members/:memberId/board" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
