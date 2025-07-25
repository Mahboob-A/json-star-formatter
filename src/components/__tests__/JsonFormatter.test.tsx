import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JsonFormatter from '../JsonFormatter'

// Mock the toast hook
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('JsonFormatter', () => {
  beforeEach(() => {
    mockToast.mockClear()
  })

  it('renders correctly', () => {
    render(<JsonFormatter />)
    expect(screen.getByText('JSON Formatter & Validator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
  })

  it('validates valid JSON', async () => {
    const user = userEvent.setup()
    render(<JsonFormatter />)
    
    const textarea = screen.getByPlaceholderText('Paste your JSON here...')
    await user.type(textarea, '{"name": "test"}')
    
    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument()
    })
  })

  it('shows error for invalid JSON', async () => {
    const user = userEvent.setup()
    render(<JsonFormatter />)
    
    const textarea = screen.getByPlaceholderText('Paste your JSON here...')
    await user.type(textarea, '{"name": "test"')
    
    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument()
    })
  })

  it('loads example JSON', async () => {
    const user = userEvent.setup()
    render(<JsonFormatter />)
    
    const loadExampleButton = screen.getByText('Load Example')
    await user.click(loadExampleButton)
    
    const textarea = screen.getByPlaceholderText('Paste your JSON here...')
    expect(textarea).toHaveValue(expect.stringContaining('"name": "JSON Formatter"'))
  })

  it('clears all content', async () => {
    const user = userEvent.setup()
    render(<JsonFormatter />)
    
    const textarea = screen.getByPlaceholderText('Paste your JSON here...')
    await user.type(textarea, '{"test": true}')
    
    const clearButton = screen.getByText('Clear')
    await user.click(clearButton)
    
    expect(textarea).toHaveValue('')
  })

  it('switches between formatted and minified output', async () => {
    const user = userEvent.setup()
    render(<JsonFormatter />)
    
    const textarea = screen.getByPlaceholderText('Paste your JSON here...')
    await user.type(textarea, '{"name":"test","value":123}')
    
    await waitFor(() => {
      expect(screen.getByText('Formatted')).toBeInTheDocument()
      expect(screen.getByText('Minified')).toBeInTheDocument()
    })
    
    const minifiedButton = screen.getByText('Minified')
    await user.click(minifiedButton)
    
    expect(screen.getByText('Copy Minified')).toBeInTheDocument()
  })
})