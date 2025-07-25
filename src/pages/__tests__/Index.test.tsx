import { render, screen } from '@testing-library/react'
import Index from '../Index'

// Mock JsonFormatter component
vi.mock('@/components/JsonFormatter', () => ({
  default: () => <div data-testid="json-formatter">JsonFormatter Component</div>
}))

describe('Index Page', () => {
  it('renders JsonFormatter component', () => {
    render(<Index />)
    expect(screen.getByTestId('json-formatter')).toBeInTheDocument()
  })
})