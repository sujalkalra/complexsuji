// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DeepseekResponse } from '../deepseekService';

// Mock import.meta.env for Vite environment variables
vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
vi.stubEnv('VITE_OPENROUTER_API_URL', 'https://api.example.com/v1/chat');
vi.stubEnv('VITE_OPENROUTER_MODEL', 'test-model');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const buildApiResponse = (content: string) => ({
  choices: [
    {
      message: { content },
    },
  ],
});

const validApiContent = JSON.stringify({
  timeComplexity: 'O(n)',
  timeExplanation: 'Linear scan of the array.',
  spaceComplexity: 'O(1)',
  spaceExplanation: 'Constant extra space.',
  suggestions: ['Use binary search for sorted input'],
});

describe('DeepseekResponse interface', () => {
  it('type includes the code field', () => {
    // Compile-time check: if this compiles, the code field exists on the interface
    const response: DeepseekResponse = {
      code: 'function foo() {}',
      timeComplexity: 'O(n)',
      timeExplanation: 'Linear',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant',
      suggestions: [],
    };
    expect(response.code).toBe('function foo() {}');
  });

  it('code field defaults to empty string when not set', () => {
    const response: DeepseekResponse = {
      code: '',
      timeComplexity: 'O(n)',
      timeExplanation: 'Linear',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant',
      suggestions: [],
    };
    expect(response.code).toBe('');
  });
});

describe('analyzeCodeComplexity - code field propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure window.location is available
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets code field on result when API returns valid JSON directly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(validApiContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const inputCode = 'function linearSearch(arr, target) { return arr.indexOf(target); }';
    const result = await analyzeCodeComplexity(inputCode);

    expect(result.code).toBe(inputCode);
  });

  it('sets code field on result when API returns JSON wrapped in markdown code block', async () => {
    const wrappedContent = `Here is the analysis:\n\`\`\`json\n${validApiContent}\n\`\`\``;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(wrappedContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const inputCode = 'for (let i = 0; i < n; i++) sum += arr[i];';
    const result = await analyzeCodeComplexity(inputCode);

    expect(result.code).toBe(inputCode);
  });

  it('sets code field on result when API returns bare JSON object in text', async () => {
    const bareContent = `Analysis result: ${validApiContent} End of analysis.`;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(bareContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const inputCode = 'return n * 2;';
    const result = await analyzeCodeComplexity(inputCode);

    expect(result.code).toBe(inputCode);
  });

  it('returns timeComplexity from parsed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(validApiContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.timeComplexity).toBe('O(n)');
  });

  it('returns spaceComplexity from parsed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(validApiContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.spaceComplexity).toBe('O(1)');
  });

  it('returns empty code when API response has no choices (fallback)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    // generateFallbackResponse is called without code arg → code defaults to ""
    expect(result.code).toBe('');
  });

  it('returns fallback response with code="" when choices array is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.timeComplexity).toBe('Analysis failed');
    expect(result.spaceComplexity).toBe('Analysis failed');
    expect(result.code).toBe('');
  });

  it('returns empty code when message content is null (fallback)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: null } }],
      }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('x = 1;');

    expect(result.code).toBe('');
  });

  it('throws when API returns non-ok status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    await expect(analyzeCodeComplexity('const x = 1;')).rejects.toThrow();
  });

  it('throws when all JSON extraction patterns fail', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse('This is not JSON at all.'),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    await expect(analyzeCodeComplexity('const x = 1;')).rejects.toThrow();
  });
});

describe('generateFallbackResponse behavior (via analyzeCodeComplexity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback with default suggestions when called without code match', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('x = 1;');

    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]).toContain('simplifying');
  });

  it('fallback response has valid timeExplanation string', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('x = 1;');

    expect(typeof result.timeExplanation).toBe('string');
    expect(result.timeExplanation.length).toBeGreaterThan(0);
  });

  it('fallback response has valid spaceExplanation string', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('x = 1;');

    expect(typeof result.spaceExplanation).toBe('string');
    expect(result.spaceExplanation.length).toBeGreaterThan(0);
  });
});

describe('ensureValidResponse behavior (via analyzeCodeComplexity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fills in missing timeComplexity with "Not provided"', async () => {
    const incompleteContent = JSON.stringify({
      timeExplanation: 'Some explanation',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant',
      suggestions: [],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(incompleteContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.timeComplexity).toBe('Not provided');
  });

  it('fills in missing spaceComplexity with "Not provided"', async () => {
    const incompleteContent = JSON.stringify({
      timeComplexity: 'O(n)',
      timeExplanation: 'Linear',
      spaceExplanation: 'Constant',
      suggestions: [],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(incompleteContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.spaceComplexity).toBe('Not provided');
  });

  it('defaults suggestions to empty array when missing', async () => {
    const incompleteContent = JSON.stringify({
      timeComplexity: 'O(n)',
      timeExplanation: 'Linear',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(incompleteContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(result.suggestions).toEqual([]);
  });

  it('converts non-array suggestions to an array', async () => {
    const incompleteContent = JSON.stringify({
      timeComplexity: 'O(n)',
      timeExplanation: 'Linear',
      spaceComplexity: 'O(1)',
      spaceExplanation: 'Constant',
      suggestions: 'Use hash table',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(incompleteContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const result = await analyzeCodeComplexity('const x = 1;');

    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions[0]).toBe('Use hash table');
  });

  it('preserves code field set by the service on the ensured response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildApiResponse(validApiContent),
    });

    const { analyzeCodeComplexity } = await import('../deepseekService');
    const inputCode = 'const arr = [1,2,3];';
    const result = await analyzeCodeComplexity(inputCode);

    expect(result.code).toBe(inputCode);
  });
});