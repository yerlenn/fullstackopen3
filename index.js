const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }) 
})

app.get('/info', (request, response) => {
    const length = Person.countDocuments({}).then(count => {
        const time = new Date()
        response.send(`<p>Phonebook has info for ${count} </p> <p>${time}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
    // const id = request.params.id
    // const person = persons.find(person => person.id === id)
    // response.json(person)
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    // const id = request.params.id
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
})

app.use(express.json())

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (persons.find(person => person.name === body.name)) {
    //     console.log('here')
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // } 

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
        response.json(savedPerson)
        })
        .catch(error => next(error)) 
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    // const person = {
    //     name: body.name,
    //     number: body.number
    // }

    Person.findByIdAndUpdate(
        request.params.id, 
        {name, number}, 
        { new:true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('running')
})