# Testing Guide - Bạn Đồng Hành

## Tổng quan

Dự án sử dụng **Vitest** cho unit tests và integration tests, và **Playwright** cho E2E tests.

## Cấu trúc Tests

```
backend/workers/__tests__/
  ├── sanitize.test.js          # Unit tests cho sanitizeInput
  ├── xp.test.js                # Unit tests cho XP/Level calculation
  ├── streak.test.js            # Unit tests cho Streak calculation
  └── integration.test.js       # Integration tests cho API endpoints

frontend/src/
  ├── utils/__tests__/
  │   └── sosDetector.test.js   # Unit tests cho SOS detection
  └── __tests__/
      └── e2e.test.js           # E2E tests cho user flows

backend/workers/
  └── ai-proxy.test.js          # Unit tests cho risk classification
```

## Chạy Tests

### Backend Tests

```bash
cd backend
npm test                    # Chạy tất cả tests
npm run test:watch         # Chạy tests ở chế độ watch
```

### Frontend Tests

```bash
cd frontend
npm test                    # Chạy tất cả tests
npm run test:watch         # Chạy tests ở chế độ watch
```

### E2E Tests (Playwright)

```bash
cd frontend
npm run e2e:install        # Cài đặt Playwright browsers (lần đầu)
npm run e2e                # Chạy E2E tests
npm run e2e:headed        # Chạy E2E tests với UI
```

## Test Coverage

### Unit Tests

1. **sosDetector.test.js**
   - ✅ CRITICAL level detection (suicide intent, self-harm)
   - ✅ HIGH level detection (hopelessness, worthlessness)
   - ✅ MEDIUM level detection (depression, family issues)
   - ✅ LOW level detection (mild stress)
   - ✅ SAFE level (normal messages)
   - ✅ Diacritics handling

2. **sanitize.test.js**
   - ✅ Valid inputs
   - ✅ Prompt injection detection (50+ patterns)
   - ✅ Invalid inputs (null, empty, wrong type)
   - ✅ Length truncation (2000 chars max)

3. **xp.test.js**
   - ✅ Level calculation from XP
   - ✅ XP needed for next level
   - ✅ XP progress percentage
   - ✅ XP rewards for actions

4. **streak.test.js**
   - ✅ Streak calculation from dates
   - ✅ Consecutive days detection
   - ✅ Streak breaking on gaps
   - ✅ 7-day and 30-day achievements

5. **ai-proxy.test.js** (existing)
   - ✅ Risk classification (red/yellow/green)
   - ✅ Input sanitization

### Integration Tests

**integration.test.js**
- ✅ Auth API (username validation, uniqueness)
- ✅ Data API (gratitude, journal, XP rewards)
- ✅ Forum API (post creation, validation)
- ✅ SOS API (event logging, risk levels)
- ✅ Admin API (authentication, ban/unban)

### E2E Tests

**e2e.test.js**
- ✅ Onboarding flow
- ✅ Chat flow (message, SOS detection)
- ✅ Gratitude Jar flow (add entry, XP, streak)
- ✅ Journal flow (save entry, sentiment)
- ✅ Focus Timer flow (start, complete, XP)
- ✅ Game flow (play, save score, XP)
- ✅ Settings flow (export data, delete account)
- ✅ Forum flow (create post, upvote, comment)

## Test Patterns

### Unit Test Pattern

```javascript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../module.js';

describe('functionToTest', () => {
    it('should handle normal case', () => {
        expect(functionToTest('input')).toBe('expected');
    });

    it('should handle edge case', () => {
        expect(() => functionToTest(null)).toThrow('error');
    });
});
```

### Integration Test Pattern

```javascript
import { describe, it, expect, beforeAll } from 'vitest';

describe('API Integration', () => {
    let mockEnv;

    beforeAll(() => {
        mockEnv = createMockEnv();
    });

    it('should handle API request', async () => {
        const result = await apiFunction(mockEnv);
        expect(result).toBeTruthy();
    });
});
```

## Best Practices

1. **Test Naming**: Mô tả rõ ràng test case
   - ✅ `should detect suicide intent`
   - ❌ `test1`

2. **Test Isolation**: Mỗi test độc lập, không phụ thuộc nhau

3. **Mock Data**: Sử dụng mock data thay vì real API calls

4. **Edge Cases**: Test cả edge cases (null, empty, invalid)

5. **Coverage**: Aim for >80% code coverage

## CI/CD Integration

Tests sẽ chạy tự động trong CI/CD pipeline:

```yaml
# .github/workflows/test.yml (example)
- name: Run tests
  run: |
    cd backend && npm test
    cd ../frontend && npm test
```

## Debugging Tests

### Vitest Debug Mode

```bash
npm run test:watch -- --reporter=verbose
```

### Playwright Debug Mode

```bash
npm run e2e:headed
# Hoặc
npx playwright test --debug
```

## Thêm Tests Mới

1. Tạo file test trong thư mục `__tests__` tương ứng
2. Import function cần test
3. Viết test cases với `describe` và `it`
4. Chạy `npm test` để verify
5. Commit với message: `test: add tests for [feature]`

## Notes

- Tests chạy trong Node.js environment (không phải browser)
- Mock Cloudflare Workers environment cho integration tests
- E2E tests cần Playwright browsers installed
- Tests không thay đổi production data

