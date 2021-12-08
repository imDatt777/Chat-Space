const socket=io();

// Elements 
const form = document.querySelector('#message-form');
const messageInput = document.querySelector('#message');
const sendBtn = document.querySelector('#btn');
const locbtn = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, space} =Qs.parse(location.search, {ignoreQueryPrefix: true});

// Auto-scrolling Logic
const autoscroll = () =>{
    // New message element
    const newMessage = messages.lastElementChild;
    newMessage.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
}

// Displaying Message on Screen
socket.on('message',(message)=>{
    console.log(message);
    // Rendering message 
    const html = Mustache.render(messageTemplate,{
        username: message.username,  // to display sender's username on top of messages
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

// Displaying locationMessage on screen
socket.on('locationMessage',(location)=>{
    console.log(location);
    // Rendering Location
    const html = Mustache.render(locationTemplate,{
        username: location.username, // to display sender's username on top of messages
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a'),
    });
    messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

// Data of users and space
socket.on('data',({ space, users} )=>{
    const html = Mustache.render(sidebarTemplate,{
        space,
        users,
    })
    document.querySelector('#sidebar').innerHTML = html;
})

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    // disable send here
    sendBtn.setAttribute('disabled','disabled');
    const message=messageInput.value;
    
    socket.emit('sendMessage',message,(error)=>{
        // enable here
        sendBtn.removeAttribute('disabled');
        messageInput.value='';
        messageInput.focus();
        if(error){
            return console.log(error);
        }

        console.log('Message delivered!');
    });
})

locbtn.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!');
    }
    
    locbtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(error)=>{
            if(error){
                return console.log(error);
            }
            locbtn.removeAttribute('disabled');
            console.log('Location shared!')
        });
    })
})

// Joining a space
socket.emit('join',{username,space},(error)=>{
    // If any error occurs the user would fallback to the original join page
    if(error){
        alert(error)
        location.href='/';
    }
});