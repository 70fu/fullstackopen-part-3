const express = require('express')
const morgan = require('morgan');
const app = express()

app.use(express.json());
app.use(morgan('tiny'));

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

app.get('/info', (request, response)=>{
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date().toString()}</p>
    `);
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id);

    const person = persons.find((p)=>p.id===id);

    if(person){
        response.json(person);
    }
    else{
        response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id);

    const person = persons.find((p)=>p.id===id);
    if(person){
        persons = persons.filter((p)=>p.id!==id);
        response.status(204).end();
    } else{
        response.status(404).end();
    }
})

app.post('/api/persons', (request, response)=>{
    const body = request.body;

    //check if body is valid
    if(!body.name || !body.number){
        return response.status(400).json({error:"name and number must be given"});
    }
    if(persons.find((p)=>p.name===body.name)){
        return response.status(400).json({error:"name must be unique"});
    }

    const person = {
        id:Math.floor(Math.random()*Number.MAX_SAFE_INTEGER),
        name:body.name,
        number:body.number
    };

    persons = persons.concat(person);

    response.status(201).send(person);
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})