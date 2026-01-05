import { NextRequest, NextResponse } from 'next/server'
import { generateVoiceResponse } from '@/lib/ai-gateway'
import { generateSpeech, VOICES } from '@/lib/voice'

/**
 * Voice Chat API - WhatsApp-style voice AI
 *
 * Flow:
 * 1. User sends audio → Whisper transcription
 * 2. Transcribed text → AI Gateway (Grok/Claude)
 * 3. AI response → ElevenLabs voice synthesis
 * 4. Return audio response
 *
 * Supports both:
 * - Audio input (full voice chat)
 * - Text input (for testing/accessibility)
 */

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const formData = new FormData()
  const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Transcription failed: ${error}`)
  }

  const result = await response.json()
  return result.text
}

// Alternative: Use Groq for faster transcription
async function transcribeWithGroq(audioBuffer: Buffer): Promise<string> {
  const formData = new FormData()
  const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-large-v3')

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq transcription failed: ${error}`)
  }

  const result = await response.json()
  return result.text
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let userMessage: string
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
    let voiceId = 'adam'

    // Handle audio input
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const audioFile = formData.get('audio') as File | null
      const historyJson = formData.get('history') as string | null
      const voice = formData.get('voice') as string | null

      if (!audioFile) {
        return NextResponse.json(
          { error: 'Audio file required' },
          { status: 400 }
        )
      }

      if (voice && VOICES[voice as keyof typeof VOICES]) {
        voiceId = voice
      }

      if (historyJson) {
        try {
          conversationHistory = JSON.parse(historyJson)
        } catch {
          // Ignore invalid history
        }
      }

      // Get audio buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

      // Transcribe (prefer Groq for speed, fallback to OpenAI)
      if (process.env.GROQ_API_KEY) {
        userMessage = await transcribeWithGroq(audioBuffer)
      } else if (process.env.OPENAI_API_KEY) {
        userMessage = await transcribeAudio(audioBuffer)
      } else {
        return NextResponse.json(
          { error: 'No transcription API configured' },
          { status: 500 }
        )
      }
    }
    // Handle JSON input (text-based)
    else {
      const body = await request.json()
      userMessage = body.message
      conversationHistory = body.history || []
      voiceId = body.voice || 'adam'

      if (!userMessage) {
        return NextResponse.json(
          { error: 'Message required' },
          { status: 400 }
        )
      }
    }

    // Ensure we have ElevenLabs configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Voice synthesis not configured' },
        { status: 500 }
      )
    }

    // Generate AI response (optimized for voice)
    const aiResponse = await generateVoiceResponse({
      userMessage,
      conversationHistory,
      context: {
        app: 'creative-hub',
        userTier: 'member', // TODO: Get from auth
      },
    })

    // Generate voice audio
    const audioBuffer = await generateSpeech(
      aiResponse.text,
      voiceId as keyof typeof VOICES,
      {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.3, // Natural conversational style
      }
    )

    // Return complete response
    return NextResponse.json({
      // Original transcription (if audio input)
      transcription: userMessage,

      // AI response
      response: {
        text: aiResponse.text,
        shouldSpeak: aiResponse.shouldSpeak,
        suggestedActions: aiResponse.suggestedActions,
      },

      // Voice output
      audio: {
        data: audioBuffer.toString('base64'),
        format: 'mp3',
        voiceId,
      },

      // Updated conversation history
      history: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse.text },
      ],
    })

  } catch (error) {
    console.error('Voice chat error:', error)
    const message = error instanceof Error ? error.message : 'Voice chat failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Get endpoint info
export async function GET() {
  return NextResponse.json({
    name: 'Voice Chat API',
    description: 'WhatsApp-style voice AI assistant',
    endpoints: {
      'POST /api/voice/chat': {
        description: 'Send voice or text, receive AI voice response',
        inputs: {
          audio: 'multipart/form-data with audio file (webm, mp3, wav)',
          text: 'JSON with { message, history?, voice? }',
        },
        outputs: {
          transcription: 'What the user said',
          response: 'AI text response',
          audio: 'Base64 encoded MP3 voice response',
          history: 'Updated conversation history',
        },
      },
    },
    voices: Object.keys(VOICES),
  })
}
