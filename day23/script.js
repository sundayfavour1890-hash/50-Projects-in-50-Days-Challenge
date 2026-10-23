const newsContainer = document.getElementById("newsContainer");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const newsTitle = document.getElementById("newsTitle");
const newsCount = document.getElementById("newsCount");
const statusMessage = document.getElementById("statusMessage");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const themeBtn = document.getElementById("themeBtn");
const categoryButtons = document.querySelectorAll(".category");

// PUBLIC DEMO API
const API_URL = "https://content.guardianapis.com/search";
const API_KEY = "test";

let currentCategory = "all";
let currentSearch = "";
let currentPage = 1;
let totalPages = 1;
let requestController = null;

// FETCH NEWS
async function fetchNews(reset = true) {
  if (reset) {
    currentPage = 1;
    newsContainer.innerHTML = "";
  }

  // Cancel the previous request
  if (requestController) {
    requestController.abort();
  }

  requestController = new AbortController();

  statusMessage.textContent = "Loading latest news...";
  loadMoreBtn.hidden = true;

  const params = new URLSearchParams({
    "api-key": API_KEY,
    "page": currentPage,
    "page-size": 9,
    "order-by": "newest",
    "show-fields": "thumbnail,trailText"
  });

  if (currentSearch) {
    params.set("q", currentSearch);
  }

  if (currentCategory !== "all") {
    params.set("section", currentCategory);
  }

  try {
    const response = await fetch(
      `${API_URL}?${params.toString()}`,
      { signal: requestController.signal }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch news.");
    }

    const data = await response.json();

    const articles = data.response.results || [];
    totalPages = data.response.pages || 1;

    if (reset && articles.length === 0) {
      statusMessage.textContent = "No news articles found.";
      newsCount.textContent = "0 articles";
      return;
    }

    displayNews(articles);

    newsCount.textContent =
      `${data.response.total} articles found`;

    statusMessage.textContent = "";

    loadMoreBtn.hidden = currentPage >= totalPages;

  } catch (error) {
    if (error.name === "AbortError") return;

    console.error(error);
    statusMessage.textContent =
      "Could not load news. Please check your connection and try again.";

    loadMoreBtn.hidden = false;
    loadMoreBtn.textContent = "Try Again";
  }
}

// REMOVE HTML FROM API DESCRIPTIONS
function stripHTML(html) {
  const element = document.createElement("div");
  element.textContent = "";

  // Parse markup without adding it to the page
  const parsed = new DOMParser().parseFromString(
    html || "",
    "text/html"
  );

  return parsed.body.textContent || "";
}

// DISPLAY NEWS
function displayNews(articles) {
  articles.forEach(article => {
    const card = document.createElement("article");
    card.className = "news-card";

    const image = document.createElement("img");
    image.src = article.fields?.thumbnail ||
      "https://placehold.co/600x400?text=NewsHub";
    image.alt = article.webTitle || "News image";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";

    image.onerror = function () {
      this.onerror = null;
      this.src = "https://placehold.co/600x400?text=NewsHub";
    };

    const content = document.createElement("div");
    content.className = "news-content";

    const category = document.createElement("span");
    category.className = "news-category";
    category.textContent = article.sectionName || "News";

    const title = document.createElement("h3");
    title.textContent = article.webTitle || "Untitled News";

    const description = document.createElement("p");
    const summary = stripHTML(article.fields?.trailText);

    description.textContent = summary
      ? summary.slice(0, 160) + (summary.length > 160 ? "..." : "")
      : "Click below to read the full news article.";

    const date = document.createElement("span");
    date.className = "news-date";

    date.textContent = new Date(
      article.webPublicationDate
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const link = document.createElement("a");
    link.className = "read-more";
    link.href = article.webUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Read More →";

    content.append(
      category,
      title,
      description,
      date,
      link
    );

    card.append(image, content);
    newsContainer.appendChild(card);
  });
}

// SEARCH NEWS
searchForm.addEventListener("submit", function(event) {
  event.preventDefault();

  currentSearch = searchInput.value.trim();

  if (!currentSearch) return;

  currentCategory = "all";

  categoryButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "all"
    );
  });

  newsTitle.textContent = `Search: ${currentSearch}`;
  fetchNews();
});

// CATEGORY FILTERS
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    currentCategory = button.dataset.category;
    currentSearch = "";
    searchInput.value = "";

    newsTitle.textContent =
      currentCategory === "all"
        ? "Latest Headlines"
        : `${button.textContent.trim()} News`;

    fetchNews();
  });
});

// LOAD MORE
loadMoreBtn.addEventListener("click", () => {
  if (loadMoreBtn.textContent === "Try Again") {
    loadMoreBtn.textContent = "Load More News";
    fetchNews(false);
    return;
  }

  if (currentPage < totalPages) {
    currentPage++;
    fetchNews(false);
  }
});

// DARK MODE
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const darkMode = document.body.classList.contains("dark");

  themeBtn.textContent = darkMode ? "☀️" : "🌙";

  localStorage.setItem("darkMode", darkMode);
});

// RESTORE THEME
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

// INITIAL NEWS
fetchNews();