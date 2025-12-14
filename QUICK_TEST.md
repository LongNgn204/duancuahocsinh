# Quick Test - Login và Backend Sync

## Test nhanh bằng Browser Console

Mở DevTools (F12) → Console, paste code này:

```javascript
(async () => {
  const username = 'test_' + Date.now();
  console.log('🧪 Testing login...\n');
  
  // 1. Register
  console.log('1️⃣ Register:', username);
  const r1 = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  const d1 = await r1.json();
  console.log('Result:', d1);
  
  // 2. Login lần 1
  console.log('\n2️⃣ First login');
  const r2 = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  const d2 = await r2.json();
  console.log('User:', d2.user);
  console.log('Last login:', d2.user?.last_login || 'NULL');
  
  // 3. Đợi 2 giây
  await new Promise(r => setTimeout(r, 2000));
  
  // 4. Login lần 2
  console.log('\n3️⃣ Second login');
  const r3 = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username})
  });
  const d3 = await r3.json();
  console.log('Last login:', d3.user?.last_login);
  
  // 5. So sánh
  if (d2.user?.last_login && d3.user?.last_login) {
    const t1 = new Date(d2.user.last_login).getTime();
    const t2 = new Date(d3.user.last_login).getTime();
    if (t2 > t1) {
      console.log('\n✅ SUCCESS: last_login updated!');
    } else {
      console.log('\n❌ ERROR: last_login NOT updated!');
    }
  } else {
    console.log('\n⚠️ WARNING: last_login missing');
  }
})();
```

## Kiểm tra trong Admin Dashboard

1. Đăng nhập Admin
2. Vào tab **"Tất cả người dùng"**
3. Tìm user vừa test
4. Kiểm tra cột **"Lần đăng nhập cuối"**

## Kiểm tra Network Tab

1. DevTools → Network
2. Filter: `login`
3. Click request → Response tab
4. Xem có `last_login` trong response không

## Expected Results

✅ **Success:**
- Response có `user.last_login` (không null sau login lần 2)
- `last_login` được update mỗi lần login
- Admin Dashboard hiển thị timestamp đúng

❌ **Error:**
- `last_login` luôn null
- `last_login` không thay đổi giữa 2 lần login
- Backend logs không có `[Auth] Updated last_login`

