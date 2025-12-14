// Test API login thực tế
// Chạy: node test-login-api.js
// Hoặc: API_BASE=https://your-backend.com node test-login-api.js

const API_BASE = process.env.API_BASE || 'http://localhost:8787';

// Helper để tạo timeout signal (tương thích với Node.js cũ)
function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
}

async function checkServerHealth() {
    try {
        // Try to connect to a simple endpoint or root
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'OPTIONS',
            signal: createTimeoutSignal(3000) // 3 second timeout
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function testLoginAPI() {
    console.log('🧪 Testing Login API...\n');
    console.log(`📍 Backend URL: ${API_BASE}\n`);

    // Check if server is reachable first
    console.log('🔍 Checking server connection...');
    const serverReachable = await checkServerHealth();
    
    if (!serverReachable) {
        console.error('\n❌ Cannot connect to backend server!');
        console.error(`   URL: ${API_BASE}`);
        console.error('\n💡 Solutions:');
        console.error('   1. Make sure backend server is running:');
        console.error('      cd backend');
        console.error('      npx wrangler dev');
        console.error('\n   2. Or use production API:');
        console.error('      API_BASE=https://ban-dong-hanh-worker.stu725114073.workers.dev node test-login-api.js');
        console.error('\n   3. Check if port 8787 is correct (default for wrangler dev)');
        process.exit(1);
    }
    
    console.log('✅ Server is reachable\n');

    const testUsername = `test_${Date.now()}`;
    let userId = null;

    try {
        // Step 1: Register
        console.log('1️⃣  Registering user:', testUsername);
        const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername }),
            signal: createTimeoutSignal(10000) // 10 second timeout
        });

        if (!registerRes.ok) {
            console.error('❌ Register failed:', registerRes.status, registerRes.statusText);
            const errorText = await registerRes.text();
            console.error('Response:', errorText);
            return;
        }

        const registerData = await registerRes.json();
        if (registerData.success && registerData.user) {
            userId = registerData.user.id;
            console.log('✅ Register successful');
            console.log('   User ID:', userId);
            console.log('   Username:', registerData.user.username);
            console.log('   Created at:', registerData.user.created_at);
        } else {
            console.error('❌ Register failed:', registerData);
            return;
        }

        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: First Login
        console.log('\n2️⃣  First login');
        const login1Res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername }),
            signal: createTimeoutSignal(10000)
        });

        if (!login1Res.ok) {
            console.error('❌ First login failed:', login1Res.status, login1Res.statusText);
            const errorText = await login1Res.text();
            console.error('Response:', errorText);
            return;
        }

        const login1Data = await login1Res.json();
        if (login1Data.success && login1Data.user) {
            console.log('✅ First login successful');
            console.log('   User ID:', login1Data.user.id);
            console.log('   Last login:', login1Data.user.last_login || 'NULL');
            
            if (!login1Data.user.last_login) {
                console.log('   ⚠️  WARNING: last_login is NULL after first login');
            }
        } else {
            console.error('❌ First login failed:', login1Data);
            return;
        }

        // Wait 2 seconds
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Second Login
        console.log('\n3️⃣  Second login');
        const login2Res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUsername }),
            signal: createTimeoutSignal(10000)
        });

        if (!login2Res.ok) {
            console.error('❌ Second login failed:', login2Res.status, login2Res.statusText);
            const errorText = await login2Res.text();
            console.error('Response:', errorText);
            return;
        }

        const login2Data = await login2Res.json();
        if (login2Data.success && login2Data.user) {
            console.log('✅ Second login successful');
            console.log('   User ID:', login2Data.user.id);
            console.log('   Last login:', login2Data.user.last_login || 'NULL');

            // Compare last_login
            if (login1Data.user.last_login && login2Data.user.last_login) {
                const time1 = new Date(login1Data.user.last_login).getTime();
                const time2 = new Date(login2Data.user.last_login).getTime();
                const diffSeconds = Math.round((time2 - time1) / 1000);

                console.log('\n📊 Comparison:');
                console.log('   First login time:', login1Data.user.last_login);
                console.log('   Second login time:', login2Data.user.last_login);
                console.log('   Time difference:', diffSeconds, 'seconds');

                if (time2 > time1) {
                    console.log('\n✅ SUCCESS: last_login was updated correctly!');
                } else {
                    console.log('\n❌ ERROR: last_login was NOT updated!');
                    console.log('   Second login time should be greater than first');
                }
            } else if (!login1Data.user.last_login && login2Data.user.last_login) {
                console.log('\n✅ SUCCESS: last_login was set on second login!');
            } else {
                console.log('\n⚠️  WARNING: Cannot compare - last_login missing');
                console.log('   First:', login1Data.user.last_login);
                console.log('   Second:', login2Data.user.last_login);
            }
        } else {
            console.error('❌ Second login failed:', login2Data);
        }

        console.log('\n✅ Test completed!');
        console.log(`\n📝 Test user: ${testUsername} (ID: ${userId})`);
        console.log('   You can check this user in Admin Dashboard → "Tất cả người dùng"');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        
        if (error.name === 'AbortError' || error.message.includes('fetch failed')) {
            console.error('\n💡 Connection error detected!');
            console.error('   Possible causes:');
            console.error('   1. Backend server is not running');
            console.error('   2. Wrong URL or port');
            console.error('   3. Network/firewall blocking connection');
            console.error('\n   To start backend:');
            console.error('   cd backend');
            console.error('   npx wrangler dev');
            console.error('\n   Or test against production:');
            console.error('   API_BASE=https://ban-dong-hanh-worker.stu725114073.workers.dev node test-login-api.js');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Backend server is not running.');
            console.error('   Make sure backend is running on:', API_BASE);
            console.error('\n   Start it with:');
            console.error('   cd backend && npx wrangler dev');
        } else {
            console.error('\n   Full error:', error);
        }
        process.exit(1);
    }
}

// Run test
testLoginAPI();

