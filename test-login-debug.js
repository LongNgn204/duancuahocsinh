// Debug test - xem response thực tế
const API_BASE = process.env.API_BASE || 'https://ban-dong-hanh-worker.stu725114073.workers.dev';

async function debugLogin() {
    const username = `debug_${Date.now()}`;
    
    console.log('🔍 Debug Login Response...\n');
    
    // Register
    const r1 = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    });
    const d1 = await r1.json();
    console.log('1. Register response:', JSON.stringify(d1, null, 2));
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Login
    const r2 = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username})
    });
    const rawText = await r2.text();
    console.log('\n2. Login raw response:', rawText);
    
    try {
        const d2 = JSON.parse(rawText);
        console.log('   Parsed response:', JSON.stringify(d2, null, 2));
        console.log('\n   User object keys:', Object.keys(d2.user || {}));
        console.log('   last_login value:', d2.user?.last_login);
        console.log('   last_login type:', typeof d2.user?.last_login);
    } catch (e) {
        console.error('   Parse error:', e);
    }
}

debugLogin().catch(console.error);

