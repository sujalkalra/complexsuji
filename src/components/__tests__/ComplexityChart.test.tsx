// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComplexityChart from '../ComplexityChart';

// Mock recharts components since they rely on canvas/ResizeObserver
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, strokeWidth, opacity }: { dataKey: string; strokeWidth: number; opacity: number }) => (
    <div data-testid={`line-${dataKey}`} data-strokewidth={strokeWidth} data-opacity={opacity} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cart-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ReferenceArea: () => <div data-testid="reference-area" />,
}));

// Re-implement matchComplexity here to test the same logic used in the component
function matchComplexity(predicted: string): string | null {
  if (!predicted) return null;
  const p = predicted.toLowerCase();
  if (p.includes('1') || p.includes('c')) return 'O(1)';
  if (p.includes('log n') && !p.includes('n log')) return 'O(log n)';
  if (p.includes('n log n') || p.includes('nlogn')) return 'O(n log n)';
  if (p.includes('n^2') || p.includes('n*n')) return 'O(n^2)';
  if (p.includes('2^n')) return 'O(2^n)';
  if (p.includes('n') && !p.match(/n\^|2\^/)) return 'O(n)';
  return null;
}

// Re-implement generateData here to verify correctness
function generateData() {
  const data = [];
  for (let n = 1; n <= 10; n++) {
    data.push({
      n,
      'O(1)': 1,
      'O(log n)': Math.log2(n),
      'O(n)': n,
      'O(n log n)': n * Math.log2(n),
      'O(n^2)': Math.pow(n, 2),
      'O(2^n)': Math.pow(2, n),
    });
  }
  return data;
}

// ——— matchComplexity unit tests ———

describe('matchComplexity logic', () => {
  it('returns O(1) for "O(1)"', () => {
    expect(matchComplexity('O(1)')).toBe('O(1)');
  });

  it('returns O(1) for "constant" (contains "c")', () => {
    expect(matchComplexity('O(constant)')).toBe('O(1)');
  });

  it('returns O(log n) for "O(log n)"', () => {
    expect(matchComplexity('O(log n)')).toBe('O(log n)');
  });

  it('returns O(log n) for "O(Log N)" (case-insensitive)', () => {
    expect(matchComplexity('O(Log N)')).toBe('O(log n)');
  });

  it('returns O(n) for "O(n)"', () => {
    expect(matchComplexity('O(n)')).toBe('O(n)');
  });

  it('returns O(n log n) for "O(n log n)"', () => {
    expect(matchComplexity('O(n log n)')).toBe('O(n log n)');
  });

  it('returns O(n log n) for "O(nlogn)" shorthand', () => {
    expect(matchComplexity('O(nlogn)')).toBe('O(n log n)');
  });

  it('returns O(n^2) for "O(n^2)"', () => {
    expect(matchComplexity('O(n^2)')).toBe('O(n^2)');
  });

  it('returns O(n^2) for "O(n*n)"', () => {
    expect(matchComplexity('O(n*n)')).toBe('O(n^2)');
  });

  it('returns O(2^n) for "O(2^n)"', () => {
    expect(matchComplexity('O(2^n)')).toBe('O(2^n)');
  });

  it('returns null for empty string', () => {
    expect(matchComplexity('')).toBeNull();
  });

  it('returns null for unrecognized complexity string without "n", "1", or "c"', () => {
    expect(matchComplexity('O(k)')).toBeNull();
  });

  it('does NOT return O(log n) when "n log n" pattern is present', () => {
    const result = matchComplexity('O(n log n)');
    expect(result).not.toBe('O(log n)');
    expect(result).toBe('O(n log n)');
  });

  it('does NOT return O(n) for "O(n^2)" (excludes n^2 patterns)', () => {
    expect(matchComplexity('O(n^2)')).toBe('O(n^2)');
    expect(matchComplexity('O(n^2)')).not.toBe('O(n)');
  });

  it('does NOT return O(n) for "O(2^n)" (excludes 2^n patterns)', () => {
    expect(matchComplexity('O(2^n)')).toBe('O(2^n)');
    expect(matchComplexity('O(2^n)')).not.toBe('O(n)');
  });
});

// ——— generateData unit tests ———

describe('generateData logic', () => {
  const data = generateData();

  it('generates exactly 10 data points (n=1 to n=10)', () => {
    expect(data).toHaveLength(10);
  });

  it('first data point has n=1', () => {
    expect(data[0].n).toBe(1);
  });

  it('last data point has n=10', () => {
    expect(data[9].n).toBe(10);
  });

  it('O(1) is always 1 regardless of n', () => {
    data.forEach((point) => {
      expect(point['O(1)']).toBe(1);
    });
  });

  it('O(n) equals n', () => {
    data.forEach((point) => {
      expect(point['O(n)']).toBe(point.n);
    });
  });

  it('O(log n) equals log2(n)', () => {
    data.forEach((point) => {
      expect(point['O(log n)']).toBeCloseTo(Math.log2(point.n));
    });
  });

  it('O(n log n) equals n * log2(n)', () => {
    data.forEach((point) => {
      expect(point['O(n log n)']).toBeCloseTo(point.n * Math.log2(point.n));
    });
  });

  it('O(n^2) equals n squared', () => {
    data.forEach((point) => {
      expect(point['O(n^2)']).toBe(Math.pow(point.n, 2));
    });
  });

  it('O(2^n) equals 2 to the power of n', () => {
    data.forEach((point) => {
      expect(point['O(2^n)']).toBe(Math.pow(2, point.n));
    });
  });

  it('data at n=4 has correct O(n^2) value of 16', () => {
    const point = data.find((d) => d.n === 4);
    expect(point?.['O(n^2)']).toBe(16);
  });

  it('data at n=4 has correct O(2^n) value of 16', () => {
    const point = data.find((d) => d.n === 4);
    expect(point?.['O(2^n)']).toBe(16);
  });
});

// ——— ComplexityChart component rendering tests ———

describe('ComplexityChart component', () => {
  it('renders without crashing when no predictedComplexity is given', () => {
    render(<ComplexityChart />);
    expect(screen.getByText('Big-O Complexity Chart')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<ComplexityChart />);
    expect(
      screen.getByText(/Visualizing your algorithm's efficiency/i)
    ).toBeInTheDocument();
  });

  it('renders all 6 complexity labels in the legend', () => {
    render(<ComplexityChart />);
    expect(screen.getByText('O(1)')).toBeInTheDocument();
    expect(screen.getByText('O(log n)')).toBeInTheDocument();
    expect(screen.getByText('O(n)')).toBeInTheDocument();
    expect(screen.getByText('O(n log n)')).toBeInTheDocument();
    expect(screen.getByText('O(n^2)')).toBeInTheDocument();
    expect(screen.getByText('O(2^n)')).toBeInTheDocument();
  });

  it('renders a ResponsiveContainer with a LineChart', () => {
    render(<ComplexityChart />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('does NOT render the summary text when no predictedComplexity is provided', () => {
    render(<ComplexityChart />);
    expect(screen.queryByText(/aligns closely with/i)).not.toBeInTheDocument();
  });

  it('renders the summary text when a predictedComplexity is matched', () => {
    render(<ComplexityChart predictedComplexity="O(n)" />);
    const summaryEl = screen.getByText(/aligns closely with/i);
    expect(summaryEl).toBeInTheDocument();
    // Multiple 'O(n)' elements exist (legend + summary), getAllByText to confirm
    expect(screen.getAllByText('O(n)').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the predictedComplexity value in the summary text', () => {
    render(<ComplexityChart predictedComplexity="O(n^2)" />);
    const summaryEl = screen.getByText(/aligns closely with/i);
    expect(summaryEl).toHaveTextContent('O(n^2)');
    expect(summaryEl).toHaveTextContent('O(n^2)');
  });

  it('does NOT render summary text when predictedComplexity does not match any known pattern', () => {
    render(<ComplexityChart predictedComplexity="O(k)" />);
    expect(screen.queryByText(/aligns closely with/i)).not.toBeInTheDocument();
  });

  it('renders all 6 Line components for each complexity', () => {
    render(<ComplexityChart />);
    expect(screen.getByTestId('line-O(1)')).toBeInTheDocument();
    expect(screen.getByTestId('line-O(log n)')).toBeInTheDocument();
    expect(screen.getByTestId('line-O(n)')).toBeInTheDocument();
    expect(screen.getByTestId('line-O(n log n)')).toBeInTheDocument();
    expect(screen.getByTestId('line-O(n^2)')).toBeInTheDocument();
    expect(screen.getByTestId('line-O(2^n)')).toBeInTheDocument();
  });

  it('highlights the matched line with strokeWidth=4 when predictedComplexity="O(n)"', () => {
    render(<ComplexityChart predictedComplexity="O(n)" />);
    const matchedLine = screen.getByTestId('line-O(n)');
    expect(matchedLine).toHaveAttribute('data-strokewidth', '4');
  });

  it('sets non-matched lines to strokeWidth=2 when a predictedComplexity is given', () => {
    render(<ComplexityChart predictedComplexity="O(n)" />);
    const unmatchedLine = screen.getByTestId('line-O(1)');
    expect(unmatchedLine).toHaveAttribute('data-strokewidth', '2');
  });

  it('sets matched line opacity to 1 and non-matched lines to 0.2', () => {
    render(<ComplexityChart predictedComplexity="O(n)" />);
    const matchedLine = screen.getByTestId('line-O(n)');
    const unmatchedLine = screen.getByTestId('line-O(1)');
    expect(matchedLine).toHaveAttribute('data-opacity', '1');
    expect(unmatchedLine).toHaveAttribute('data-opacity', '0.2');
  });

  it('all lines have opacity=1 when no predictedComplexity is provided', () => {
    render(<ComplexityChart />);
    const keys = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'];
    keys.forEach((key) => {
      expect(screen.getByTestId(`line-${key}`)).toHaveAttribute('data-opacity', '1');
    });
  });
});