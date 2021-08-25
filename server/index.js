// IMPORTING REQUIRED NODE MODULES
const http = require('http');
const path = require('path');
const express = require('express');
const socketIo = require('socket.io');
const axios = require('axios').default;
const config = require('dotenv').config();

// DECLARING GLOBAL VARIABLES
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;
let apiData = null;
let ids = [];
let nextToken = null;

// SETTING UP SERVER USING EXPRESS
const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
});

app.use(express.static('client'))

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// ESTABLISHING CONNECTION WITH CLIENT USING SOCKET.IO
const io = socketIo(server);
io.on('connection', testFunction);

function testFunction (socket) {
    console.log('Socket Connection Made');
    getTweetIds(socket);
    //FUNCTION TO LOAD 10 MORE TWEETS
    //Added here because - socket.on did not accept a named function with the socket parameter
    socket.on('loadMore', () => {
        axios.get(`https://api.twitter.com/2/tweets/search/recent?query=(covid19sl%20OR%20covid19lk)%20-is%3Aretweet&next_token=${nextToken}`, {
    headers: {
    Authorization: 'Bearer ' + TOKEN //the token is a variable which holds the token
    }
    })
    .then(response => {
        ids = [];
        nextToken = '';
        tweetList = response.data.data;
        nextToken = response.data.meta.next_token;
        tweetList.forEach(tweet => {
            ids.push(tweet.id);
        })
        socket.emit('tweetIds', ids)
    })
    .catch(error => {
        console.log(error);
    })
    });
    socket.on('refresh', () => {
        axios.get('https://api.twitter.com/2/tweets/search/recent?query=(covid19sl%20OR%20covid19lk)%20-is%3Aretweet', {
    headers: {
        Authorization: 'Bearer ' + TOKEN // Appends the variable which holds the token to the header of the request
    }
    })
    .then(response => {
        ids = []; // Clears the tweet id array
        nextToken = ''; // Clears the token required for pagination
        tweetList = response.data.data; // Stores an array of tweet objects retrieved from the API
        nextToken = response.data.meta.next_token;  // Stores the token required for pagination
        tweetList.forEach(tweet => {  // Iterates through the tweetList Array to grab the ID of each tweet object
            ids.push(tweet.id);
        })
        socket.emit('tweetIds', ids)  // Emits the ID array to the client
    })
    .catch(error => {
        console.log(error); // Catches and logs and errors 
    })
    })
}

// MAKING THE INITIAL GET REQUEST TO THE TWITTER API USING AXIOS
function getTweetIds (socket) {
    axios.get('https://api.twitter.com/2/tweets/search/recent?query=(covid19sl%20OR%20covid19lk)%20-is%3Aretweet', {
    headers: {
    Authorization: 'Bearer ' + TOKEN // Appends the variable which holds the token to the header of the request
    }
    })
    .then(response => {
        ids = []; // Clears the tweet id array
        nextToken = ''; // Clears the token required for pagination
        tweetList = response.data.data; // Stores an array of tweet objects retrieved from the API
        nextToken = response.data.meta.next_token;  // Stores the token required for pagination
        tweetList.forEach(tweet => {  // Iterates through the tweetList Array to grab the ID of each tweet object
            ids.push(tweet.id);
        })
        socket.emit('tweetIds', ids)  // Emits the ID array to the client
    })
    .catch(error => {
        console.log(error); // Catches and logs and errors 
    })
}