# Hướng dẫn Test Login và Kiểm tra Backend

## Cách 1: Test bằng Browser DevTools

### Bước 1: Mở ứng dụng và DevTools
1. Mở ứng dụng trong browser
2. Nhấn F12 để mở DevTools
3. Vào tab **Console**

### Bước 2: Test Login
```javascript
// Test login với username có sẵn hoặc mới
const testLogin = async () => {
  const username = 'test_user_' + Date.now();
  
  // 1. Register
  console.log('1. Registering...');
  const registerRes = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const registerData = await registerRes.json();
  console.log('Register result:', registerData);
  
  // 2. Login lần 1
  console.log('\n2. First login...');
  const login1Res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const login1Data = await login1Res.json();
  console.log('First login:', login1Data);
  console.log('Last login:', login1Data.user?.last_login);
  
  // Đợi 2 giây
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. Login lần 2
  console.log('\n3. Second login...');
  const login2Res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const login2Data = await login2Res.json();
  console.log('Second login:', login2Data);
  console.log('Last login:', login2Data.user?.last_login);
  
  // 4. So sánh
  if (login1Data.user?.last_login && login2Data.user?.last_login) {
    const time1 = new Date(login1Data.user.last_login).getTime();
    const time2 = new Date(login2Data.user.last_login).getTime();
    if (time2 > time1) {
      console.log('✅ SUCCESS: last_login was updated!');
    } else {
      console.log('❌ ERROR: last_login was NOT updated!');
    }
  }
};

testLogin();
```

### Bước 3: Kiểm tra Network Tab
1. Vào tab **Network** trong DevTools
2. Filter: `login`
3. Click vào request `/api/auth/login`
4. Xem **Response** - phải có `last_login` trong user object

### Bước 4: Kiểm tra Backend Logs
Nếu có quyền truy cập backend logs, tìm:
```
[Auth] Updated last_login for user <id>
[Auth] Login successful for user <id> last_login: <timestamp>
```

## Cách 2: Test bằng cURL

```bash
# 1. Register
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user_123"}'

# 2. Login lần 1
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user_123"}'

# 3. Đợi vài giây, rồi login lần 2
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user_123"}'
```

## Cách 3: Test bằng Admin Dashboard

1. Đăng nhập vào Admin Dashboard
2. Vào tab **"Tất cả người dùng"**
3. Tìm user vừa đăng nhập
4. Kiểm tra cột **"Lần đăng nhập cuối"** - phải có timestamp

## Cách 4: Kiểm tra Database trực tiếp

Nếu có quyền truy cập database:

```sql
-- Xem tất cả users
SELECT id, username, created_at, last_login 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Xem user cụ thể
SELECT id, username, created_at, last_login 
FROM users 
WHERE username = 'test_user_123';

-- Kiểm tra last_login có được update không
SELECT 
  username,
  created_at,
  last_login,
  CASE 
    WHEN last_login IS NULL THEN '❌ NULL'
    WHEN last_login >= datetime('now', '-1 hour') THEN '✅ Recent'
    ELSE '⚠️ Old'
  END as status
FROM users
ORDER BY last_login DESC;
```

## Checklist

- [ ] Login response có `user.last_login`
- [ ] `last_login` được update mỗi lần login
- [ ] Backend logs hiển thị update thành công
- [ ] Admin Dashboard hiển thị `last_login` đúng
- [ ] Database có giá trị `last_login` không null (sau login)

## Troubleshooting

### last_login luôn null
- Kiểm tra SQL query có chạy không
- Kiểm tra database connection
- Xem backend logs có lỗi không

### last_login không update
- Kiểm tra `updateResult.changes` phải > 0
- Kiểm tra user.id có đúng không
- Kiểm tra database có constraint nào không

### Response không có last_login
- Kiểm tra SELECT query có lấy `last_login` không
- Kiểm tra response structure

