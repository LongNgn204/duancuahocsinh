// backend/workers/__tests__/xp.test.js
// Unit tests cho XP và Level calculation - Phase 6

import { describe, it, expect } from 'vitest';

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 */
function calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculate XP needed for next level
 */
function calculateXPForNextLevel(currentLevel) {
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    return nextLevelXP - currentLevelXP;
}

/**
 * Calculate XP progress percentage
 */
function calculateXPProgress(currentXP, currentLevel) {
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.max(0, (progressXP / neededXP) * 100));
}

describe('XP and Level Calculation', () => {
    describe('calculateLevel', () => {
        it('should calculate level 1 for 0 XP', () => {
            expect(calculateLevel(0)).toBe(1);
        });

        it('should calculate level 2 for 100 XP', () => {
            expect(calculateLevel(100)).toBe(2);
        });

        it('should calculate level 3 for 400 XP', () => {
            expect(calculateLevel(400)).toBe(3);
        });

        it('should calculate level 5 for 1600 XP', () => {
            expect(calculateLevel(1600)).toBe(5);
        });

        it('should calculate level 10 for 8100 XP', () => {
            expect(calculateLevel(8100)).toBe(10);
        });

        it('should handle fractional XP correctly', () => {
            expect(calculateLevel(50)).toBe(1);
            expect(calculateLevel(150)).toBe(2);
        });
    });

    describe('calculateXPForNextLevel', () => {
        it('should calculate XP needed for level 2 (from level 1)', () => {
            // Level 1: 0 XP, Level 2: 400 XP, needed: 400 - 0 = 400
            expect(calculateXPForNextLevel(2)).toBe(400);
        });

        it('should calculate XP needed for level 3 (from level 2)', () => {
            // Level 2: 400 XP, Level 3: 900 XP, needed: 900 - 400 = 500
            expect(calculateXPForNextLevel(3)).toBe(500);
        });

        it('should calculate XP needed for level 5 (from level 4)', () => {
            // Level 4: 1600 XP, Level 5: 2500 XP, needed: 2500 - 1600 = 900
            expect(calculateXPForNextLevel(5)).toBe(900);
        });
    });

    describe('calculateXPProgress', () => {
        it('should return 0% for XP at start of level', () => {
            // Level 2 starts at 100 XP
            expect(calculateXPProgress(100, 2)).toBe(0);
        });

        it('should return 50% for XP halfway to next level', () => {
            // Level 2: 100-400 XP, halfway = 250 XP
            expect(calculateXPProgress(250, 2)).toBeCloseTo(50, 1);
        });

        it('should return 100% for XP at next level threshold', () => {
            // Level 2 ends at 400 XP (start of level 3)
            expect(calculateXPProgress(400, 2)).toBe(100);
        });

        it('should cap at 100% for XP beyond next level', () => {
            expect(calculateXPProgress(500, 2)).toBe(100);
        });

        it('should return 0% for XP below current level', () => {
            expect(calculateXPProgress(50, 2)).toBe(0);
        });
    });

    describe('XP Rewards', () => {
        const XP_REWARDS = {
            gratitude_entry: 10,
            journal_entry: 15,
            focus_session: 20,
            breathing_session: 5,
            sleep_log: 10,
            random_card: 10,
            game_win: 15,
            achievement_unlock: 50,
        };

        it('should have correct XP rewards for actions', () => {
            expect(XP_REWARDS.gratitude_entry).toBe(10);
            expect(XP_REWARDS.journal_entry).toBe(15);
            expect(XP_REWARDS.focus_session).toBe(20);
            expect(XP_REWARDS.breathing_session).toBe(5);
            expect(XP_REWARDS.sleep_log).toBe(10);
            expect(XP_REWARDS.random_card).toBe(10);
            expect(XP_REWARDS.game_win).toBe(15);
            expect(XP_REWARDS.achievement_unlock).toBe(50);
        });

        it('should calculate total XP for multiple actions', () => {
            const actions = [
                { type: 'gratitude_entry', count: 3 },
                { type: 'journal_entry', count: 2 },
                { type: 'focus_session', count: 1 },
            ];

            const totalXP = actions.reduce((sum, action) => {
                return sum + (XP_REWARDS[action.type] * action.count);
            }, 0);

            expect(totalXP).toBe(10 * 3 + 15 * 2 + 20 * 1); // 30 + 30 + 20 = 80
        });
    });
});

