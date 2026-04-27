import { describe, it, expect } from 'vitest';
import { formatPrice, formatDuration, groupByCategory, validateService, blankService } from './serviceHelpers';

describe('formatPrice', () => {
  it('shows + for priceFrom=true',  () => expect(formatPrice(70, true)).toBe('$70+'));
  it('shows exact for priceFrom=false', () => expect(formatPrice(25, false)).toBe('$25'));
  it('handles zero price',          () => expect(formatPrice(0, false)).toBe('$0'));
  it('handles starting from zero',  () => expect(formatPrice(0, true)).toBe('$0+'));
});

describe('formatDuration', () => {
  it('shows + for durationMin=true',  () => expect(formatDuration(60, true)).toBe('60+ min'));
  it('shows exact for durationMin=false', () => expect(formatDuration(30, false)).toBe('30 min'));
  it('handles 1 minute',             () => expect(formatDuration(1, false)).toBe('1 min'));
});

describe('groupByCategory', () => {
  const services = [
    { name: 'Gel-X',        category: 'Manicures', sortOrder: 0 },
    { name: 'Spa Pedicure', category: 'Pedicures', sortOrder: 0 },
    { name: 'Dip',          category: 'Add-ons',   sortOrder: 0 },
    { name: 'Wax',          category: 'Waxing',    sortOrder: 0 },
  ];

  it('returns groups in canonical order with unknowns last', () => {
    const groups = groupByCategory(services);
    expect(groups.map(g => g.category)).toEqual(['Manicures', 'Pedicures', 'Add-ons', 'Waxing']);
  });

  it('each group contains the right services', () => {
    const groups = groupByCategory(services);
    expect(groups[0].services[0].name).toBe('Gel-X');
    expect(groups[1].services[0].name).toBe('Spa Pedicure');
  });

  it('returns empty array for empty input', () => {
    expect(groupByCategory([])).toEqual([]);
  });

  it('handles single category', () => {
    const result = groupByCategory([{ name: 'A', category: 'Manicures', sortOrder: 0 }]);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Manicures');
  });
});

describe('validateService', () => {
  const valid = { name: 'Gel-X', category: 'Manicures', basePrice: 70, duration: 60 };

  it('passes a valid service',              () => expect(validateService(valid).valid).toBe(true));
  it('fails when name is empty',            () => expect(validateService({ ...valid, name: '' }).valid).toBe(false));
  it('fails when category is empty',        () => expect(validateService({ ...valid, category: '' }).valid).toBe(false));
  it('fails when price is negative',        () => expect(validateService({ ...valid, basePrice: -1 }).valid).toBe(false));
  it('fails when duration is zero',         () => expect(validateService({ ...valid, duration: 0 }).valid).toBe(false));
  it('returns error keys for each failure', () => {
    const { errors } = validateService({ name: '', category: '', basePrice: -1, duration: 0 });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['name', 'category', 'basePrice', 'duration']));
  });
  it('allows price of zero',                () => expect(validateService({ ...valid, basePrice: 0 }).valid).toBe(true));
});

describe('blankService', () => {
  it('returns an object with all required fields', () => {
    const s = blankService();
    expect(s.name).toBe('');
    expect(s.category).toBe('Manicures');
    expect(s.active).toBe(true);
    expect(typeof s.basePrice).toBe('number');
    expect(typeof s.duration).toBe('number');
  });
});
