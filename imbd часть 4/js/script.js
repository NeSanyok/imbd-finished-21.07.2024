changeTheme();

document.getElementById("changeBtn").addEventListener("click", changeTheme);

function changeTheme() {
  let changeBtn = document.getElementById("changeBtn");
  changeBtn.classList.toggle("active");

  let body = document.querySelector("body");
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "white");
  }
}

function checkItem() {
  let theme = localStorage.getItem("theme");
  if (theme == "dark") {
    let changeBtn = document.getElementById("changeBtn");
    changeBtn.classList.add("active");

    let body = document.querySelector("body");
    body.classList.add("dark");
  }
}



async function sendRequest(url, method, data) {
  if (method == "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method == "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET",
    });
    response = await response.json();
    return response;
  }
}

let searchBtn = document.querySelector(".search button");
searchBtn.addEventListener("click", searchMovie);

let message = document.querySelector(".message");
let loader = document.querySelector(".loader");

async function searchMovie() {
  message.style.display = "none";
  loader.style.display = "block";

  let search = document.getElementsByName("search")[0].value;
  let movie = await sendRequest("http://www.omdbapi.com/", "GET", {
    apikey: "5103800d",
    t: search,
  });

  loader.style.display = "none";
  if (movie.Response == "False") {
    message.innerHTML = movie.Error;
    message.style.display = "block";
  } else {
    showMovie(movie);
    searchSimilarMovies(search);
  }

  console.log(movie);
}

function showMovie(movie) {
  let movieTitleH2 = document.querySelector(".movieTitle h2");
  movieTitleH2.innerHTML = movie.Title;

  let movieTitle = document.querySelector(".movieTitle");
  movieTitle.style.display = "block";

  let movieDiv = document.querySelector(".movie");
  movieDiv.style.display = "flex";

  let movieImage = document.querySelector(".movieImage");
  movieImage.style.backgroundImage = `url("${movie.Poster}")`;

  let movieDesc = document.querySelector(".movieDesc");
  movieDesc.innerHTML = "";

  let dataArray = [
    "imdbRating",
    "Actors",
    "Language",
    "Country",
    "Year",
    "Released",
    "Plot",
  ];

  dataArray.forEach((key) => {
    movieDesc.innerHTML =
      movieDesc.innerHTML +
      `
    <div class="desc">
      <div class="movieLeft">${key}</div>
      <div class="movieRight">${movie[key]}</div>
    </div>`;
  });
}

async function searchSimilarMovies(title) {
  let similarMovies = await sendRequest("http://www.omdbapi.com/", "GET", {
    apikey: "5103800d",
    s: title,
  });

  console.log(similarMovies);

  if (similarMovies.Response == "False") {
    document.querySelector(".similarTitle").style.display = "none";
    document.querySelector(".similarMovies").style.display = "none";
  } else {
    document.querySelector(
      ".similarTitle h2"
    ).innerHTML = `Похожих фильмов ${similarMovies.totalResults}`;
    showSimilarMovies(similarMovies.Search);
  }
}

function showSimilarMovies(movies) {
  let similarMoviesContainer = document.querySelector(".similarMovies");
  let similarTitle = document.querySelector(".similarTitle");
  similarMoviesContainer.innerHTML = "";

  movies.forEach((movie) => {
    const exists = favs.some((fav) => fav.imdbid == movie.imdbID);
    let favClass = "";
    if (exists) {
      favClass = "active";
    }

    similarMoviesContainer.innerHTML =
      similarMoviesContainer.innerHTML +
      `
    <div class="similarCard" style="background-image:url('${movie.Poster}');">
      <div class="favStar" data-poster="${movie.Poster}" data-title="${movie.Title}" data-imdbid="${movie.imdbId}"></div>
      <h3>${movie.Title}</h3>
    </div>`;
  });

  similarMoviesContainer.style.display = "grid";
  similarTitle.style.display = "block";

  activeFavBtns();
}
// чтоб звезды горели
function activeFavBtns() {
  document.querySelectorAll(".favStar").forEach((favBtn) => {
    favBtn.addEventListener("click", addToFav);
  });
}

let favs = localStorage.getItem("favs");
if (!favs) {
  favs = [];
  localStorage.setItem("favs", JSON.stringify(favs));
} else {
  favs = JSON.parse(favs);
}
// добавить в избранное
function addToFav() {
  let favBtn = event.target;
  let poster = favBtn.getAttribute("data-poster");
  let title = favBtn.getAttribute("data-title");
  let imdbid = favBtn.getAttribute("data-imdbId");

  const exists = favs.some((fav) => fav.imdbid == imdbid);

  if (exists) {
    favs = favs.filter((fav) => fav.imdbid !== imdbid);
    localStorage.setItem('favs', JSON.stringify(favs));

    favBtn.classList.remove("active");
  } else {
    let fav = { imdbid, title, poster };
    favs.push(fav);
    localStorage.setItem("favs", JSON.stringify(favs));

    favBtn.classList.add("active");
  }
}
