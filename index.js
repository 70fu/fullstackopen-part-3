//import local environment variables before doing anything
require('dotenv').config();
const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const app = express()
const Person = require('./models/person')

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'))
app.use(morgan((tokens, req, res) => {
    let tokenArr = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
    ];

    if (req.method === 'POST') {
        tokenArr.push(JSON.stringify(req.body));
    }

    return tokenArr.join(' ');
}));

/*app.get('/info', (request, response)=>{
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date().toString()}</p>
    `);
})*/

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(people => {
        response.json(people);
    })
        .catch(error => next(error));
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        //if person has been found, return
        if (person) {
            response.json(person);
        }
        else {
            response.status(404).end();
        }
    })
        .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const updatedFields = {
        name: body.name,
        number: body.number
    };
    Person.findByIdAndUpdate(request.params.id, updatedFields, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
        if (updatedPerson) {
            response.json(updatedPerson);
        }
        else {
            response.status(404).end();
        }
    })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch(error => next(error));
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save()
        .then(savedPerson => {
            response.status(201).send(savedPerson);
        })
        .catch(error => next(error));
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message });
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})