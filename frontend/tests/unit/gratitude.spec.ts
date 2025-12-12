import { describe, it, expect } from 'vitest';
import { computeStreakFromEntries, toDayStr } from '../../src/utils/gratitude';

function entryFor(date: Date, text = 'x') {
  return { id: +date, text, date: date.toISOString() } as any;
}

describe('computeStreakFromEntries', () => {
  it('returns 0 for empty', () => {
    expect(computeStreakFromEntries([])).toBe(0);
  });

  it('counts today as 1', () => {
    const today = new Date();
    const list = [entryFor(today)];
    expect(computeStreakFromEntries(list)).toBe(1);
  });

  it('counts today + yesterday as 2', () => {
    const today = new Date();
    const y = new Date();
    y.setDate(today.getDate() - 1);
    const list = [entryFor(today), entryFor(y)];
    expect(computeStreakFromEntries(list)).toBe(2);
  });

  it('stops when there is a 2+ day gap', () => {
    const today = new Date();
    const y = new Date();
    y.setDate(today.getDate() - 1);
    const gap2 = new Date();
    gap2.setDate(today.getDate() - 3);

    const list = [entryFor(today), entryFor(y), entryFor(gap2)];
    // streak should be 2 (today + yesterday), ignore older due to gap
    expect(computeStreakFromEntries(list)).toBe(2);
  });

  it('returns 1 when only yesterday exists (no today)', () => {
    const today = new Date();
    const y = new Date();
    y.setDate(today.getDate() - 1);
    const list = [entryFor(y)];
    // theo logic hiện tại: tính từ hôm nay, diff=1 -> đếm 1
    expect(computeStreakFromEntries(list)).toBe(1);
  });
});

