import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/services/supabaseClient'
import '@/styles/FirmChat.css'

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export default function FirmChat({ firmId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef()
  const [user, setUser] = useState(null)
  const [userMap, setUserMap] = useState({}) // user_id -> { email, initials }

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('firm_id', firmId)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)

        const userIds = [...new Set(msgs.map(m => m.user_id))]
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds)

        const map = {}
        users?.forEach(u => {
          map[u.id] = {
            email: u.email,
            initials: u.email?.[0]?.toUpperCase() || '?'
          }
        })
        setUserMap(map)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `firm_id=eq.${firmId}`
      }, async payload => {
        const msg = payload.new

        if (!userMap[msg.user_id]) {
          const { data: u } = await supabase
            .from('users')
            .select('email')
            .eq('id', msg.user_id)
            .single()

          setUserMap(prev => ({
            ...prev,
            [msg.user_id]: {
              email: u.email,
              initials: u.email?.[0]?.toUpperCase() || '?'
            }
          }))
        }

        setMessages(prev => [...prev, msg])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [firmId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user) return
    await supabase.from('messages').insert({
      message: input.trim(),
      firm_id: firmId,
      user_id: user.id
    })
    setInput('')
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const group = formatDate(msg.created_at)
    if (!acc[group]) acc[group] = []
    acc[group].push(msg)
    return acc
  }, {})

  return (
    <div className={`firm-chat ${collapsed ? 'collapsed' : ''}`}>
      <div className='chat-header' onClick={() => setCollapsed(!collapsed)}>
        Firm Chat
        <button className='collapse-btn'>{collapsed ? '▲' : '▼'}</button>
      </div>

      {!collapsed && (
        <>
          <div className='chat-messages'>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className='chat-date'>{date}</div>
                {msgs.map(msg => {
                  const meta = userMap[msg.user_id] || {}
                  return (
                    <div key={msg.id} className='chat-message'>
                      <div className='chat-avatar'>{meta.initials || '?'}</div>
                      <div className='chat-bubble'>
<span className='chat-meta'>
  <b>{meta.email?.split('@')[0] || msg.user_id.slice(0, 6)}</b>{' '}
</span>
<span className='chat-text'>{msg.message}</span>

                        <span className='timestamp'>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <div className='chat-input'>
            <input
              type='text'
              value={input}
              placeholder='Type a message...'
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  )
}
