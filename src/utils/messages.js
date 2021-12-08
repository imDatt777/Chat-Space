// Rendering message with a timestamp
const generateMessage = (username,text) => {
    return {
        username, // to display sender's username on top of messages
        text,
        createdAt: new Date().getTime(),
    }
}

// Rendering location with a timestamp
const generateLocation = (username,url) => {
    return {
        username, // to display sender's username on top of messages
        url,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocation,
}