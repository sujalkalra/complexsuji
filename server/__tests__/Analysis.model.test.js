// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock mongoose to avoid requiring a live MongoDB connection
vi.mock('mongoose', async () => {
  class Schema {
    constructor(definition) {
      this._definition = definition;
    }
  }

  function createModel(name, schema) {
    const ModelClass = function (data) {
      this._data = {};
      const def = schema._definition;

      // Copy input data and apply defaults
      for (const [key, fieldDef] of Object.entries(def)) {
        if (data[key] !== undefined) {
          this._data[key] = data[key];
        } else if (fieldDef.default !== undefined) {
          if (typeof fieldDef.default === 'function') {
            const val = fieldDef.default();
            // If the field type is Date and the default returns a number/timestamp, wrap in Date
            this._data[key] = (fieldDef.type === Date && typeof val === 'number') ? new Date(val) : val;
          } else {
            this._data[key] = fieldDef.default;
          }
        }
      }

      Object.assign(this, this._data);
      this._id = 'mock-id-' + Date.now() + '-' + Math.random();

      this.save = async () => {
        // Validate required fields
        for (const [key, fieldDef] of Object.entries(def)) {
          if (fieldDef.required && (this._data[key] === undefined || this._data[key] === null)) {
            const err = new Error(`Analysis validation failed: ${key}: Path \`${key}\` is required.`);
            err.name = 'ValidationError';
            throw err;
          }
          // Boolean strict type check
          if (fieldDef.type === Boolean && this._data[key] !== undefined) {
            if (typeof this._data[key] !== 'boolean') {
              const err = new Error(`Cast to Boolean failed for value "${this._data[key]}" at path "${key}"`);
              err.name = 'CastError';
              throw err;
            }
          }
          // String coercion
          if (fieldDef.type === String && this._data[key] !== undefined && this._data[key] !== null) {
            this._data[key] = String(this._data[key]);
          }
        }
        Object.assign(this, this._data);
        return this;
      };
    };

    ModelClass.modelName = name;
    return ModelClass;
  }

  const mongoose = {
    Schema,
    model: vi.fn((name, schema) => createModel(name, schema)),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  return { default: mongoose };
});

let Analysis;

beforeAll(async () => {
  const mod = await import('../models/Analysis.js');
  Analysis = mod.default;
});

const validAnalysisData = {
  code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  timeExplanation: 'The reduce iterates over all n elements.',
  spaceExplanation: 'No extra space is allocated proportional to input.',
  suggestions: ['Use native reduce', 'Early exit is not applicable here'],
  isCorrect: true,
};

describe('Analysis Mongoose Model - schema fields', () => {
  it('saves a valid analysis document successfully', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved).toBeDefined();
    expect(saved.code).toBe(validAnalysisData.code);
  });

  it('saves timeComplexity correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.timeComplexity).toBe('O(n)');
  });

  it('saves spaceComplexity correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.spaceComplexity).toBe('O(1)');
  });

  it('saves timeExplanation correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.timeExplanation).toBe(validAnalysisData.timeExplanation);
  });

  it('saves spaceExplanation correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.spaceExplanation).toBe(validAnalysisData.spaceExplanation);
  });

  it('saves isCorrect=true correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.isCorrect).toBe(true);
  });

  it('saves isCorrect=false correctly', async () => {
    const doc = new Analysis({ ...validAnalysisData, isCorrect: false });
    const saved = await doc.save();
    expect(saved.isCorrect).toBe(false);
  });

  it('saves suggestions array correctly', async () => {
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    expect(saved.suggestions).toEqual(validAnalysisData.suggestions);
  });

  it('defaults suggestions to empty array when not provided', async () => {
    const { suggestions, ...dataWithoutSuggestions } = validAnalysisData;
    const doc = new Analysis(dataWithoutSuggestions);
    const saved = await doc.save();
    expect(saved.suggestions).toEqual([]);
  });

  it('sets createdAt automatically with a Date value from default', async () => {
    const beforeSave = new Date();
    const doc = new Analysis(validAnalysisData);
    const saved = await doc.save();
    const afterSave = new Date();
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime() - 1);
    expect(saved.createdAt.getTime()).toBeLessThanOrEqual(afterSave.getTime() + 1);
  });
});

describe('Analysis Mongoose Model - required field validation', () => {
  it('throws validation error when code is missing', async () => {
    const { code, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });

  it('throws validation error when timeComplexity is missing', async () => {
    const { timeComplexity, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });

  it('throws validation error when spaceComplexity is missing', async () => {
    const { spaceComplexity, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });

  it('throws validation error when timeExplanation is missing', async () => {
    const { timeExplanation, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });

  it('throws validation error when spaceExplanation is missing', async () => {
    const { spaceExplanation, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });

  it('throws validation error when isCorrect is missing', async () => {
    const { isCorrect, ...rest } = validAnalysisData;
    const doc = new Analysis(rest);
    await expect(doc.save()).rejects.toThrow();
  });
});

describe('Analysis Mongoose Model - field types', () => {
  it('throws when isCorrect is a non-boolean string value', async () => {
    const doc = new Analysis({ ...validAnalysisData, isCorrect: 'yes' });
    await expect(doc.save()).rejects.toThrow();
  });

  it('coerces numeric code field to string', async () => {
    const doc = new Analysis({ ...validAnalysisData, code: 12345 });
    const saved = await doc.save();
    expect(typeof saved.code).toBe('string');
    expect(saved.code).toBe('12345');
  });

  it('suggestions field is stored as an array', async () => {
    const doc = new Analysis({ ...validAnalysisData, suggestions: ['tip1', 'tip2'] });
    const saved = await doc.save();
    expect(Array.isArray(saved.suggestions)).toBe(true);
    expect(saved.suggestions[0]).toBe('tip1');
  });
});

describe('Analysis Mongoose Model - model metadata', () => {
  it('uses the model name "Analysis"', () => {
    expect(Analysis.modelName).toBe('Analysis');
  });

  it('creates an _id on each instance', async () => {
    const doc = new Analysis(validAnalysisData);
    expect(doc._id).toBeDefined();
  });

  it('each instance has an independent _id', async () => {
    const doc1 = new Analysis(validAnalysisData);
    const doc2 = new Analysis(validAnalysisData);
    expect(doc1._id).not.toBe(doc2._id);
  });
});