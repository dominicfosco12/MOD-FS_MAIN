import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './routes/ProtectedRoute'
import HomeGalaxy from './pages/HomeGalaxy'
import Login from './pages/Login'
import Testing from './components/Testing'



export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<HomeGalaxy />} />
            <Route path="/testing" element={<Testing />} />

            {/* add more protected routes here */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
