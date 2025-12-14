// Test script để kiểm tra login và backend sync
// Chạy: node test-login.js

const API_BASE = process.env.API_BASE || 'http://localhost:8787'; // Thay đổi theo backend URL của bạn

async function testLogin() {
    console.log('🧪 Testing Login Functionality...\n');

    // Test 1: Register user mới (nếu chưa có)
    const testUsername = `test_user_${Date.now()}`;
    console.log(`1️⃣  Registering user: ${testUsername}`);
    
    try {
        const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername })
        });
        const registerData = await registerRes.json();
        
        if (registerData.success) {
            console.log('✅ Register successful:', registerData.user);
        } else {
            console.log('⚠️  Register response:', registerData);
        }
    } catch (err) {
        console.error('❌ Register error:', err.message);
        return;
    }

    // Đợi 1 giây
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Login lần 1
    console.log(`\n2️⃣  First login for: ${testUsername}`);
    
    let login1Data;
    try {
        const login1Res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername })
        });
        login1Data = await login1Res.json();
        
        if (login1Data.success) {
            console.log('✅ First login successful');
            console.log('   User ID:', login1Data.user.id);
            console.log('   Username:', login1Data.user.username);
            console.log('   Created at:', login1Data.user.created_at);
            console.log('   Last login:', login1Data.user.last_login || 'null (first login)');
            
            if (!login1Data.user.last_login) {
                console.log('⚠️  WARNING: last_login is null after first login!');
            }
        } else {
            console.log('❌ First login failed:', login1Data);
            return;
        }
    } catch (err) {
        console.error('❌ First login error:', err.message);
        return;
    }

    // Đợi 2 giây
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Login lần 2 (để kiểm tra last_login được update)
    console.log(`\n3️⃣  Second login for: ${testUsername}`);
    
    let login2Data;
    try {
        const login2Res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername })
        });
        login2Data = await login2Res.json();
        
        if (login2Data.success) {
            console.log('✅ Second login successful');
            console.log('   User ID:', login2Data.user.id);
            console.log('   Last login:', login2Data.user.last_login);
            
            // So sánh last_login
            if (login1Data.user.last_login && login2Data.user.last_login) {
                const time1 = new Date(login1Data.user.last_login).getTime();
                const time2 = new Date(login2Data.user.last_login).getTime();
                
                if (time2 > time1) {
                    console.log('✅ SUCCESS: last_login was updated!');
                    console.log(`   First:  ${login1Data.user.last_login}`);
                    console.log(`   Second: ${login2Data.user.last_login}`);
                    console.log(`   Difference: ${Math.round((time2 - time1) / 1000)} seconds`);
                } else {
                    console.log('❌ ERROR: last_login was NOT updated!');
                    console.log(`   First:  ${login1Data.user.last_login}`);
                    console.log(`   Second: ${login2Data.user.last_login}`);
                }
            } else if (!login1Data.user.last_login && login2Data.user.last_login) {
                console.log('✅ SUCCESS: last_login was set on second login!');
            } else {
                console.log('⚠️  WARNING: last_login status unclear');
            }
        } else {
            console.log('❌ Second login failed:', login2Data);
        }
    } catch (err) {
        console.error('❌ Second login error:', err.message);
    }

    // Test 4: Kiểm tra Admin API để xem user trong database
    console.log(`\n4️⃣  Checking user in database (via Admin API)...`);
    console.log('   (This requires admin credentials - may fail)');
    
    try {
        // Note: Cần admin token để gọi API này
        // Bạn có thể test bằng cách query database trực tiếp
        console.log('   To verify in database, run:');
        console.log(`   SELECT id, username, created_at, last_login FROM users WHERE username = '${testUsername}';`);
    } catch (err) {
        console.log('   (Admin check skipped - requires authentication)');
    }

    console.log('\n✅ Test completed!');
    console.log(`\n📝 Test user: ${testUsername}`);
    console.log('   You can check the database directly to verify last_login was saved.');
}

// Run test
testLogin().catch(console.error);

