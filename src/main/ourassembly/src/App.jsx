import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage.jsx'
import { CongressOpinionPage } from './pages/CongressOpinionPage.jsx'
import { CongressDetailPage } from './pages/CongressDetailPage.jsx'

function App() {
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
