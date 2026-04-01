// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComplexityResult from '../ComplexityResult';

// Mock ComplexityChart to avoid recharts rendering complexity
vi.mock('../ComplexityChart', () => ({
  default: ({ predictedComplexity }: { predictedComplexity?: string }) => (
    <div data-testid="complexity-chart" data-complexity={predictedComplexity} />
  ),
}));

// Mock react-katex InlineMath to avoid LaTeX rendering
vi.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => <span data-testid="inline-math">{math}</span>,
}));

// Mock katex css
vi.mock('katex/dist/katex.min.css', () => ({}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockResult = {
  timeComplexity: 'O(n)',
  timeExplanation: 'The algorithm iterates over n elements once.',
  spaceComplexity: 'O(1)',
  spaceExplanation: 'No additional data structures are used.',
  suggestions: ['Use memoization', 'Consider a hash map'],
};

describe('ComplexityResult component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when result is null', () => {
    const { container } = render(
      <ComplexityResult result={null} code="const x = 1;" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders time complexity section', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    expect(screen.getByText('Time Complexity')).toBeInTheDocument();
    expect(screen.getByText(mockResult.timeExplanation)).toBeInTheDocument();
  });

  it('renders space complexity section', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    expect(screen.getByText('Space Complexity')).toBeInTheDocument();
    expect(screen.getByText(mockResult.spaceExplanation)).toBeInTheDocument();
  });

  it('renders optimization suggestions when present', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Use memoization')).toBeInTheDocument();
    expect(screen.getByText('Consider a hash map')).toBeInTheDocument();
  });

  it('does not render optimization suggestions section when suggestions is empty', () => {
    const resultNoSuggestions = { ...mockResult, suggestions: [] };
    render(<ComplexityResult result={resultNoSuggestions} code="const x = 1;" />);
    expect(screen.queryByText('Optimization Suggestions')).not.toBeInTheDocument();
  });

  it('renders the ComplexityChart with the timeComplexity', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    const chart = screen.getByTestId('complexity-chart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('data-complexity', 'O(n)');
  });

  it('renders feedback section with thumbs up and thumbs down buttons', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText("Yes, I think it's correct")).toBeInTheDocument();
    expect(screen.getByText("No, I don't think so")).toBeInTheDocument();
  });

  it('renders formatted time complexity via InlineMath', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    const mathEls = screen.getAllByTestId('inline-math');
    expect(mathEls.length).toBeGreaterThanOrEqual(1);
  });

  it('formats O(n^2) complexity to LaTeX O(n^{2}) for InlineMath', () => {
    const resultWithQuadratic = { ...mockResult, timeComplexity: 'O(n^2)', spaceComplexity: 'O(n^2)' };
    render(<ComplexityResult result={resultWithQuadratic} code="for(i)for(j){}" />);
    const mathEls = screen.getAllByTestId('inline-math');
    expect(mathEls[0].textContent).toBe('O(n^{2})');
  });

  it('does not format O(n) since there is no ^ in it', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    const mathEls = screen.getAllByTestId('inline-math');
    expect(mathEls[0].textContent).toBe('O(n)');
  });

  it('initially shows feedback buttons (not submitted state)', () => {
    render(<ComplexityResult result={mockResult} code="const x = 1;" />);
    expect(screen.queryByText(/Thank you for your feedback!/)).not.toBeInTheDocument();
    expect(screen.getByText("Yes, I think it's correct")).toBeInTheDocument();
  });

  describe('handleFeedback - successful submission', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Feedback saved successfully' }),
      });
    });

    it('calls fetch with correct URL and method on thumbs up click', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct");
      await userEvent.click(thumbsUpBtn);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/analysis/feedback',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('sends correct body with isCorrect=true on thumbs up click', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct");
      await userEvent.click(thumbsUpBtn);

      const calls = vi.mocked(global.fetch).mock.calls;
      const body = JSON.parse(calls[0][1]?.body as string);
      expect(body.isCorrect).toBe(true);
      expect(body.code).toBe('function foo() {}');
      expect(body.timeComplexity).toBe('O(n)');
    });

    it('sends correct body with isCorrect=false on thumbs down click', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsDownBtn = screen.getByText("No, I don't think so");
      await userEvent.click(thumbsDownBtn);

      const calls = vi.mocked(global.fetch).mock.calls;
      const body = JSON.parse(calls[0][1]?.body as string);
      expect(body.isCorrect).toBe(false);
    });

    it('shows success message after feedback is submitted', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct");
      await userEvent.click(thumbsUpBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Thank you for your feedback! This helps us improve.')
        ).toBeInTheDocument();
      });
    });

    it('hides feedback buttons after successful submission', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct");
      await userEvent.click(thumbsUpBtn);

      await waitFor(() => {
        expect(screen.queryByText("Yes, I think it's correct")).not.toBeInTheDocument();
        expect(screen.queryByText("No, I don't think so")).not.toBeInTheDocument();
      });
    });

    it('calls toast.success after successful feedback submission', async () => {
      const { toast } = await import('sonner');
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct");
      await userEvent.click(thumbsUpBtn);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Thank you for your feedback!');
      });
    });

    it('includes all result fields in the feedback body', async () => {
      render(<ComplexityResult result={mockResult} code="const code = 1;" />);
      await userEvent.click(screen.getByText("Yes, I think it's correct"));

      const body = JSON.parse(
        vi.mocked(global.fetch).mock.calls[0][1]?.body as string
      );
      expect(body.spaceComplexity).toBe('O(1)');
      expect(body.timeExplanation).toBe(mockResult.timeExplanation);
      expect(body.spaceExplanation).toBe(mockResult.spaceExplanation);
      expect(body.suggestions).toEqual(['Use memoization', 'Consider a hash map']);
    });
  });

  describe('handleFeedback - failed submission', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Internal Server Error' }),
      });
    });

    it('calls toast.error when fetch returns non-ok response', async () => {
      const { toast } = await import('sonner');
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      await userEvent.click(screen.getByText("Yes, I think it's correct"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to submit feedback. Please try again.'
        );
      });
    });

    it('does not switch to submitted state when fetch fails', async () => {
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      await userEvent.click(screen.getByText("Yes, I think it's correct"));

      await waitFor(() => {
        expect(screen.queryByText('Thank you for your feedback! This helps us improve.')).not.toBeInTheDocument();
        expect(screen.getByText("Yes, I think it's correct")).toBeInTheDocument();
      });
    });

    it('calls toast.error when fetch throws a network error', async () => {
      const { toast } = await import('sonner');
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<ComplexityResult result={mockResult} code="function foo() {}" />);
      await userEvent.click(screen.getByText("Yes, I think it's correct"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to submit feedback. Please try again.'
        );
      });
    });
  });

  describe('feedback buttons disabled state', () => {
    it('buttons are not disabled initially', () => {
      render(<ComplexityResult result={mockResult} code="const x = 1;" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct").closest('button');
      const thumbsDownBtn = screen.getByText("No, I don't think so").closest('button');
      expect(thumbsUpBtn).not.toBeDisabled();
      expect(thumbsDownBtn).not.toBeDisabled();
    });

    it('buttons become disabled while submitting', async () => {
      let resolveFetch: (value: unknown) => void;
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      render(<ComplexityResult result={mockResult} code="const x = 1;" />);
      const thumbsUpBtn = screen.getByText("Yes, I think it's correct").closest('button')!;

      fireEvent.click(thumbsUpBtn);

      // While pending, buttons should be disabled
      await waitFor(() => {
        expect(thumbsUpBtn).toBeDisabled();
      });

      // Resolve fetch to clean up
      resolveFetch!({ ok: true, json: async () => ({}) });
    });
  });
});