import { OutputComparatorService } from './output-comparator.service';

describe('OutputComparatorService', () => {
  let comparator: OutputComparatorService;

  beforeEach(() => {
    comparator = new OutputComparatorService();
  });

  describe('Two Sum Regression Tests', () => {
    it('should match exact Two Sum output [0,1]', () => {
      const res = comparator.compare('[0,1]', '[0,1]', { problemSlug: 'two-sum' });
      expect(res.isMatch).toBe(true);
    });

    it('should match unordered Two Sum valid answer [1,0] when expected is [0,1]', () => {
      const res = comparator.compare('[1,0]', '[0,1]', { problemSlug: 'two-sum' });
      expect(res.isMatch).toBe(true);
    });

    it('should match Two Sum output with whitespace [ 0, 1 ] vs [0,1]', () => {
      const res = comparator.compare('[ 0, 1 ]', '[0,1]', { problemSlug: 'two-sum' });
      expect(res.isMatch).toBe(true);
    });

    it('should reject invalid Two Sum index pair [0,2] when expected is [0,1]', () => {
      const res = comparator.compare('[0,2]', '[0,1]', { problemSlug: 'two-sum' });
      expect(res.isMatch).toBe(false);
    });
  });

  describe('Structured & Primitive Outputs', () => {
    it('should match boolean case-insensitively (Python True vs JS true)', () => {
      expect(comparator.compare('True', 'true').isMatch).toBe(true);
      expect(comparator.compare('False', 'false').isMatch).toBe(true);
      expect(comparator.compare('true', 'false').isMatch).toBe(false);
    });

    it('should match floating point numbers within tolerance', () => {
      const res = comparator.compare('3.1415926', '3.14159', { floatTolerance: 1e-4 });
      expect(res.isMatch).toBe(true);
    });

    it('should match 2D unordered arrays for 3Sum', () => {
      const actual = '[[-1,0,1],[-1,-1,2]]';
      const expected = '[[-1,-1,2],[-1,0,1]]';
      const res = comparator.compare(actual, expected, { problemSlug: '3sum' });
      expect(res.isMatch).toBe(true);
    });

    it('should reject when actual is null', () => {
      const res = comparator.compare(null, '[0,1]');
      expect(res.isMatch).toBe(false);
    });
  });
});
