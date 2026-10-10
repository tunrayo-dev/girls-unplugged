document.addEventListener("DOMContentLoaded", () => {
  const sessionsContainer = document.getElementById("speaker-sessions");
  const statusMessage = document.getElementById("speakers-status");

  if (!sessionsContainer) return;

  loadSpeakerSessions();

  async function loadSpeakerSessions() {
    try {
      const response = await fetch("speakers.json");

      if (!response.ok) {
        throw new Error(`Could not load speakers.json (${response.status})`);
      }

      const data = await response.json();
      const sessions = Array.isArray(data)
        ? data
        : data.sessions || [];

      sessionsContainer.innerHTML = "";

      if (sessions.length === 0) {
        showStatus("Our guest speaker sessions will appear here soon.");
        return;
      }

      sessions.forEach((session) => {
        sessionsContainer.appendChild(createSessionCard(session));
      });

      if (statusMessage) {
        statusMessage.hidden = true;
      }
    } catch (error) {
      console.error("Error loading guest speaker sessions:", error);
      showStatus(
        "We couldn't load the guest speaker sessions right now. Please try again later."
      );
    }
  }

  function createSessionCard(session) {
    const article = document.createElement("article");
    article.className = "speaker-session";

    const date = escapeHTML(session.date || "");
    const title = escapeHTML(session.title || "Guest Speaker Session");
    const topic = escapeHTML(session.topic || session.title || "");
    const description = escapeHTML(
      session.description || session.summary || ""
    );

    const speakers = Array.isArray(session.speakers)
      ? session.speakers
      : Array.isArray(session.guests)
        ? session.guests
        : [];

    article.innerHTML = `
      <div class="speaker-session-header">
        <div class="speaker-session-date">${date}</div>
        <div class="speaker-session-heading">
          <span class="speaker-session-tag">Guest Speaker Session</span>
          <h3>${title}</h3>
          ${topic && topic !== title ? `<p class="speaker-session-topic">${topic}</p>` : ""}
          ${description ? `<p class="speaker-session-description">${description}</p>` : ""}
        </div>
      </div>
      <div class="speaker-session-people"></div>
    `;

    const peopleContainer = article.querySelector(".speaker-session-people");

    if (speakers.length > 0) {
      speakers.forEach((speaker) => {
        peopleContainer.appendChild(createSpeakerCard(speaker));
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "speaker-session-empty";
      emptyMessage.textContent = "Speaker details coming soon.";
      peopleContainer.appendChild(emptyMessage);
    }

    return article;
  }

  function createSpeakerCard(speaker) {
    const card = document.createElement("article");
    card.className = "speaker-profile";

    const name = escapeHTML(speaker.name || "Guest Speaker");
    const role = escapeHTML(speaker.role || speaker.title || "Guest speaker");
    const image = safeImageSource(speaker.image);
    const paragraphs = normaliseBio(speaker.bio || speaker.biography);

    // Create a portrait area. It remains blank if there is no usable photo.
    const photo = document.createElement("div");
    photo.className = "speaker-profile-photo";

    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = `Portrait of ${speaker.name || "guest speaker"}`;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener(
        "error",
        () => {
          img.remove();
          photo.classList.add("is-placeholder");
        },
        { once: true }
      );

      photo.appendChild(img);
    } else {
      photo.classList.add("is-placeholder");
    }

    const content = document.createElement("div");
    content.className = "speaker-profile-content";

    content.innerHTML = `
      <span class="speaker-session-tag">Guest Speaker</span>
      <h4>${name}</h4>
      <p class="speaker-profile-role">${role}</p>
      <div class="speaker-bio">
        ${
          paragraphs.length
            ? paragraphs
                .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
                .join("")
            : "<p>Speaker biography coming soon.</p>"
        }
      </div>
    `;

    card.append(photo, content);
    return card;
  }

  function normaliseBio(bio) {
    if (!bio) return [];

    if (Array.isArray(bio)) {
      return bio
        .map((paragraph) => String(paragraph).trim())
        .filter(Boolean);
    }

    return String(bio)
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  function safeImageSource(source) {
    if (typeof source !== "string") return "";

    const value = source.trim();

    if (!value) return "";

    // Allow local image paths and secure HTTPS image URLs only.
    if (
      value.startsWith("https://") ||
      (!value.startsWith("//") &&
        !value.startsWith("data:") &&
        !value.startsWith("javascript:"))
    ) {
      return value;
    }

    return "";
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showStatus(message) {
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.hidden = false;
    } else {
      sessionsContainer.innerHTML = `
        <p class="speaker-load-message">${escapeHTML(message)}</p>
      `;
    }
  }
});
