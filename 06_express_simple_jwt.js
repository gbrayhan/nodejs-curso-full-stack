require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const JWT_SECRET = process.env.JWT_MY_SECRET_KEY;

// Generar un token con un usuario
app.post('/token', (req, res) => {
    const { user, password } = req.body;

    if (!user) {
        return res.status(400).send('User is required');
    }
    if(password !== '1234'){
        return res.status(401).send('Invalid password');
    }

    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
});

const validateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }
        req.user = decoded.user;
        next();
    });
};

app.get('/protected', validateJWT, (req, res) => {
    res.send(`Welcome ${req.user}, you are authorized`);
});


// Validar que el JWT_SECRET esté definido ya que es esencial para el funcionamiento del servicio
if (!JWT_SECRET) {
    console.error('JWT_SECRET is required on your configuration file');
    process.exit(1); // truena el servicio y lo para
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
