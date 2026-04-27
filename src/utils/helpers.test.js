import { describe, it, expect } from 'vitest';
import { clean, normURL, formatTime, phSVG } from './helpers';

describe('clean', () => {
  it('strips leading @', () => expect(clean('@janesmith')).toBe('janesmith'));
  it('lowercases', () => expect(clean('JaneSmith')).toBe('janesmith'));
  it('strips whitespace', () => expect(clean('  jane smith  ')).toBe('janesmith'));
  it('handles empty string', () => expect(clean('')).toBe(''));
  it('handles null/undefined', () => expect(clean(null)).toBe(''));
  it('strips multiple leading @', () => expect(clean('@@user')).toBe('user'));
});

describe('normURL', () => {
  it('adds https:// when missing', () => expect(normURL('example.com')).toBe('https://example.com'));
  it('preserves existing https://', () => expect(normURL('https://example.com')).toBe('https://example.com'));
  it('preserves existing http://', () => expect(normURL('http://example.com')).toBe('http://example.com'));
  it('returns null for empty string', () => expect(normURL('')).toBeNull());
  it('returns null for null', () => expect(normURL(null)).toBeNull());
  it('trims whitespace', () => expect(normURL('  example.com  ')).toBe('https://example.com'));
});

describe('formatTime', () => {
  it('returns empty string for null', () => expect(formatTime(null)).toBe(''));
  it('returns empty string for empty', () => expect(formatTime('')).toBe(''));
  it('returns formatted date string for valid ISO', () => {
    const result = formatTime('2024-01-15T10:30:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('phSVG', () => {
  it('returns a data URL', () => expect(phSVG('#abc')).toMatch(/^data:image\/svg\+xml/));
  it('includes the color in the output', () => expect(phSVG('#4A7DB5')).toContain('4A7DB5'));
});
