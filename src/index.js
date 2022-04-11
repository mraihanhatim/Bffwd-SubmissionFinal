import 'bootstrap/dist/css/bootstrap.min.css';
import "./style/style.css";

const addedMovies = [];
const movieContainer = document.getElementById('movieContainer');
const searchForm = document.getElementById('searchBar');
const buttonContainer = document.getElementById('buttonContainer');
const clearButton = document.getElementById('clearButton');
const renderMovie = "render-add";
const SAVED_EVENT = "saved-movie";
const STORAGE_KEY = "MOVIE_STASH";

let movieItem;
let searchedTittle;
let next = document.getElementById('nextButton');
let previous = document.getElementById('previousButton');
let pageCount = 1;
let movieTittle;
let moviePoster;
let releaseDate;

const isStorageExist = () => {
    if (typeof (Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

const loadDataFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let storagedata = JSON.parse(serializedData);

    if (storagedata !== null) {
        for (let movie of storagedata) {
            addedMovies.push(movie);
        }
    }


    document.dispatchEvent(new Event(renderMovie));
}


const searchMovie = () => {
    const baseUrl = "https://api.themoviedb.org/3/search/movie?api_key=930aaeb9d52031686c1b23d592d94529&query";
    const posterUrl = "https://image.tmdb.org/t/p/original/";

    fetch(`${baseUrl}=${searchedTittle}&page=${pageCount}`)
        .then(res => {
            return res.json()
        })
        .then(data => {
            console.log(data);

            if (data.total_results == 0) {
                movieContainer.innerHTML = `<h3>There's no result for ${document.getElementById('inputTittle').value}</h3>`;
            }
            else {
                movieContainer.innerHTML = "";

                for (let movieDetails of data.results) {
                    movieTittle = movieDetails.title;
                    moviePoster = movieDetails.poster_path;
                    if (movieDetails.release_date == "") {
                        releaseDate = "unknown";
                    }
                    else {
                        releaseDate = movieDetails.release_date;
                    };

                    const newElement = document.createElement('searched-movie');
                    movieContainer.append(newElement)


                }

                movieItem = document.querySelectorAll('searched-movie');
                for (let movieItems of movieItem) {


                    movieItems.childNodes[7].addEventListener('click', (event) => {
                        if (addedMovies.some(e => e.posterLink == movieItems.childNodes[1].getAttribute('src'))) {
                            alert("This movie already exist in your watched/not watched movies collection");
                        }
                        else {
                            const tittle = event.target.parentElement.childNodes[3].innerText;
                            const posterURL = event.target.parentElement.childNodes[1].getAttribute('src');
                            const date = event.target.parentElement.childNodes[5].innerText;

                            const watched = true;

                            const movieData = generateObject(posterURL, tittle, date, watched);
                            addedMovies.push(movieData);
                            console.log(addedMovies);
                            document.dispatchEvent(new Event(renderMovie));
                            saveData();
                        }

                    })

                    movieItems.childNodes[9].addEventListener('click', (event) => {
                        if (addedMovies.some(e => e.posterLink == movieItems.childNodes[1].getAttribute('src'))) {
                            alert("This movie already exist in your watched/not watched movies collection");
                        }
                        else {
                            const tittle = event.target.parentElement.childNodes[3].innerText;
                            const posterURL = event.target.parentElement.childNodes[1].getAttribute('src');
                            const date = event.target.parentElement.childNodes[5].innerText;

                            const watched = false;

                            const movieData = generateObject(posterURL, tittle, date, watched);
                            addedMovies.push(movieData);
                            console.log(addedMovies);
                            document.dispatchEvent(new Event(renderMovie));
                            saveData();
                        }

                    })

                }

                if (movieContainer.childElementCount > 0) {
                    buttonContainer.removeAttribute("style");
                }

                if (pageCount == 1) {
                    previous.setAttribute("style", "pointer-events: none; opacity: 0.5;");
                }
                else {
                    previous.removeAttribute("style");
                }

                if (data.total_pages == pageCount) {
                    next.setAttribute("style", "pointer-events: none; opacity: 0.5;");
                }
                else {
                    next.removeAttribute("style");
                }
            }
        })

        .catch(error => {
            const errorMessage = document.createElement('h3');
            errorMessage.innerText = error;
            movieContainer.innerHTML = "";
            buttonContainer.setAttribute('style', 'display:none;')
            movieContainer.append(errorMessage);
        });
};



const generateObject = (posterImg, tittle, date, status) => {
    return {

        posterLink: posterImg,
        movieTittle: tittle,
        movieDate: date,
        watched: status,
    }
};



searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    pageCount = 1;
    searchedTittle = document.getElementById('inputTittle').value;
    movieContainer.removeAttribute('style');
    searchMovie();
});

next.addEventListener('click', () => {
    pageCount++;
    searchMovie();
})

previous.addEventListener('click', () => {
    pageCount--;
    searchMovie();
})

clearButton.addEventListener('click', () => {
    movieContainer.innerHTML = "";
    movieContainer.setAttribute('style', "display:none;");
    buttonContainer.setAttribute('style', "display:none;");
    pageCount = 1;
})



//Custom Element
class searchedMovie extends HTMLElement {

    connectedCallback() {
        const posterUrl = "https://image.tmdb.org/t/p/original/";
        this.innerHTML = `
        <img src = "${posterUrl}${moviePoster}" alt = "${movieTittle}" width = "250px" height = "300px">
        <p>"${movieTittle}"</p>
        <p>(${releaseDate})</p>
        <button type="button" class="btn btn-outline-success pageButton btn-sm" id="nextButton">Watched</button>
        <button type="button" class="btn btn-outline-danger pageButton btn-sm" id="nextButton">Planned To Watch</button>
      `;
    }
}


customElements.define("searched-movie", searchedMovie);

document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY));
});


document.addEventListener("DOMContentLoaded", () => {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

