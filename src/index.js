const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage,generateLocation} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInSpace} = require('./utils/users');

const port = process.env.PORT || 3000;

const app = express();

// Refactoring server for socket.io
const server = http.createServer(app);
const io = socketio(server);

// Setting up public directory path
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

// New Connection
io.on('connection',(socket)=>{
    console.log('New WebSocket connection !');
    
    // Joining a space
    socket.on('join',({username,space},callback)=>{
        // The following addUser call would either give an error or a user
        const {error,user}=addUser({ id: socket.id, username, space});

        if(error){
            return callback(error); //error
        }
        // Else the user will be created and it will continue process
        socket.join(user.space);

        // Sending out new message on a new connection
        socket.emit('message',generateMessage('Chatbot','Welcome!'));

        // Emiting a message to everyone in a specific room
        socket.broadcast.to(user.space).emit('message',generateMessage('Chatbot',`${user.username} has joined this space!`));

        // Rendering data related to space and users
        io.to(user.space).emit('data',{
            space: user.space,
            users: getUsersInSpace(user.space)
        })

        callback();
        
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id);
        // filter for bad words
        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.space).emit('message',generateMessage(user.username,message));
        callback(); // Acknoeledgement of message being delivered
    })

    // Sending message after any user disconnected
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        // We want to remove a user only if it is previously connected
        if(user){
            io.to(user.space).emit('message',generateMessage('Chatbot',`${user.username} has left the space!`));
            io.to(user.space).emit('data',{
                space: user.space,
                users: getUsersInSpace(user.space)
            })
        }
    })

    // Location Sharing
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id);
        io.to(user.space).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();  // Callback for location shared !
    })

})

server.listen(port ,()=>{  // server.listen instead of app.listen here
    console.log(`Server is up and running on port ${port}`);
});
