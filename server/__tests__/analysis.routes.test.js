// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';

// Use vi.hoisted() so the variable is accessible inside the vi.mock factory
const MockAnalysis = vi.hoisted(() => vi.fn());

vi.mock('../models/Analysis.js', () => ({
  default: MockAnalysis,
}));

// Static import of the route module, which will use the mocked Analysis
import analysisRoutes from '../routes/analysis.js';

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock express req/res/next objects
function createMockReqRes(body = {}) {
  const req = { body };
  const res = {
    statusCode: 200,
    _json: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this._json = data;
      return this;
    },
  };
  const next = vi.fn();
  return { req, res, next };
}

// Helper to find the route handler for a given method/path in express router
function getRouteHandler(router, method, path) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()]
  );
  if (!layer) throw new Error(`Route ${method} ${path} not found`);
  return layer.route.stack[0].handle;
}

const feedbackHandler = getRouteHandler(analysisRoutes, 'post', '/feedback');

const validFeedbackBody = {
  code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  timeExplanation: 'Iterates over n elements.',
  spaceExplanation: 'No extra space used.',
  suggestions: ['Consider a for loop', 'Add input validation'],
  isCorrect: true,
};

function setupSuccessfulMock() {
  MockAnalysis.mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = 'mock-id-123';
    this.save = vi.fn().mockResolvedValue(this);
  });
}

describe('POST /api/analysis/feedback route handler', () => {
  it('responds with 201 status and success message on valid input', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._json).toEqual(
      expect.objectContaining({ message: 'Feedback saved successfully' })
    );
  });

  it('returns the saved analysis data in response', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res._json.data).toBeDefined();
    expect(res._json.data.code).toBe(validFeedbackBody.code);
    expect(res._json.data.timeComplexity).toBe('O(n)');
    expect(res._json.data.spaceComplexity).toBe('O(1)');
    expect(res._json.data.isCorrect).toBe(true);
  });

  it('instantiates Analysis with all the request body fields', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(MockAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        code: validFeedbackBody.code,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        timeExplanation: validFeedbackBody.timeExplanation,
        spaceExplanation: validFeedbackBody.spaceExplanation,
        suggestions: validFeedbackBody.suggestions,
        isCorrect: true,
      })
    );
  });

  it('calls save() on the new Analysis instance', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    const instance = MockAnalysis.mock.instances[0];
    expect(instance.save).toHaveBeenCalledOnce();
  });

  it('accepts isCorrect=false and includes it in the response', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes({ ...validFeedbackBody, isCorrect: false });
    await feedbackHandler(req, res);

    expect(res._json.data.isCorrect).toBe(false);
  });

  it('accepts empty suggestions array', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes({ ...validFeedbackBody, suggestions: [] });
    await feedbackHandler(req, res);

    expect(res._json.data.suggestions).toEqual([]);
  });

  it('responds with 500 when save() throws a database error', async () => {
    MockAnalysis.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = vi.fn().mockRejectedValue(new Error('DB write failed'));
    });

    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._json.error).toBe('Failed to save feedback');
  });

  it('responds with 500 when Analysis constructor throws', async () => {
    MockAnalysis.mockImplementation(() => {
      throw new Error('Constructor error');
    });

    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._json.error).toBe('Failed to save feedback');
  });

  it('handles request with only the minimum required body fields', async () => {
    MockAnalysis.mockImplementation(function (data) {
      Object.assign(this, data);
      this._id = 'mock-min';
      this.save = vi.fn().mockResolvedValue(this);
    });

    const minimalBody = {
      code: 'x = 1',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      timeExplanation: 'Constant',
      spaceExplanation: 'Constant',
      isCorrect: true,
    };

    const { req, res } = createMockReqRes(minimalBody);
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._json.message).toBe('Feedback saved successfully');
  });

  it('returns 201 with multiple suggestions saved correctly', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes({ ...validFeedbackBody, suggestions: ['A', 'B', 'C'] });
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._json.data.suggestions).toEqual(['A', 'B', 'C']);
  });

  it('does not expose internal error details in 500 response', async () => {
    MockAnalysis.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = vi.fn().mockRejectedValue(new Error('Sensitive internal DB error'));
    });

    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._json.error).toBe('Failed to save feedback');
    expect(JSON.stringify(res._json)).not.toContain('Sensitive internal DB error');
  });

  it('passes the code from request body to the Analysis constructor', async () => {
    setupSuccessfulMock();
    const specificCode = 'const x = arr.map(i => i * 2);';
    const { req, res } = createMockReqRes({ ...validFeedbackBody, code: specificCode });
    await feedbackHandler(req, res);

    expect(MockAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({ code: specificCode })
    );
  });

  it('includes the saved document in the data field of the response', async () => {
    setupSuccessfulMock();
    const { req, res } = createMockReqRes(validFeedbackBody);
    await feedbackHandler(req, res);

    expect(res._json).toHaveProperty('data');
    expect(res._json).toHaveProperty('message');
  });
});