// Thin wrapper over the Web Speech API for live transcription. Chrome/Edge/Safari
// expose it as webkitSpeechRecognition; Firefox does not. When unavailable the app
// still records audio and playback — it just cannot auto-score delivery.

export function isSpeechSupported() {
  return typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Create a recogniser. Returns { start(), stop(), supported }.
 * Callbacks: onTranscript(fullFinalText), onInterim(text), onError(err)
 */
export function createRecognizer({ onTranscript, onInterim, onError } = {}) {
  const Ctor = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  if (!Ctor) return { supported: false, start() {}, stop() {} }

  const rec = new Ctor()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = 'en-US'
  let finalText = ''

  rec.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i]
      if (res.isFinal) finalText += res[0].transcript + ' '
      else interim += res[0].transcript
    }
    if (onInterim) onInterim(interim)
    if (onTranscript) onTranscript(finalText.trim())
  }
  rec.onerror = (e) => { if (onError) onError(e) }

  return {
    supported: true,
    start() { try { rec.start() } catch {} },
    stop() { try { rec.stop() } catch {} },
    get transcript() { return finalText.trim() }
  }
}
