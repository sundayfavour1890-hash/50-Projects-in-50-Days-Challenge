const API = "https://www.themealdb.com/api/json/v1/1";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const recipeContainer = document.getElementById("recipeContainer");
const categoryFilter = document.getElementById("categoryFilter");
const randomBtn = document.getElementById("randomBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const favoriteCount = document.getElementById("favoriteCount");
const sectionTitle = document.getElementById("sectionTitle");
const message = document.getElementById("message");

const recipeModal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

let recipes = [];
let showingFavorites = false;
let requestId = 0;

let favorites = JSON.parse(
  localStorage.getItem("recipeFavorites") || "[]"
);

document.getElementById("year").textContent =
  new Date().getFullYear();

// Fetch data from API
async function fetchData(endpoint) {
  const response = await fetch(`${API}/${endpoint}`);

  if (!response.ok) {
    throw new Error("Unable to load recipes.");
  }

  return response.json();
}

// Escape text before inserting into HTML
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

// Show status
function setMessage(text) {
  message.textContent = text;
}

// Display recipes
function displayRecipes(meals) {
  recipeContainer.innerHTML = "";

  if (!meals || meals.length === 0) {
    recipeContainer.innerHTML = `
      <div class="empty-state">
        <h3>No recipes found 🍽️</h3>
        <p>Try another search or category.</p>
      </div>
    `;
    return;
  }

  meals.forEach(meal => {
    const isFavorite = favorites.some(
      item => item.idMeal === meal.idMeal
    );

    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <div class="recipe-image">
        <img
          src="${escapeHTML(meal.strMealThumb)}"
          alt="${escapeHTML(meal.strMeal)}"
          loading="lazy"
        >

        <button
          class="favorite-btn"
          data-id="${escapeHTML(meal.idMeal)}"
          aria-label="Toggle favorite"
        >
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div class="recipe-info">
        <span class="recipe-category">
          ${escapeHTML(meal.strCategory || "Recipe")}
        </span>

        <h3>${escapeHTML(meal.strMeal)}</h3>

        <p>🌍 ${escapeHTML(meal.strArea || "International")}</p>

        <button
          class="view-btn"
          data-id="${escapeHTML(meal.idMeal)}"
        >
          View Recipe →
        </button>
      </div>
    `;

    recipeContainer.appendChild(card);
  });
}

// Shared loading helper
async function loadRecipes(endpoint, title) {
  const currentRequest = ++requestId;
  showingFavorites = false;
  sectionTitle.textContent = title;
  recipeContainer.innerHTML = "";
  setMessage("Loading delicious recipes...");

  try {
    const data = await fetchData(endpoint);

    // Ignore older responses arriving after newer searches
    if (currentRequest !== requestId) return;

    recipes = data.meals || [];
    displayRecipes(recipes);
    setMessage("");

  } catch (error) {
    if (currentRequest !== requestId) return;
    displayRecipes([]);
    setMessage("Couldn't load recipes. Check your internet connection.");
    console.error(error);
  }
}

// Search by recipe name
async function searchRecipes(query) {
  const search = query.trim();

  if (!search) return;

  categoryFilter.value = "all";

  await loadRecipes(
    `search.php?s=${encodeURIComponent(search)}`,
    `Results for "${search}"`
  );
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchRecipes(searchInput.value);
});

// Popular search buttons
document.querySelectorAll("[data-search]").forEach(button => {
  button.addEventListener("click", () => {
    const query = button.dataset.search;
    searchInput.value = query;
    searchRecipes(query);
  });
});

// Load categories
async function loadCategories() {
  try {
    const data = await fetchData("list.php?c=list");

    (data.meals || []).forEach(category => {
      const option = document.createElement("option");
      option.value = category.strCategory;
      option.textContent = category.strCategory;
      categoryFilter.appendChild(option);
    });

  } catch (error) {
    console.error("Categories unavailable:", error);
  }
}

// Filter by category
categoryFilter.addEventListener("change", async () => {
  const category = categoryFilter.value;

  if (category === "all") {
    loadRecipes("search.php?s=", "Discover Recipes");
    return;
  }

  const currentRequest = ++requestId;
  showingFavorites = false;
  sectionTitle.textContent = `${category} Recipes`;
  recipeContainer.innerHTML = "";
  setMessage("Loading recipes...");

  try {
    const data = await fetchData(
      `filter.php?c=${encodeURIComponent(category)}`
    );

    if (currentRequest !== requestId) return;

    // Category filter returns only summary details,
    // so card metadata may be limited.
    recipes = data.meals || [];
    displayRecipes(recipes);
    setMessage("");

  } catch (error) {
    if (currentRequest !== requestId) return;
    displayRecipes([]);
    setMessage("Unable to load this category.");
  }
});

// Fetch full recipe details by ID
async function getRecipeById(id) {
  const data = await fetchData(
    `lookup.php?i=${encodeURIComponent(id)}`
  );

  return data.meals ? data.meals[0] : null;
}

// Open recipe details
async function openRecipe(id) {
  recipeModal.classList.add("active");
  recipeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  modalBody.innerHTML = "<p>Loading recipe details...</p>";

  try {
    const meal = await getRecipeById(id);

    if (!meal) {
      modalBody.textContent = "Recipe not found.";
      return;
    }

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push(
          `<li>${escapeHTML(measure || "")} 
           ${escapeHTML(ingredient)}</li>`
        );
      }
    }

    let videoLink = "";

    if (meal.strYoutube) {
      try {
        const url = new URL(meal.strYoutube);
        if (["youtube.com", "www.youtube.com", "youtu.be"]
            .includes(url.hostname) && url.protocol === "https:") {
          videoLink = `
            <a class="video-link" href="${escapeHTML(url.href)}"
               target="_blank" rel="noopener noreferrer">
              ▶ Watch Cooking Video
            </a>
          `;
        }
      } catch (error) {
        console.warn("Invalid video URL");
      }
    }

    modalBody.innerHTML = `
      <img class="modal-img"
           src="${escapeHTML(meal.strMealThumb)}"
           alt="${escapeHTML(meal.strMeal)}">

      <h2>${escapeHTML(meal.strMeal)}</h2>
      <p>
        🍽️ ${escapeHTML(meal.strCategory)}
        | 🌍 ${escapeHTML(meal.strArea)}
      </p>

      <h3>Ingredients</h3>
      <ul class="ingredients">
        ${ingredients.join("")}
      </ul>

      <h3>Cooking Instructions</h3>
      <p class="instructions">
        ${escapeHTML(meal.strInstructions || "No instructions available.")}
      </p>

      ${videoLink}
    `;

  } catch (error) {
    modalBody.textContent =
      "Unable to load recipe details. Please try again.";
  }
}

// Favorites
function updateFavoriteCount() {
  favoriteCount.textContent = favorites.length;
}

function saveFavorites() {
  localStorage.setItem(
    "recipeFavorites",
    JSON.stringify(favorites)
  );
  updateFavoriteCount();
}

async function toggleFavorite(id) {
  const index = favorites.findIndex(
    meal => meal.idMeal === id
  );

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    try {
      const meal = await getRecipeById(id);

      if (!meal) return;

      if (!favorites.some(item => item.idMeal === id)) {
        favorites.push(meal);
      }

    } catch (error) {
      setMessage("Unable to save recipe. Try again.");
      return;
    }
  }

  saveFavorites();

  if (showingFavorites) {
    displayRecipes(favorites);
  } else {
    displayRecipes(recipes);
  }
}

// Event delegation for dynamic cards
recipeContainer.addEventListener("click", event => {
  const favoriteButton = event.target.closest(".favorite-btn");
  const viewButton = event.target.closest(".view-btn");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.id);
  }

  if (viewButton) {
    openRecipe(viewButton.dataset.id);
  }
});

// Show favorite recipes
favoritesBtn.addEventListener("click", () => {
  ++requestId;
  showingFavorites = true;
  sectionTitle.textContent = "My Favorite Recipes";
  recipes = favorites;
  setMessage("");
  displayRecipes(favorites);

  document.getElementById("recipes").scrollIntoView({
    behavior: "smooth"
  });
});

// Random recipe
randomBtn.addEventListener("click", async () => {
  const currentRequest = ++requestId;

  showingFavorites = false;
  sectionTitle.textContent = "Random Recipe";
  recipeContainer.innerHTML = "";
  setMessage("Finding a delicious surprise...");

  try {
    const data = await fetchData("random.php");

    if (currentRequest !== requestId) return;

    recipes = data.meals || [];
    displayRecipes(recipes);
    setMessage("");

  } catch (error) {
    if (currentRequest !== requestId) return;
    setMessage("Unable to find a random recipe.");
  }
});

// Close recipe modal
function hideModal() {
  recipeModal.classList.remove("active");
  recipeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

closeModal.addEventListener("click", hideModal);

recipeModal.addEventListener("click", event => {
  if (event.target === recipeModal) hideModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") hideModal();
});

// Initialize application
async function init() {
  updateFavoriteCount();
  loadCategories();
  loadRecipes("search.php?s=", "Discover Recipes");
}

init();