const http = require('http');

const server = http.createServer((req, res) => {
    var edad =   18;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!DOCTYPE html>
        <html>
        <head>
            <title>Página con Imágenes</title>
        </head>
        <body>
            <h1>Hola Mundo con Imagenes</h1>
            <h3>Edad: ${edad}</h3>
            <p>Aqui hay un par de imagenes:</p>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1025px-Cat03.jpg" alt="Imagen 1" width="300">
            <img src="https://www.codeproject.com/KB/GDI-plus/ImageProcessing2/img.jpg" alt="Imagen 2" width="300">
        </body>
        </html>
      `);
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Servidor corriendo en http://127.0.0.1:3000/');
});