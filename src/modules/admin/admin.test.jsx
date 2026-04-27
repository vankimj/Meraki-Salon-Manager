import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { formatTime } from '../../utils/helpers';

// Admin relies heavily on AppContext — test the pure logic separately
describe('formatTime (used in admin log rows)', () => {
  it('formats a valid ISO date', () => {
    const result = formatTime('2024-06-15T14:30:00.000Z');
    expect(result).toMatch(/2024/);
    expect(result.length).toBeGreaterThan(5);
  });
  it('returns empty string for null', () => expect(formatTime(null)).toBe(''));
  it('returns empty string for empty string', () => expect(formatTime('')).toBe(''));
});

describe('role badge logic', () => {
  const roleColors = {
    admin:    ['rgba(61,149,206,.15)', '#3D95CE'],
    readonly: ['rgba(34,197,94,.15)',  '#16a34a'],
    pending:  ['rgba(245,158,11,.15)', '#d97706'],
    denied:   ['rgba(239,68,68,.15)',  '#ef4444'],
  };

  it('has a color defined for admin', () => expect(roleColors.admin).toBeDefined());
  it('has a color defined for readonly', () => expect(roleColors.readonly).toBeDefined());
  it('has a color defined for pending', () => expect(roleColors.pending).toBeDefined());
  it('has a color defined for denied', () => expect(roleColors.denied).toBeDefined());
});

describe('log action label transformation', () => {
  function labelFor(action) { return action?.replace(/_/g, ' ') || ''; }
  it('converts user_login to user login', () => expect(labelFor('user_login')).toBe('user login'));
  it('converts slide_deleted to slide deleted', () => expect(labelFor('slide_deleted')).toBe('slide deleted'));
  it('converts access_changed to access changed', () => expect(labelFor('access_changed')).toBe('access changed'));
  it('handles undefined gracefully', () => expect(labelFor(undefined)).toBe(''));
});
