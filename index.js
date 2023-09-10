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
app.use(morgan((tokens, req,res)=>{
    let tokenArr = [
        tokens.method(req,res),
        tokens.url(req,res),
        tokens.status(req,res),
        tokens.res(req,res,'content-length'),'-',
        tokens['response-time'](req,res), 'ms',
    ];

    if(req.method === 'POST'){
        tokenArr.push(JSON.stringify(req.body));
    }

    return tokenArr.join(' ');
}));

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

/*app.get('/info', (request, response)=>{
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date().toString()}</p>
    `);
})*/

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people=>{
        response.json(people);
    })
})

app.get('/api/persons/:id', (request, response)=>{
    Person.findById(request.params.id).then(person=>{
        response.json(person);
    })
})

app.delete('/api/persons/:id', (request, response)=>{
    return response.status(501).end();

    /*const id = Number(request.params.id);

    const person = persons.find((p)=>p.id===id);
    if(person){
        persons = persons.filter((p)=>p.id!==id);
        response.status(204).end();
    } else{
        response.status(404).end();
    }*/
})

app.post('/api/persons', (request, response)=>{
    const body = request.body;

    //check if body is valid
    if(!body.name || !body.number){
        return response.status(400).json({error:"name and number must be given"});
    }
    /*if(persons.find((p)=>p.name===body.name)){
        return response.status(400).json({error:"name must be unique"});
    }*/

    const person = new Person({
        name:body.name,
        number:body.number
    });

    person.save().then(savedPerson=>{
        response.status(201).send(savedPerson);
    });
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})