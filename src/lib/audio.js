// Browser audio capture: the playback blob (MediaRecorder) + a pitch series
// (Web Audio autocorrelation) so we can score intonation variety on-device.
// No audio leaves the device in the MVP.

export function isRecordingSupported() {
  return typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
}

/**
 * Pure pitch estimate for one frame of time-domain audio, via autocorrelation.
 * Returns Hz or -1 when there is no confident pitch. Exported for testing.
 */
export function autocorrelatePitch(buf, sampleRate) {
  const SIZE = buf.length
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1 // too quiet

  let r1 = 0
  let r2 = SIZE - 1
  const thres = 0.2
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break }

  const b = buf.slice(r1, r2)
  const n = b.length
  if (n < 8) return -1
  const c = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) c[i] += b[j] * b[j + i]
  }
  let d = 0
  while (c[d] > c[d + 1]) d += 1
  let maxval = -1
  let maxpos = -1
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i }
  }
  let T0 = maxpos
  if (T0 === 0) return -1
  const x1 = c[T0 - 1] || 0
  const x2 = c[T0]
  const x3 = c[T0 + 1] || 0
  const a = (x1 + x3 - 2 * x2) / 2
  const bb = (x3 - x1) / 2
  if (a) T0 = T0 - bb / (2 * a)
  const hz = sampleRate / T0
  if (hz < 60 || hz > 500) return -1
  return hz
}

/**
 * Start a recording attempt. Returns a controller:
 *   { start(), stop() -> Promise<{blob,url,durationSec,pitchHz}>, cancel(), onElapsed }
 */
export function createAttempt({ onElapsed } = {}) {
  let stream, recorder, chunks = []
  let ctx, analyser, source, timer, pitchTimer
  let startedAt = 0
  const pitchHz = []
  let dataArr

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }

    ctx = new (window.AudioContext || window.webkitAudioContext)()
    source = ctx.createMediaStreamSource(stream)
    analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    dataArr = new Float32Array(analyser.fftSize)
    source.connect(analyser)

    pitchTimer = setInterval(() => {
      analyser.getFloatTimeDomainData(dataArr)
      const hz = autocorrelatePitch(dataArr, ctx.sampleRate)
      if (hz > 0) pitchHz.push(hz)
    }, 100)

    startedAt = Date.now()
    timer = setInterval(() => { if (onElapsed) onElapsed((Date.now() - startedAt) / 1000) }, 200)
    recorder.start()
  }

  function teardown() {
    clearInterval(timer)
    clearInterval(pitchTimer)
    if (stream) stream.getTracks().forEach((t) => t.stop())
    if (ctx) ctx.close()
  }

  function stop() {
    return new Promise((resolve) => {
      const finish = () => {
        const durationSec = (Date.now() - startedAt) / 1000
        const blob = new Blob(chunks, { type: 'audio/webm' })
        teardown()
        resolve({ blob, url: URL.createObjectURL(blob), durationSec, pitchHz: pitchHz.slice() })
      }
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = finish
        recorder.stop()
      } else {
        finish()
      }
    })
  }

  function cancel() {
    try { if (recorder && recorder.state !== 'inactive') recorder.stop() } catch {}
    teardown()
  }

  return { start, stop, cancel }
}
