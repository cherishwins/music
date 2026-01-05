'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, Loader2, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
}

interface VoiceChatProps {
  onMessage?: (message: Message) => void
  className?: string
}

export function VoiceChat({ onMessage, className = '' }: VoiceChatProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudio(audioBlob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Microphone access denied')
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  // Process audio through API
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('history', JSON.stringify(messages))

      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process voice')
      }

      const data = await response.json()

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: data.transcription,
      }

      // Add assistant message with audio
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.text,
        audioUrl: `data:audio/mp3;base64,${data.audio.data}`,
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])
      onMessage?.(userMessage)
      onMessage?.(assistantMessage)

      // Auto-play response
      playAudio(assistantMessage.audioUrl!)
    } catch (err) {
      console.error('Voice processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process voice')
    } finally {
      setIsProcessing(false)
    }
  }

  // Send text message
  const sendTextMessage = async () => {
    if (!textInput.trim() || isProcessing) return

    setIsProcessing(true)
    setError(null)

    const userContent = textInput.trim()
    setTextInput('')

    try {
      const response = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userContent,
          history: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      const userMessage: Message = { role: 'user', content: userContent }
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.text,
        audioUrl: `data:audio/mp3;base64,${data.audio.data}`,
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])
      onMessage?.(userMessage)
      onMessage?.(assistantMessage)

      playAudio(assistantMessage.audioUrl!)
    } catch (err) {
      console.error('Text message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsProcessing(false)
    }
  }

  // Play audio response
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => {
      setIsPlaying(false)
      setError('Failed to play audio')
    }

    audio.play()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 py-8">
            <Volume2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Press and hold to talk to White Tiger AI</p>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <p>{message.content}</p>
              {message.audioUrl && (
                <button
                  onClick={() => playAudio(message.audioUrl!)}
                  className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  Play
                </button>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-zinc-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-zinc-800 p-4">
        {/* Text input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
            placeholder="Type a message..."
            disabled={isProcessing || isRecording}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={sendTextMessage}
            disabled={!textInput.trim() || isProcessing}
            className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Voice button */}
        <div className="flex justify-center">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-200 select-none
              ${isRecording
                ? 'bg-red-600 scale-110 animate-pulse'
                : isProcessing
                ? 'bg-zinc-700 cursor-not-allowed'
                : 'bg-zinc-800 hover:bg-zinc-700 active:scale-95'
              }
            `}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-2">
          {isRecording ? 'Release to send' : 'Hold to talk'}
        </p>
      </div>
    </div>
  )
}

export default VoiceChat
