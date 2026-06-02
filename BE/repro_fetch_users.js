const http = require('http');

const loginBody = JSON.stringify({ username: 'hoangdinhkhai1011@gmail.com', password: '123456' });

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => resolve({ statusCode: res.statusCode, body: raw }));
        });

        req.on('error', reject);
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

(async () => {
    try {
        const loginRes = await request(
            {
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginBody),
                },
            },
            loginBody
        );
        console.log('LOGIN', loginRes.statusCode, loginRes.body);
        const token = JSON.parse(loginRes.body).token;
        const usersRes = await request(
            {
                hostname: 'localhost',
                port: 5000,
                path: '/api/users',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('USERS', usersRes.statusCode, usersRes.body);
    } catch (err) {
        console.error(err);
    }
})();
