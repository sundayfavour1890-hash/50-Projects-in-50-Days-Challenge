const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("username");
const searchBtn = document.getElementById("searchBtn");
const profile = document.getElementById("profile");
const message = document.getElementById("message");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();

  if (!username) {
    showMessage("Please enter a GitHub username.");
    return;
  }

  await findProfile(username);
});

function showMessage(text) {
  message.textContent = text;
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

async function findProfile(username) {
  profile.hidden = true;
  showMessage("Searching GitHub...");
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    if (response.status === 404) {
      throw new Error("GitHub user not found.");
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error(
        "GitHub API limit reached. Please try again later."
      );
    }

    if (!response.ok) {
      throw new Error("Unable to load this profile.");
    }

    const user = await response.json();

    displayProfile(user);
    showMessage("");

    await loadRepositories(user.login);

  } catch (error) {
    profile.hidden = true;
    showMessage(error.message || "Something went wrong.");
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}

function displayProfile(user) {
  const avatar = document.getElementById("avatar");
  avatar.src = user.avatar_url;
  avatar.alt = `${user.login}'s profile picture`;

  setText("name", user.name || user.login);
  setText("login", `@${user.login}`);
  setText("bio", user.bio || "No bio available.");

  setText("repos", user.public_repos);
  setText("followers", user.followers);
  setText("following", user.following);

  const joinedDate = new Date(user.created_at)
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  setText("joined", `Joined ${joinedDate}`);

  setText(
    "location",
    `📍 Location: ${user.location || "Not available"}`
  );

  setText(
    "company",
    `🏢 Company: ${user.company || "Not available"}`
  );

  const website = document.getElementById("website");
  website.replaceChildren();

  if (user.blog) {
    const url = user.blog.startsWith("http")
      ? user.blog
      : `https://${user.blog}`;

    try {
      const parsed = new URL(url);

      if (["https:", "http:"].includes(parsed.protocol)) {
        const link = document.createElement("a");
        link.href = parsed.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = user.blog;

        website.append("🌐 Website: ", link);
      } else {
        website.textContent = "🌐 Website: Not available";
      }
    } catch {
      website.textContent = "🌐 Website: Not available";
    }
  } else {
    website.textContent = "🌐 Website: Not available";
  }

  document.getElementById("profileLink").href =
    user.html_url;

  document.getElementById("repoList").textContent =
    "Loading repositories...";

  profile.hidden = false;
}

async function loadRepositories(username) {
  const repoList = document.getElementById("repoList");

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`
    );

    if (!response.ok) {
      throw new Error("Repositories could not be loaded.");
    }

    const repositories = await response.json();
    repoList.replaceChildren();

    if (repositories.length === 0) {
      repoList.textContent = "No public repositories found.";
      return;
    }

    repositories.forEach((repo) => {
      const card = document.createElement("div");
      card.className = "repo-card";

      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = repo.name;

      const description = document.createElement("p");
      description.textContent =
        repo.description || "No description available.";

      const info = document.createElement("small");
      info.textContent =
        `⭐ ${repo.stargazers_count} stars | ` +
        `Language: ${repo.language || "Not specified"}`;

      card.append(link, description, info);
      repoList.appendChild(card);
    });

  } catch (error) {
    repoList.textContent = error.message;
  }
}