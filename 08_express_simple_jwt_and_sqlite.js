require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura la conexión a la base de datos
const db = new sqlite3.Database('08_db_sqlite.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});


app.use(express.json());
const JWT_SECRET = process.env.JWT_MY_SECRET_KEY;

const validateJWT = (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return response.status(401).send('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];
    debugger;
    jwt.verify(token, JWT_SECRET, (err, decoded) => {

        if (err) {
            return response.status(401).send('Invalid token');
        }
        request.user = decoded.user;
        next();
    });
};

app.get('/usuarios-test', (request, response) => {
    const query = 'SELECT id, nombre, edad FROM pruebastemporal';

    db.all(query, [], (err, rows) => {
        if (err) {
            return response.status(500).json({error: err.message});
        }
        response.json(rows);
    });
});

app.post('/crear-usuarios', (request, response) => {
    const { nombre, edad } = request.body;

    const query = 'INSERT INTO pruebastemporal (nombre, edad) VALUES (?, ?)';

    db.run(query, [nombre, edad], function(err) {
        if (err) {
            return response.status(500).json({ error: err.message });
        }
        response.json({ id: this.lastID, nombre, edad });
    });
})

// Generar un token con un usuario
app.post('/create-token', (request, response) => {
    const { user, password } = request.body;

    const query = 'SELECT user, password FROM users';

    db.all(query, [], function (err,rows){
        const user = rows.find(register => register.user === request.body.user);
        if (!user) {
            return response.status(401).send('Invalid credentials');
        }
        if(password !== user.password){
            return response.status(401).send('Invalid credentials');
        }
        if (err) {
            return response.status(500).json({ error: err.message });
        }
        const token = jwt.sign({ user: request.body.user }, JWT_SECRET, { expiresIn: '1h' });
        response.send({ token });
    })
});


app.post('/protected', validateJWT, (request, response) => {
    debugger;
    response.send(`Welcome ${request.user}, you are authorized`);
});

app.get('/users', (request, response) => {
    const query = 'SELECT id, user, password FROM users';

    db.all(query, [], (err, rows) => {
        if (err) {
            return response.status(500).json({error: err.message});
        }
        response.json(rows);
    });
});


app.post('/create-user', (request, response) => {
    const { user, age, password } = request.body;

    const query = 'INSERT INTO users (user, password, age) VALUES (?, ?, ?)';

    db.run(query, [user, password, age], function(err) {
        if (err) {
            return response.status(500).json({ error: err.message });
        }
        response.json({ id: this.lastID, user, age, password });
    });
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la conexión con la base de datos', err.message);
        } else {
            console.log('Conexión con la base de datos cerrada');
        }
        process.exit();
    });
});

// Validar que el JWT_SECRET esté definido ya que es esencial para el funcionamiento del servicio
if (!JWT_SECRET) {
    console.error('JWT_SECRET is required on your configuration file');
    process.exit(1); // truena el servicio y lo para
}
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
