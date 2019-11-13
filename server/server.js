const express = require('express')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , socket = require('socket.io')
    , variables = require('./variables')
    , path = require('path')
    , storage = {}

const app = new express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static(__dirname + `/../dist/conflict-helper`));

app.get('/*', (req, res)=>{
    res.sendFile(path.join(__dirname + '/../dist/conflict-helper/index.html'))
});

const io = socket(
    app.listen(variables.port, _ => {
    console.log(`And it burns, all that was, is, and will be ${variables.port}`);
}))

function checkStorageForRoom(room) {
    if (!storage[room]) {
        storage[room] = {messages: [], players: []}
    }
}

// ====================================================

io.on('connection', socket => {
    socket.on('sub', interval => {
        setInterval(_ => {
            socket.emit('timer', new Date());
        }, interval)
    })

    socket.on('turn', data => {
        io.emit(`${data.room}-turn`, data)
    })

    socket.on('message', data => {
        checkStorageForRoom(data.room)
        let roomStorage = storage[data.room]
        roomStorage.messages.push({message: data.message, role: data.role, team: data.team})
        if (data.code === 'newPlayer') {
            roomStorage.players.push({team: data.team, role: data.role, name: data.name, dicePoolCount: data.dicePoolCount, escalations: null, playerId: data.playerId})
        } else if (data.code === 'change') {
            roomStorage.players = roomStorage.players.map(val => {
                if (val.playerId === data.playerId) {
                    val[data.change] = data[data.change]
                    return val
                } else {
                    return val
                }
            })
        } else if (data.code === 'dicePoolChange') {
            roomStorage.players = roomStorage.players.map(val => {
                if (val.playerId === data.playerId) {
                    val.dicePoolCount = data.dicePoolCount
                    if (data.escalations) {
                        val.escalations = data.escalations
                    }
                    return val
                } else {
                    return val
                }
            })
        }
        data.storage = roomStorage 
        io.emit(`${data.room}-message`, data)
    })

    socket.on('leave', data => {
        io.emit(`${data.room}-leave`, data)
    })

    socket.on('rejectHelper', data => {
        io.emit(`${data.room}-rejectHelper`, data)
    })
})
