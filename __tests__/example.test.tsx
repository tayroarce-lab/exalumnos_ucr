import { render, screen } from '@testing-library/react'

describe('Basic Setup', () => {
  it('renders a greeting', () => {
    const Greeting = () => <h1>Hello, Exalumnos!</h1>
    render(<Greeting />)
    
    const heading = screen.getByRole('heading', { name: /hello, exalumnos!/i })
    expect(heading).toBeInTheDocument()
  })
})
