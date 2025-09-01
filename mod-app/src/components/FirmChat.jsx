import { useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/FirmChat.css'

export default function FirmChat({ firmId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef()
  const [user, setUser] = useState(null)
  const [userMap, setUserMap] = useState({}) // 🧠 user_id -> email

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

        // 🧠 Get distinct user_ids from messages
        const userIds = [...new Set(msgs.map(m => m.user_id))]

        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds)

        const map = {}
        users?.forEach(u => map[u.id] = u.email)
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

        // Fetch email only if unknown
        if (!userMap[msg.user_id]) {
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', msg.user_id)
            .single()
          setUserMap(prev => ({ ...prev, [msg.user_id]: user.email }))
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

  return (
    <div className='firm-chat'>
      <div className='chat-header'>Firm Chat</div>
      <div className='chat-messages'>
        {messages.map(msg => (
          <div key={msg.id} className='chat-message'>
            <span className='chat-meta'>
              <b>{userMap[msg.user_id]?.split('@')[0] || msg.user_id.slice(0, 6)}</b>:
            </span>
            <span className='chat-text'>{msg.message}</span>
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
    </div>
  )
}
