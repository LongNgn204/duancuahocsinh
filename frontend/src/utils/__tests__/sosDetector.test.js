// frontend/src/utils/__tests__/sosDetector.test.js
// Unit tests cho SOS Detector - Phase 6
import { describe, it, expect } from 'vitest';
import { detectSOSLevel, detectSOSLocal, sosMessage } from '../sosDetector.js';

describe('detectSOSLevel', () => {
    describe('CRITICAL level - Immediate intervention needed', () => {
        it('should detect suicide intent', () => {
            expect(detectSOSLevel('mình muốn tự tử')).toBe('critical');
            expect(detectSOSLevel('Mình muốn chết')).toBe('critical');
            expect(detectSOSLevel('mún chết quá')).toBe('critical');
            expect(detectSOSLevel('muốn die')).toBe('critical');
            expect(detectSOSLevel('kết thúc cuộc đời')).toBe('critical');
        });

        it('should detect self-harm', () => {
            expect(detectSOSLevel('mình đã tự cắt tay')).toBe('critical');
            expect(detectSOSLevel('muốn rạch tay')).toBe('critical');
            expect(detectSOSLevel('tự làm hại')).toBe('critical');
        });

        it('should detect Gen-Z suicide slang', () => {
            expect(detectSOSLevel('mún đi luôn')).toBe('critical');
            expect(detectSOSLevel('ngủ mãi')).toBe('critical');
            expect(detectSOSLevel('end game')).toBe('critical');
            expect(detectSOSLevel('uninstall life')).toBe('critical');
            expect(detectSOSLevel('không còn lý do sống')).toBe('critical');
        });
    });

    describe('HIGH level - High risk, needs monitoring', () => {
        it('should detect hopelessness', () => {
            expect(detectSOSLevel('mình tuyệt vọng quá')).toBe('high');
            expect(detectSOSLevel('hết hy vọng rồi')).toBe('high');
            expect(detectSOSLevel('không còn hy vọng')).toBe('high');
        });

        it('should detect worthlessness', () => {
            expect(detectSOSLevel('mình vô dụng lắm')).toBe('high');
            expect(detectSOSLevel('mình là gánh nặng')).toBe('high');
            expect(detectSOSLevel('cảm thấy vô dụng')).toBe('high');
        });

        it('should detect isolation', () => {
            expect(detectSOSLevel('không ai quan tâm mình')).toBe('high');
            expect(detectSOSLevel('một mình mãi')).toBe('high');
            expect(detectSOSLevel('cô đơn quá')).toBe('high');
        });

        it('should detect abuse', () => {
            expect(detectSOSLevel('bị bắt nạt')).toBe('high');
            expect(detectSOSLevel('bị xâm hại')).toBe('high');
            expect(detectSOSLevel('bị lạm dụng')).toBe('high');
        });
    });

    describe('MEDIUM level - Needs attention', () => {
        it('should detect depression signs', () => {
            expect(detectSOSLevel('buồn quá')).toBe('medium');
            expect(detectSOSLevel('khóc hoài')).toBe('medium');
            expect(detectSOSLevel('chán nản')).toBe('medium');
            expect(detectSOSLevel('không vui được')).toBe('medium');
        });

        it('should detect Gen-Z depression slang', () => {
            expect(detectSOSLevel('chán đời')).toBe('medium');
            expect(detectSOSLevel('toang rồi')).toBe('medium');
            expect(detectSOSLevel('emo quá')).toBe('medium');
            expect(detectSOSLevel('mood đi xuống')).toBe('medium');
            expect(detectSOSLevel('depressed af')).toBe('medium');
        });

        it('should detect family issues', () => {
            expect(detectSOSLevel('bố mẹ không hiểu')).toBe('medium');
            expect(detectSOSLevel('bị la hoài')).toBe('medium');
            expect(detectSOSLevel('ghét về nhà')).toBe('medium');
        });
    });

    describe('LOW level - Normal stress', () => {
        it('should detect mild stress', () => {
            expect(detectSOSLevel('hơi buồn')).toBe('low');
            expect(detectSOSLevel('áp lực')).toBe('low');
            expect(detectSOSLevel('stress')).toBe('low');
            expect(detectSOSLevel('lo về thi')).toBe('low');
        });
    });

    describe('SAFE level - No risk detected', () => {
        it('should return safe for normal messages', () => {
            expect(detectSOSLevel('chào bạn')).toBe('safe');
            expect(detectSOSLevel('hôm nay trời đẹp')).toBe('safe');
            expect(detectSOSLevel('cảm ơn bạn')).toBe('safe');
        });

        it('should return safe for empty/null input', () => {
            expect(detectSOSLevel('')).toBe('safe');
            expect(detectSOSLevel(null)).toBe('safe');
            expect(detectSOSLevel(undefined)).toBe('safe');
        });
    });

    describe('Diacritics handling', () => {
        it('should match with and without diacritics', () => {
            expect(detectSOSLevel('mình muốn chết')).toBe('critical');
            expect(detectSOSLevel('minh muon chet')).toBe('critical');
            expect(detectSOSLevel('MÌNH MUỐN CHẾT')).toBe('critical');
        });
    });
});

describe('detectSOSLocal (backwards compatible)', () => {
    it('should return high for critical/high levels', () => {
        expect(detectSOSLocal('mình muốn chết')).toBe('high');
        expect(detectSOSLocal('tuyệt vọng quá')).toBe('high');
    });

    it('should return safe for medium/low/safe levels', () => {
        expect(detectSOSLocal('buồn quá')).toBe('safe');
        expect(detectSOSLevel('hơi stress')).toBe('low');
        expect(detectSOSLocal('chào bạn')).toBe('safe');
    });
});

describe('sosMessage', () => {
    it('should return critical message for critical level', () => {
        const msg = sosMessage('critical');
        expect(msg).toContain('lo lắng');
        expect(msg).toContain('1800 599 920');
        expect(msg).toContain('111');
    });

    it('should return high message for high level', () => {
        const msg = sosMessage('high');
        expect(msg).toContain('lo cho bạn');
    });

    it('should return default message for other levels', () => {
        const msg = sosMessage('medium');
        expect(msg).toBeTruthy();
    });
});

