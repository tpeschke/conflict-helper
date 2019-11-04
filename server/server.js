const express = require('express')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , socket = require('socket.io')
    , variables = require('./variables')
    , path = require('path')

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
        io.emit(`${data.room}-message`, data)
    })

})
