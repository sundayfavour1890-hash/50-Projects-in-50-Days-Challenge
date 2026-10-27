const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");
const statusBox = document.getElementById("status");

const wordTitle = document.getElementById("wordTitle");
const phonetic = document.getElementById("phonetic");
const definitions = document.getElementById("definitions");
const audioBtn = document.getElementById("audioBtn");
const favoriteBtn = document.getElementById("favoriteBtn");

const favoritesList = document.getElementById("favoritesList");
const historyList = document.getElementById("historyList");

function loadSaved(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data)
      ? data.filter(item => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

let favorites = loadSaved("wordwiseFavorites");
let history = loadSaved("wordwiseHistory");

let currentWord = "";
let currentAudio = "";
let activeAudio = null;

function setStatus(message) {
  statusBox.textContent = message;
}

function saveData() {
  try {
    localStorage.setItem(
      "wordwiseFavorites",
      JSON.stringify(favorites)
    );
    localStorage.setItem(
      "wordwiseHistory",
      JSON.stringify(history)
    );
  } catch {
    setStatus("Your browser could not save local data.");
  }
}

async function searchWord(word) {
  const query = word.trim();

  if (!query) {
    setStatus("Please enter a word.");
    return;
  }

  wordInput.value = query;
  result.classList.add("hidden");
  searchBtn.disabled = true;
  setStatus("Searching for your word...");

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  try {
    const response = await fetch(
      API_URL + encodeURIComponent(query)
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Word not found. Check the spelling and try again."
        );
      }

      throw new Error(
        "Unable to retrieve this word right now."
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || !data.length) {
      throw new Error("No definitions were returned.");
    }

    displayWord(data[0]);
    addToHistory(data[0].word || query);
    setStatus("");

  } catch (error) {
    setStatus(
      error instanceof TypeError
        ? "Network error. Check your internet connection."
        : error.message
    );
  } finally {
    searchBtn.disabled = false;
  }
}

function displayWord(entry) {
  currentWord = entry.word || "";
  wordTitle.textContent = currentWord;

  const phoneticData = (entry.phonetics || []).find(
    item => item.text
  );

  phonetic.textContent =
    entry.phonetic || phoneticData?.text || "";

  const audioData = (entry.phonetics || []).find(
    item => item.audio &&
      item.audio.startsWith("https://")
  );

  currentAudio = audioData?.audio || "";
  audioBtn.disabled = !currentAudio;

  definitions.replaceChildren();

  (entry.meanings || []).forEach(meaning => {
    const group = document.createElement("div");
    group.className = "meaning-group";

    const heading = document.createElement("h3");
    heading.className = "part-of-speech";
    heading.textContent = meaning.partOfSpeech || "Meaning";
    group.appendChild(heading);

    (meaning.definitions || []).slice(0, 5).forEach(
      (item, index) => {
        const definitionItem = document.createElement("div");
        definitionItem.className = "definition-item";

        const description = document.createElement("p");
        description.textContent =
          `${index + 1}. ${item.definition}`;
        definitionItem.appendChild(description);

        if (item.example) {
          const example = document.createElement("p");
          example.className = "example";
          example.textContent = `Example: "${item.example}"`;
          definitionItem.appendChild(example);
        }

        group.appendChild(definitionItem);
      }
    );

    if (meaning.synonyms?.length) {
      const synonymsBox = document.createElement("div");
      synonymsBox.className = "synonyms";

      const title = document.createElement("strong");
      title.textContent = "Synonyms:";
      synonymsBox.appendChild(title);

      meaning.synonyms.slice(0, 8).forEach(word => {
        const button = document.createElement("button");
        button.className = "synonym-tag";
        button.textContent = word;

        button.addEventListener("click", () => {
          searchWord(word);
        });

        synonymsBox.appendChild(button);
      });

      group.appendChild(synonymsBox);
    }

    definitions.appendChild(group);
  });

  if (!definitions.children.length) {
    const message = document.createElement("p");
    message.textContent = "No definitions available.";
    definitions.appendChild(message);
  }

  updateFavoriteButton();
  result.classList.remove("hidden");
}

function updateFavoriteButton() {
  const isFavorite = favorites.includes(
    currentWord.toLowerCase()
  );

  favoriteBtn.textContent = isFavorite ? "♥" : "♡";
  favoriteBtn.title = isFavorite
    ? "Remove from favorites"
    : "Add to favorites";
  favoriteBtn.setAttribute(
    "aria-label",
    favoriteBtn.title
  );
}

function toggleFavorite() {
  if (!currentWord) return;

  const word = currentWord.toLowerCase();

  if (favorites.includes(word)) {
    favorites = favorites.filter(item => item !== word);
  } else {
    favorites.unshift(word);
  }

  saveData();
  updateFavoriteButton();
  renderLists();
}

function addToHistory(word) {
  const normalized = word.toLowerCase();

  history = history.filter(item => item !== normalized);
  history.unshift(normalized);
  history = history.slice(0, 10);

  saveData();
  renderLists();
}

function renderWordList(element, words, emptyText) {
  element.replaceChildren();

  if (!words.length) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = emptyText;
    element.appendChild(message);
    return;
  }

  words.forEach(word => {
    const button = document.createElement("button");
    button.className = "word-chip";
    button.textContent = word;

    button.addEventListener("click", () => {
      searchWord(word);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    element.appendChild(button);
  });
}

function renderLists() {
  renderWordList(
    favoritesList,
    favorites,
    "No favorite words saved yet."
  );

  renderWordList(
    historyList,
    history,
    "Your recent searches will appear here."
  );
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  searchWord(wordInput.value);
});

audioBtn.addEventListener("click", async () => {
  if (!currentAudio) return;

  if (activeAudio) activeAudio.pause();

  activeAudio = new Audio(currentAudio);

  try {
    await activeAudio.play();
  } catch {
    setStatus("Unable to play this pronunciation.");
  }
});

favoriteBtn.addEventListener("click", toggleFavorite);

document.querySelectorAll(".suggest-word").forEach(
  button => {
    button.addEventListener("click", () => {
      searchWord(button.dataset.word);
    });
  }
);

document.getElementById("clearFavorites")
  .addEventListener("click", () => {
    favorites = [];
    saveData();
    updateFavoriteButton();
    renderLists();
  });

document.getElementById("clearHistory")
  .addEventListener("click", () => {
    history = [];
    saveData();
    renderLists();
  });

renderLists();