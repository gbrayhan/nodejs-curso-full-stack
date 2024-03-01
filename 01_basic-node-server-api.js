const http = require('http');

const server = http.createServer((request, response) => {
    const name = "Luis";

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(`{
        "user": {
            "name": "${name}",
            "age": 18
        }
}`);
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Servidor corriendo en http://127.0.0.1:3000/');
});