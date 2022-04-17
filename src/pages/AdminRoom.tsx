import { useNavigate, useParams } from 'react-router-dom'

import logoImg from '../assets/images/logo.svg'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'

import { Button } from '../components/Button'
import { Question } from '../components/Question'
import { RoomCode } from '../components/RoomCode'
// import { useAuth } from '../hooks/useAuth'

import '../styles/room.scss'
import '../styles/modal.scss'

import { useState } from 'react'
import { useRoom } from '../hooks/useRoom'
import { database } from '../services/firebase'
import { Toaster, toast } from 'react-hot-toast'
import Modal from 'react-modal'

Modal.setAppElement('#root')

type RoomParams = {
  id: string
}

type modalContentTypes = {
  title: string
  subtitle: string
  button: string
}

type modalFunction = {
  func: Function
  params?: string
}

export function AdminRoom() {
  // const { user } = useAuth()
  const [modalIsOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<modalContentTypes>()
  const [modalFunction, setModalFunction] = useState<modalFunction>()
  const navigate = useNavigate()
  const params = useParams<RoomParams>()
  const roomId = params.id

  const { title, questions } = useRoom(roomId as string)

  const modalConfigs = {
    deleteQuestion: {
      title: 'Excluir Pergunta',
      subtitle: 'Tem certeza que deseja excluir essa pergunta?',
      button: 'Sim, excluir'
    },
    deleteRoom: {
      title: 'Encerrar sala',
      subtitle: 'Tem certeza que deseja encerrar essa sala?',
      button: 'Sim, encerrar'
    }
  }

  function openModal() {
    setIsOpen(true)
  }
  function closeModal() {
    setIsOpen(false)
  }

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date()
    })

    navigate('/')
  }

  async function handleCheckQuestionsAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true
    })
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true
    })
  }

  async function handleDeleteQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
  }

  return (
    <div>
      <div>
        <Toaster />
      </div>
      <div id="page-room">
        <header>
          <div className="content">
            <img src={logoImg} alt="Letmeask" />
            <div>
              <div onClick={() => toast.success('Código da sala copiado!')}>
                <RoomCode code={roomId as string} />
              </div>
              <Button
                isOutlined
                onClick={() => {
                  setModalFunction({
                    func: handleEndRoom
                  })
                  setModalContent(modalConfigs.deleteRoom)
                  openModal()
                }}
              >
                Encerrar Sala
              </Button>
            </div>
          </div>
        </header>

        <main>
          <div className="room-title">
            <h1>{title}</h1>
            {questions.length > 0 && (
              <span>{questions.length} Pergunta(s)</span>
            )}
          </div>

          <div className="question-list">
            {questions.map(question => {
              return (
                <Question
                  key={question.id}
                  content={question.content}
                  author={question.author}
                  isAnswered={question.isAnswered}
                  isHighlighted={question.isHighlighted}
                >
                  {!question.isAnswered && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleCheckQuestionsAsAnswered(question.id)
                        }
                      >
                        <img
                          src={checkImg}
                          alt="Marcar pergunta como respondida"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHighlightQuestion(question.id)}
                      >
                        <img src={answerImg} alt="Dar destaque a pergunta" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalFunction({
                        func: handleDeleteQuestion,
                        params: question.id
                      })
                      setModalContent(modalConfigs.deleteQuestion)
                      openModal()
                    }}
                  >
                    <img src={deleteImg} alt="Remover pergunta" />
                  </button>
                </Question>
              )
            })}
          </div>
        </main>
      </div>
      <div className="modal">
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Excluir pergunta"
          className="Modal"
          overlayClassName="Overlay"
        >
          <h2>{modalContent?.title}</h2>
          <p>{modalContent?.subtitle}</p>
          <div className="buttons">
            <button onClick={() => closeModal()}>Cancelar</button>
            <button
              onClick={async () => {
                await modalFunction?.func(modalFunction.params)
                closeModal()
              }}
            >
              {modalContent?.button}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
