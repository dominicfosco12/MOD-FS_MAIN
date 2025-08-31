import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../services/supabaseClient'
import '../styles/Login.css'   // keep CSS separate as you prefer
import logo from '../assets/logo.png'

export default function Login() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) nav('/', { replace: true })
  }, [user, nav])

  const onSubmit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    else nav('/', { replace: true })
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center galaxy-bg">
      <div className="card border-0 shadow-lg" style={{maxWidth: 460, width: '100%'}}>
        <div className="card-body p-4">
          <div className='text-center mb-3'>
            <img src={logo} alt='MOD' style={{height:60, filter:'drop-shadow(0 0 10px rgba(90,160,255,.6))'}} />
          </div>
          <h5 className='text-center mb-1'>Sign in to MOD</h5>
          <div className='text-center text-muted mb-3' style={{fontSize:12}}>Automation • Connectivity • Performance</div>

          <form onSubmit={onSubmit}>
            <label className='form-label'>Email</label>
            <input className='form-control mb-2' type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
            <label className='form-label'>Password</label>
            <input className='form-control mb-3' type='password' value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <div className='alert alert-danger py-2'>{error}</div>}
            <button className='btn btn-primary w-100' disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className='text-center text-muted mt-2' style={{fontSize:12}}>
            Trouble signing in? Ensure your Supabase Auth user exists.
          </div>
        </div>
      </div>
    </div>
  )
}
