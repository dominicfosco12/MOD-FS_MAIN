import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'grid', placeItems:'center', color:'#9fb0d3'}}>
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to='/login' replace />

  return <Outlet />
}
