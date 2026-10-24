// Component smoke test: renders the REAL App tree headlessly via the React
// server renderer (no DOM/browser needed). This proves every component imports
// and renders without crashing, and that the default view is correct.
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App.jsx'
import DrillsView from './components/DrillsView.jsx'
import PlanView from './components/PlanView.jsx'

describe('App renders', () => {
  const html = renderToStaticMarkup(<App />)

  it('shows the brand and tagline', () => {
    expect(html).toContain('Articulation Coach')
    expect(html).toContain('10 minutes a day')
  })

  it('renders all four navigation tabs', () => {
    for (const label of ['Session', 'Progress', 'Plan', 'Drills']) {
      expect(html).toContain(label)
    }
  })

  it('opens on the daily session with its four blocks', () => {
    expect(html).toContain('Breath')
    expect(html).toContain('Warm-up')
    expect(html).toContain('Precision drill')
    expect(html).toContain('Speak &amp; record')
  })

  it('shows the week milestone in the plan style', () => {
    expect(html).toContain('milestone')
    expect(html).toContain('This week')
  })
})

describe('Drills library', () => {
  const html = renderToStaticMarkup(<DrillsView />)
  it('lists every drill with its how-to', () => {
    expect(html).toContain('Drill library')
    expect(html).toContain('Last-Sound reading')
    expect(html).toContain('pa-ta-ka')
    expect(html).toContain('Shadowing')
  })
  it('tags phoneme-targeted drills', () => {
    expect(html).toContain('>r<')
    expect(html).toContain('>th<')
  })
})

describe('3-month plan', () => {
  const html = renderToStaticMarkup(<PlanView sessions={[]} />)
  it('renders three months and 12 weeks', () => {
    expect(html).toContain('Month 1')
    expect(html).toContain('Month 2')
    expect(html).toContain('Month 3')
    expect(html).toContain('Week 12')
  })
  it('marks the current week', () => {
    expect(html).toContain('now')
  })
})
