import { useNavigate } from 'react-router-dom'

import illustrationImg from '../assets/images/illustration.svg'
import logoImg from '../assets/images/logo.svg'
import googleIconImg from '../assets/images/google-icon.svg'

import '../styles/auth.scss'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { FormEvent, useState } from 'react'
import { database } from '../services/firebase'
import { Toaster, toast } from 'react-hot-toast'

export function Home() {
  const navigate = useNavigate()
  const { user, signInWithGoogle } = useAuth()
  const [roomCode, setRoomCode] = useState('')

  async function handleCreateRoom() {
    if (!user) {
      await signInWithGoogle()
    }

    navigate('/rooms/new')
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault()

    if (roomCode.trim() === '') {
      toast.error('Digite o código da sala')
      return
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get()

    const roomExists = (await roomRef).exists()

    if (!roomExists) {
      toast.error('Esta sala não existe!')
      return
    }

    if (roomRef.val().endedAt) {
      toast.error('Essa sala já foi encerrada!')
      return
    }

    navigate(`/rooms/${roomCode}`)
  }

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <div id="page-auth">
        <aside>
          <img
            src={illustrationImg}
            alt="Ilustação simbolizando perguntas e respostas"
          />
          <strong>Crie salas de Q&amp;A ao-vivo</strong>
          <p>Tire as dúvidas da sua audiência em tempo-real</p>
        </aside>

        <main>
          <div className="main-content">
            <img src={logoImg} alt="Letmeask" />
            <button onClick={handleCreateRoom} className="create-room">
              <img src={googleIconImg} alt="Logo do Google" />
              Crie sua sala com o google
            </button>
            <div className="separator">Ou entre na sala</div>
            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                placeholder="Digite o código da sala"
                onChange={event => setRoomCode(event.target.value)}
                value={roomCode}
              />
              <Button type="submit">Entrar na sala</Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
