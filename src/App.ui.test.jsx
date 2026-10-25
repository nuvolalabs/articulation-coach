// @vitest-environment jsdom
// Real UI test: renders the App in a DOM and drives it with clicks, the way a
// user would. MediaRecorder/mediaDevices are stubbed so the Recorder component
// mounts (we don't start a real recording).
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from './App.jsx'

beforeAll(() => {
  global.MediaRecorder = class {
    start() {}
    stop() { if (this.onstop) this.onstop() }
  }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => ({ getTracks: () => [] }) }
  })
})

beforeEach(() => {
  localStorage.clear()
  cleanup()
})

const goToSpeakStep = () => {
  fireEvent.click(screen.getByText('Next block →'))
  fireEvent.click(screen.getByText('Next block →'))
  fireEvent.click(screen.getByText('Next block →'))
}

describe('App shell + navigation', () => {
  it('renders the brand and all four tabs', () => {
    render(<App />)
    expect(screen.getByText('Articulation Coach')).toBeTruthy()
    for (const t of ['Session', 'Progress', 'Plan', 'Drills']) {
      expect(screen.getByText(t)).toBeTruthy()
    }
  })

  it('switches between every tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Drills'))
    expect(screen.getByText('Drill library')).toBeTruthy()

    fireEvent.click(screen.getByText('Plan'))
    expect(screen.getByText('Your 3-month programme')).toBeTruthy()

    fireEvent.click(screen.getAllByText('Progress')[0])
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeTruthy()
  })

  it('shows the signed-in user and a sign-out control', () => {
    render(<App user={{ email: 'arun@work.com' }} onSignOut={() => {}} />)
    expect(screen.getByText('arun@work.com')).toBeTruthy()
    expect(screen.getByText('Sign out')).toBeTruthy()
  })
})

describe('Daily session flow', () => {
  it('advances through the four blocks', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Breath' })).toBeTruthy()
    fireEvent.click(screen.getByText('Next block →'))
    expect(screen.getByRole('heading', { name: 'Warm-up' })).toBeTruthy()
    fireEvent.click(screen.getByText('Next block →'))
    expect(screen.getByRole('heading', { name: 'Precision drill' })).toBeTruthy()
    fireEvent.click(screen.getByText('Next block →'))
    expect(screen.getByRole('heading', { name: 'Speak & record' })).toBeTruthy()
    expect(screen.getByText('Finish session')).toBeTruthy()
  })

  it('shows a speaking prompt and can shuffle it', () => {
    render(<App />)
    goToSpeakStep()
    expect(screen.getByText('Speak to this')).toBeTruthy()
    const before = document.querySelector('.prompt-text').textContent
    expect(before.length).toBeGreaterThan(0)
    fireEvent.click(screen.getByText('↻ New prompt'))
    expect(document.querySelector('.prompt-text').textContent.length).toBeGreaterThan(0)
  })

  it('lets the user switch prompt packs', () => {
    render(<App />)
    goToSpeakStep()
    fireEvent.click(screen.getByText('Sales & pitches'))
    expect(screen.getByText('Sales & pitches').className).toContain('active')
  })
})

describe('Progress from saved sessions', () => {
  it('shows average clarity and compliance for a given history', () => {
    render(<App sessions={[
      { id: 'a', ts: Date.now(), score: 72, prompt: 'update' },
      { id: 'b', ts: Date.now() - 86400000, score: 66, prompt: 'pitch' }
    ]} />)
    fireEvent.click(screen.getAllByText('Progress')[0])
    expect(screen.getByText('69')).toBeTruthy() // (72 + 66) / 2
    expect(screen.getByText('30-day compliance')).toBeTruthy()
    expect(screen.getByText('day streak')).toBeTruthy()
  })
})
