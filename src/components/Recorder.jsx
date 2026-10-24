import { useEffect, useRef, useState } from 'react'
import { createAttempt, isRecordingSupported } from '../lib/audio.js'
import { createRecognizer, isSpeechSupported } from '../lib/speech.js'
import { analyze } from '../lib/analysis.js'

/**
 * Records one attempt: live timer, live transcript (when the browser supports
 * the Web Speech API) and on-device analysis. Calls onAttempt with the result.
 */
export default function Recorder({ prompt, onAttempt }) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const attemptRef = useRef(null)
  const recogRef = useRef(null)
  const transcriptRef = useRef('')
  const busyRef = useRef(false)

  const recSupported = isRecordingSupported()
  const speechOk = isSpeechSupported()

  useEffect(() => () => { if (attemptRef.current) attemptRef.current.cancel() }, [])

  async function start() {
    setError('')
    setTranscript('')
    transcriptRef.current = ''
    setElapsed(0)
    try {
      const attempt = createAttempt({ onElapsed: setElapsed })
      await attempt.start()
      attemptRef.current = attempt
      if (speechOk) {
        const recog = createRecognizer({
          onTranscript: (t) => { transcriptRef.current = t; setTranscript(t) },
          onInterim: (t) => setTranscript((transcriptRef.current + ' ' + t).trim()),
          onError: () => {}
        })
        recog.start()
        recogRef.current = recog
      }
      setRecording(true)
    } catch {
      setError('Microphone permission denied or unavailable. Allow access and try again.')
    }
  }

  async function stop() {
    if (busyRef.current) return
    busyRef.current = true
    setRecording(false)
    try { if (recogRef.current) recogRef.current.stop() } catch {}
    const outcome = await attemptRef.current.stop()
    const transcript = (transcriptRef.current || '').trim()
    const result = analyze({
      transcript,
      durationSec: outcome.durationSec,
      pitchHz: outcome.pitchHz
    })
    busyRef.current = false
    onAttempt({ result, playbackUrl: outcome.url, transcript, durationSec: outcome.durationSec })
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0')
  const ss = String(Math.floor(elapsed % 60)).padStart(2, '0')

  if (!recSupported) {
    return (
      <div className="card warn">
        This browser can’t capture audio. Open the app in Chrome, Edge or Safari on a
        device with a microphone.
      </div>
    )
  }

  return (
    <div className="recorder">
      <div className="prompt-box">
        <div className="prompt-label">Speak to this</div>
        <div className="prompt-text">{prompt}</div>
      </div>

      <div className={recording ? 'rec-timer live' : 'rec-timer'}>
        <span className="rec-dot" /> {mm}:{ss}
      </div>

      {transcript && <div className="transcript">{transcript}</div>}

      {!speechOk && (
        <div className="hint">
          Live transcription isn’t available in this browser, so delivery metrics will be
          limited. Recording + playback still work.
        </div>
      )}
      {error && <div className="error">{error}</div>}

      <button className={recording ? 'btn stop' : 'btn record'} onClick={recording ? stop : start}>
        {recording ? 'Stop & analyse' : 'Record attempt'}
      </button>
    </div>
  )
}
