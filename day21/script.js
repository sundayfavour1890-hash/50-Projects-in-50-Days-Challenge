const API_KEY = "YOUR_OMDB_API_KEY";

const API_URL = "https://www.omdbapi.com/";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");

const movieGrid = document.getElementById("movieGrid");
const message = document.getElementById("message");
const sectionTitle = document.getElementById("sectionTitle");

const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

const movieModal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeModal = document.getElementById("closeModal");

let currentSearch = "";
let currentPage = 1;
let totalPages = 1;
let requestId = 0;

// ESCAPE TEXT BEFORE ADDING TO HTML

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// GET MOVIE POSTER

function getPoster(poster) {
  if (
    typeof poster === "string" &&
    /^https:\/\/.+/i.test(poster)
  ) {
    return poster;
  }

  return "";
}

// SHOW MESSAGE

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

function hideMessage() {
  message.hidden = true;
}

// SEARCH MOVIES

async function searchMovies(page = 1) {
  const search = currentSearch.trim();

  if (!search) {
    showMessage("Please enter a movie name.");
    return;
  }

  if (API_KEY === "YOUR_OMDB_API_KEY") {
    showMessage(
      "Please add your OMDb API key inside script.js."
    );
    return;
  }

  const thisRequest = ++requestId;

  currentPage = page;

  movieGrid.innerHTML = "";
  pagination.hidden = true;

  showMessage("Searching movies...");

  const params = new URLSearchParams({
    apikey: API_KEY,
    s: search,
    page: String(page)
  });

  if (typeFilter.value) {
    params.set("type", typeFilter.value);
  }

  try {
    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data = await response.json();

    // Ignore outdated search results
    if (thisRequest !== requestId) return;

    if (data.Response === "False") {
      showMessage(data.Error || "No movies found.");
      sectionTitle.textContent = "Search Results";
      return;
    }

    hideMessage();

    sectionTitle.textContent =
      `Results for "${currentSearch}"`;

    displayMovies(data.Search);

    const totalResults = Number(data.totalResults);

    totalPages = Math.ceil(totalResults / 10);

    updatePagination();

  } catch (error) {
    if (thisRequest !== requestId) return;

    showMessage(
      "Unable to load movies. Check your internet connection."
    );

    console.error(error);
  }
}

// DISPLAY MOVIES

function displayMovies(movies) {
  movieGrid.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("article");

    card.className = "movie-card";

    const poster = getPoster(movie.Poster);

    const image = document.createElement("img");

    image.alt = `${movie.Title} poster`;

    if (poster) {
      image.src = poster;
    } else {
      image.alt = "Movie poster not available";
    }

    image.onerror = () => {
      image.removeAttribute("src");
      image.alt = "Movie poster not available";
    };

    const info = document.createElement("div");

    info.className = "movie-info";

    info.innerHTML = `
      <h3>${escapeHTML(movie.Title)}</h3>
      <p>${escapeHTML(movie.Year)} •
      ${escapeHTML(movie.Type)}</p>
    `;

    const button = document.createElement("button");

    button.className = "details-btn";
    button.textContent = "View Details";

    button.addEventListener("click", () => {
      getMovieDetails(movie.imdbID);
    });

    info.appendChild(button);

    card.appendChild(image);
    card.appendChild(info);

    movieGrid.appendChild(card);
  });
}

// FETCH MOVIE DETAILS

async function getMovieDetails(imdbID) {
  movieDetails.textContent = "Loading movie details...";

  movieModal.hidden = false;
  document.body.style.overflow = "hidden";

  try {
    const params = new URLSearchParams({
      apikey: API_KEY,
      i: imdbID,
      plot: "full"
    });

    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Network error");
    }

    const movie = await response.json();

    if (movie.Response === "False") {
      throw new Error(movie.Error);
    }

    displayMovieDetails(movie);

  } catch (error) {
    movieDetails.textContent =
      "Unable to load movie details.";

    console.error(error);
  }
}

// DISPLAY MOVIE DETAILS

function displayMovieDetails(movie) {
  const poster = getPoster(movie.Poster);

  const imageHTML = poster
    ? `<img src="${escapeHTML(poster)}"
         alt="${escapeHTML(movie.Title)} poster">`
    : "";

  movieDetails.innerHTML = `
    <div class="details-layout">

      ${imageHTML}

      <div class="details-text">

        <h2>${escapeHTML(movie.Title)}</h2>

        <p>
          <strong>Year:</strong>
          ${escapeHTML(movie.Year)}
        </p>

        <p>
          <strong>Genre:</strong>
          ${escapeHTML(movie.Genre)}
        </p>

        <p>
          <strong>Runtime:</strong>
          ${escapeHTML(movie.Runtime)}
        </p>

        <p class="rating">
          ⭐ IMDb: ${escapeHTML(movie.imdbRating)}
        </p>

        <p>
          <strong>Director:</strong>
          ${escapeHTML(movie.Director)}
        </p>

        <p>
          <strong>Cast:</strong>
          ${escapeHTML(movie.Actors)}
        </p>

        <p>
          <strong>Plot:</strong>
          ${escapeHTML(movie.Plot)}
        </p>

      </div>
    </div>
  `;
}

// PAGINATION

function updatePagination() {
  pagination.hidden = totalPages <= 1;

  pageInfo.textContent =
    `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;

  nextBtn.disabled = currentPage >= totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    searchMovies(currentPage - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    searchMovies(currentPage + 1);
  }
});

// SEARCH FORM

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  currentSearch = searchInput.value.trim();

  searchMovies(1);
});

// FILTER BY TYPE

typeFilter.addEventListener("change", () => {
  if (currentSearch) {
    searchMovies(1);
  }
});

// CLOSE MODAL

function hideModal() {
  movieModal.hidden = true;
  document.body.style.overflow = "";
}

closeModal.addEventListener("click", hideModal);

movieModal.addEventListener("click", event => {
  if (event.target === movieModal) {
    hideModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideModal();
  }
});