const express = require('express')
const bodyParser = require('body-parser')
const { Server } = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://video-call-u1et.vercel.app"],
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json())

const emailtoSocketMapping = new Map()
const sockettoEmailMapping = new Map()

io.on('connection', socket => {
    console.log("New Connection")
    socket.on("join-room", (data) => {
        const { roomId, emailId } = data
        console.log('User', emailId, 'joined-room', roomId)
        emailtoSocketMapping.set(emailId, socket.id)
        sockettoEmailMapping.set(socket.id,emailId )
        socket.join(roomId)
        socket.emit('joined-room', {roomId})
        socket.broadcast.to(roomId).emit("user-joined", { emailId })
    })

    socket.on('call-user', (data) => {
        const {emailId, offer} = data
        const fromEmail = sockettoEmailMapping.get(socket.id)
        const socketId = emailtoSocketMapping.get(emailId)

        socket.to(socketId).emit('incoming-call',{from: fromEmail, offer})
    })

    socket.on('call-accepted', data => {
        const {emailId,ans} = data
        const socketId = emailtoSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted',{ans})
    })

    socket.on('ice-candidate', data => {
        const {emailId, candidate} = data
        const socketId = emailtoSocketMapping.get(emailId)
        if (socketId) {
            socket.to(socketId).emit('ice-candidate', {candidate})
        }
    })

})

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
    console.log(`Server Started at port ${PORT}`)
})