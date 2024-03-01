const http = require('http');

const server = http.createServer((request, response) => {
    if (request.url === '/healthcheck') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ status: 'UP' }));
    }
    else if (request.url === '/user') {
        var edad = 18;
        var name = "Luis";

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
            user: {
                name: name,
                age: edad
            }
        }));
    }
    else {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Servidor corriendo en http://127.0.0.1:3000/');
});
