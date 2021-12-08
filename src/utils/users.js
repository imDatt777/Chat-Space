const users = [];

// addUser, removeUser, getUser, getUsersInSpace

const addUser = ({id, username, space}) =>{
    // Cleaning Data
    username = username.trim().toLowerCase();
    space = space.trim().toLowerCase();

    // Validating the Data
    if(!username || !space){
        return {
            error: 'Username and space are required!',
        }
    }

    // Checking an existing user
    const existingUser = users.find((user)=>{
        return user.space === space && user.username === username;
    })

    if(existingUser){
        return {
            error: 'Username already exists!',
        }
    }

    // Finally storing a user
    const user = { id, username, space};
    users.push(user);
    return {user};
}

const removeUser = (id) =>{
    // Finding index to remove the user
    const index = users.findIndex((user)=>{
        return user.id === id ;
    })

    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

const getUser = (id) =>{
    return users.find((user)=>{
        return user.id === id;
    });
}

const getUsersInSpace = (space) =>{
    return users.filter((user)=>{
        return user.space === space;
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInSpace,
}