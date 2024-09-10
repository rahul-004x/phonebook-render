const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors())
app.use(express.static('dist'))


const customLogger = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    req.customBody = JSON.stringify(req.body); 
  }
  next();
};

app.use(customLogger);


morgan.token('body', (req) => req.customBody || '');


app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    tokens.body(req, res) 
  ].join(' ');
}));

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (requenst, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const listOfEntries = persons.length
    const currentTime = new Date()

    response.send(
        `<p>Phonebook has info for ${listOfEntries} persons</p>
        <p>${currentTime}</p>`

    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id 
    const person = persons.find(note => note.id === id) 
    if (person) {
      response.json(person)
    } else {
      response.status(404).send('<h1>Not Found <h1/>')
    }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(note => note.id !== id);
  
    response.status(200).send('Contact has been removed');
  });
  
  

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (requesnt, response) => {
    const body = requesnt.body

    if (!body.name || !body.number){
        return response.status(400).json({error: `name or number is missing`})
    }

    const personExist = persons.some(person => person.name === body.name);
    if(personExist){
        return response.status(400).json({error: `name must be unique`})
    }

    const newPerosn = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(newPerosn)

    response.json(newPerosn)
})

const PORT = 3002
app.listen(PORT, () => {
    console.log(`server running of ${PORT} port`)
})
