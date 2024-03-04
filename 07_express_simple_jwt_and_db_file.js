require('dotenv').config();
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const JWT_SECRET = process.env.JWT_MY_SECRET_KEY;

function getUsersFromFile(filename) {
    let data
    try {
        data = fs.readFileSync(filename, 'utf8');
    } catch (err) {
        console.error(err);
        return [];
    }
    const lines = data.split('\n');
    // delete first line because it is the header using destructuring
    const [header, ...linesWithoutHeader] = lines;
    console.log(`reading file ${filename} with header: `, header);

    return linesWithoutHeader.map(line => {
        const arrayOfItems = line.split(',');

        const [id, name, password, email, age, address] = arrayOfItems;
        return { id: parseInt(id), password, name, email, age: parseInt(age), address };
    });
}

// function to add a new user to the file at the end
function addUserToFile(filename, newUser) {
    const newLine = `\n${newUser.id},${newUser.name},${newUser.password},${newUser.email},${newUser.age},${newUser.address}`;

    try {
        fs.appendFileSync(filename, newLine, 'utf8');
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }

}

function getUserByEmail(email) {
    const users = getUsersFromFile('07_db.txt');
    return users.find(register => register.email === email);
}


// Generar un token con un usuario
app.post('/token', (request, res) => {
    const { email, password } = request.body;

    const user = getUserByEmail(email);

    if (!user) {
        return res.status(401).send('Invalid credentials');
    }

    if(password !== user.password){
        return res.status(401).send('Invalid credentials');
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

app.get('/users', (req, reponse) => {
    const registers= getUsersFromFile('07_db.txt');
    // set header to json
    reponse.setHeader('Content-Type', 'application/json');
    reponse.send(registers);
});


app.post('/create-user', (request, res) => {
    // read from file 07_db.txt with structure id,name,email,age,address and then increment id and write to file

    // get registers from file
    const registers= getUsersFromFile('07_db.txt');

    // email is unique
    const emailExists = registers.find(register => register.email === request.body.email);
    if (emailExists) {
        return res.status(400).send('Email already exists');
    }

    const lastId = registers.map(register => register.id).sort((a, b) => b - a)[0];
    const newId = lastId + 1 || 1; // incremento uno al ultimo id

    const { name, password, email, age, address } = request.body;

    const newRegister = { id: newId, password, name, email, age, address };

    // add new register to array
    const successfullyCreated = addUserToFile('07_db.txt', newRegister);
    if (successfullyCreated) {
        res.status(201).send({  user: newRegister });
    } else {
        res.status(500).send('Error creating user');
    }

});



// Validar que el JWT_SECRET esté definido ya que es esencial para el funcionamiento del servicio
if (!JWT_SECRET) {
    console.error('JWT_SECRET is required on your configuration file');
    process.exit(1); // truena el servicio y lo para
}
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
