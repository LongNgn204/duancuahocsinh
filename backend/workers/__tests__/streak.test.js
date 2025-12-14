// backend/workers/__tests__/streak.test.js
// Unit tests cho Streak calculation - Phase 6

import { describe, it, expect } from 'vitest';

/**
 * Calculate streak from array of dates
 * @param {string[]} dates - Array of ISO date strings
 * @returns {number} Current streak count
 */
function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;

    // Sort dates descending
    const sortedDates = [...dates]
        .map(d => new Date(d))
        .sort((a, b) => b - a);

    // Check if most recent date is today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    // If most recent is not today or yesterday, streak is broken
    if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
        return 0;
    }

    // Count consecutive days
    let streak = 1;
    let expectedDate = new Date(mostRecent);
    expectedDate.setDate(expectedDate.getDate() - 1);

    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

describe('Streak Calculation', () => {
    describe('calculateStreak', () => {
        it('should return 0 for empty array', () => {
            expect(calculateStreak([])).toBe(0);
            expect(calculateStreak(null)).toBe(0);
            expect(calculateStreak(undefined)).toBe(0);
        });

        it('should return 1 for single entry today', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(calculateStreak([today])).toBe(1);
        });

        it('should return 1 for single entry yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            expect(calculateStreak([yesterdayStr])).toBe(1);
        });

        it('should return 0 for old entry (not today or yesterday)', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 5);
            const oldDateStr = oldDate.toISOString().split('T')[0];
            expect(calculateStreak([oldDateStr])).toBe(0);
        });

        it('should calculate streak for consecutive days', () => {
            const dates = [];
            for (let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            expect(calculateStreak(dates)).toBe(5);
        });

        it('should break streak on gap', () => {
            const dates = [];
            // Today, yesterday, 3 days ago (gap!)
            dates.push(new Date().toISOString().split('T')[0]);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            dates.push(yesterday.toISOString().split('T')[0]);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            dates.push(threeDaysAgo.toISOString().split('T')[0]);

            // Streak should be 2 (today + yesterday), not 3
            expect(calculateStreak(dates)).toBe(2);
        });

        it('should handle unordered dates', () => {
            const dates = [];
            dates.push(new Date().toISOString().split('T')[0]);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            dates.push(twoDaysAgo.toISOString().split('T')[0]);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            dates.push(yesterday.toISOString().split('T')[0]);

            // Should sort and calculate correctly
            expect(calculateStreak(dates)).toBe(2);
        });

        it('should handle 7-day streak', () => {
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            expect(calculateStreak(dates)).toBe(7);
        });

        it('should handle 30-day streak', () => {
            const dates = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            expect(calculateStreak(dates)).toBe(30);
        });
    });

    describe('Streak Achievements', () => {
        it('should identify 7-day streak achievement', () => {
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            const streak = calculateStreak(dates);
            expect(streak).toBeGreaterThanOrEqual(7);
        });

        it('should identify 30-day streak achievement', () => {
            const dates = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            const streak = calculateStreak(dates);
            expect(streak).toBeGreaterThanOrEqual(30);
        });
    });
});

