const socket = io();


const loadMoreContainer = document.createElement("div");
loadMoreContainer.classList.add('loadMoreContainer');
var loadMoreBtn = document.createElement("button");
const loadMoreSpinner = document.createElement("img");
loadMoreSpinner.src = 'loading.gif';
loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p>';
loadMoreBtn.classList.add('loadMoreBtn');
loadMoreContainer.appendChild(loadMoreBtn);

const twitterFeeding = document.querySelector('#twitter-feed');
const twitterLoader = document.querySelector('#twitter-loader');


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

socket.on('tweetIds', data => {
    console.log(data)
    twttr.ready(
      function (twttr) {
          // bind events here
          data.forEach(tweetID => {
              twttr.widgets.createTweet(
                  `${tweetID}`,
                  twitterFeeding,
                  {
                      align: 'center'
                  })
                  .then(function (el) {
                      console.log("Tweet displayed.")
                      
                      twitterFeeding.appendChild(loadMoreContainer);
                      loadMoreBtn.setAttribute("id", "load-more");
                      loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p>';
                  })
                  .then( () => {
                    twitterLoader.parentNode.removeChild(twitterLoader);
                    twitterFeeding.classList.add('full-opacity');
                  })
                  .catch((error) => {
                    console.log(error)
                  })
          })
      }
    );
})

loadMoreBtn.addEventListener('click', () => {
  socket.emit('loadMore', 'loadMoreEvent');
  loadMoreBtn.innerHTML = '<p>LOAD MORE <i class="fas fa-angle-down"></i></p><img src="loading.gif" alt="loading-spinner">';
  // loadMoreContainer.appendChild(loadMoreSpinner);
});

twitterFeeding.addEventListener('scroll', (e) => {
  const twitterHeader = document.querySelector('#twitter-header');
  if(twitterFeeding.scrollTop > 0) {
    twitterHeader.classList.add('twitter-header-shadow');
  } else {
    twitterHeader.classList.remove('twitter-header-shadow');
  }
}) 