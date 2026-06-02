const http = require('http');

const loginBody = JSON.stringify({ username: 'hoangdinhkhai1011@gmail.com', password: '123456' });
const updateBody = JSON.stringify({ username: 'vanthanhhd029@gmail.com', fullname: 'Lê Văn Thành', phone: '0366577894', role: 'cashier' });

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

        const updateRes = await request(
            {
                hostname: 'localhost',
                port: 5000,
                path: '/api/users/2',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(updateBody),
                    Authorization: `Bearer ${token}`,
                },
            },
            updateBody
        );
        console.log('UPDATE', updateRes.statusCode, updateRes.body);
    } catch (err) {
        console.error(err);
    }
})();
