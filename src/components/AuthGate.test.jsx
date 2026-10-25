// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AuthForm } from './AuthGate.jsx'

// vitest runs without globals, so RTL's auto-cleanup is not registered for us.
afterEach(cleanup)

const submit = () => fireEvent.submit(document.querySelector('form.auth-form'))

describe('AuthForm', () => {
  it('rejects an invalid email before calling the backend', async () => {
    const signIn = vi.fn()
    render(<AuthForm onSubmitSignIn={signIn} onSubmitSignUp={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('you@work.com'), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'secret1' } })
    submit()
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('rejects a too-short password', async () => {
    const signIn = vi.fn()
    render(<AuthForm onSubmitSignIn={signIn} onSubmitSignUp={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('you@work.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: '123' } })
    submit()
    expect(await screen.findByText('Password must be at least 6 characters.')).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('calls sign-in with the trimmed email and password', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    render(<AuthForm onSubmitSignIn={signIn} onSubmitSignUp={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('you@work.com'), { target: { value: '  arun@work.com  ' } })
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'secret1' } })
    submit()
    await vi.waitFor(() => expect(signIn).toHaveBeenCalledWith('arun@work.com', 'secret1'))
  })

  it('switches to the create-account mode', () => {
    render(<AuthForm onSubmitSignIn={vi.fn()} onSubmitSignUp={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    // tab + primary button both read "Create account" now
    expect(screen.getAllByText('Create account').length).toBeGreaterThanOrEqual(2)
  })
})
