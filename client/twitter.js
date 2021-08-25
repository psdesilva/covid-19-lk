// CONNECTING TO SERVER USING SOCKET.IO
const socket = io();

// CREATING A BUTTON TO LOAD MORE TWEETS
const loadMoreContainer = document.createElement("div");
loadMoreContainer.classList.add('loadMoreContainer');
var loadMoreBtn = document.createElement("button");
const loadMoreSpinner = document.createElement("img");
loadMoreSpinner.src = 'loading.gif';
loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p>';
loadMoreBtn.classList.add('loadMoreBtn');
loadMoreContainer.appendChild(loadMoreBtn);

// SELECTING RELEVANT DOM ELEMENTS AND ASSIGNING THEM TO VARIABLES
const twitterFeeding = document.querySelector('#twitter-feed');
const twitterLoader = document.querySelector('#twitter-loader');
const refreshTweets = document.querySelector('#refresh-tweets');
const twitter = document.querySelector('#twitter'); // 

// INITIALIZING THE TWITTER JAVASCRIPT WIDGET ON THE PAGE 
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));

// ONCE TWEET IDS ARRIVE FROM THE SERVER, LOOPING THROUGH THE ID ARRAY AND CREATING A TWEET FOR EACH ID USING THE TWITTER WIDGET
socket.on('tweetIds', data => {
    twttr.ready(
      function (twttr) {
          data.forEach(tweetID => { // Looping through array of tweet IDs
              twttr.widgets.createTweet( // Creating tweet from each ID
                  `${tweetID}`,
                  twitterFeeding,
                  {
                      align: 'center'
                  })
                  .then(function (el) {
                      twitterFeeding.appendChild(loadMoreContainer); // Attaching the load more button to the end of the feed
                      loadMoreBtn.setAttribute("id", "load-more");
                      loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p>';
                  })
                  .then( () => {
                    twitterLoader.parentNode.removeChild(twitterLoader); // Removing the loading spinner 
                    twitterFeeding.classList.add('full-opacity'); // Fading in the feed
                  })
                  .catch((error) => {
                    console.log(error)
                  })
          })
      }
    );
})

// WHEN LOAD MORE BUTTON IS CLICKED, REQUESTING THE SERVER FOR NEXT 10 TWEET IDS
loadMoreBtn.addEventListener('click', () => {
  socket.emit('loadMore', 'loadMoreEvent'); // Sending a load more event to the server
  loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p><img src="loading.gif" alt="">'; // Add the loading spinner next to the load more button
});

// ADDING A SHADOW TO THE BOTTOM OF THE HEADER ON SCROLL TO DISTINGUISH BETWEEN HEADER AND FEED EASIER
twitterFeeding.addEventListener('scroll', (e) => {
  const twitterHeader = document.querySelector('#twitter-header');
  if(twitterFeeding.scrollTop > 0) {
    twitterHeader.classList.add('twitter-header-shadow');
  } else {
    twitterHeader.classList.remove('twitter-header-shadow');
  }
});

// WHEN REFRESH BUTTON IS CLICKED, DISPLAYING LOADING SPINNER, CLEARING CURRENT TWEETS AND GETTING THE LATEST TWEET IDS FROM THE SERVER
refreshTweets.addEventListener('click', () => {
  twitter.appendChild(twitterLoader); // Displaying the loading spinner
  while (twitterFeeding.firstChild) { // Removing existing tweets
    twitterFeeding.removeChild(twitterFeeding.firstChild);
  }
  socket.emit('refresh', 'refreshEvent'); // Sending a refresh event to the server
})