document.addEventListener("DOMContentLoaded", () => {
  const sessionsContainer = document.getElementById("speaker-session-list");

  if (!sessionsContainer) {
    console.error("Speakers archive container was not found.");
    return;
  }

  loadSpeakerSessions();

  async function loadSpeakerSessions() {
    try {
      const response = await fetch("speakers.json");

      if (!response.ok) {
        throw new Error(`Could not load speakers.json: ${response.status}`);
      }

      const data = await response.json();
      const sessions = Array.isArray(data)
        ? data
        : Array.isArray(data.sessions)
          ? data.sessions
          : [];

      sessionsContainer.replaceChildren();

      if (!sessions.length) {
        showMessage("Our guest conversations will appear here soon.");
        return;
      }

      sessions.forEach((session) => {
        sessionsContainer.appendChild(createSessionCard(session));
      });
    } catch (error) {
      console.error("Unable to load the speaker archive:", error);
      showMessage(
        "We couldn't load the guest conversations right now. Please try again later."
      );
    }
  }

  function createSessionCard(session) {
    const article = document.createElement("article");
    article.className = "speaker-session";

    const heading = document.createElement("div");
    heading.className = "speaker-session-heading";

    const meta = document.createElement("div");
    meta.className = "speaker-session-meta";

    const date = document.createElement("span");
    date.className = "speaker-session-date";
    date.textContent = session.date || "";

    const type = document.createElement("span");
    type.className = "speaker-session-type";
    type.textContent = "Guest Speaker Session";

    meta.append(date, type);

    const title = document.createElement("h3");
    title.textContent = session.title || "Guest Speaker Session";

    heading.append(meta, title);

    const descriptions = normaliseParagraphs(
      session.description || session.descriptions || session.summary
    );

    descriptions.forEach((paragraph) => {
      const p = document.createElement("p");
      p.className = "speaker-session-description";
      p.textContent = paragraph;
      heading.appendChild(p);
    });

    const peopleContainer = document.createElement("div");
    peopleContainer.className = "speaker-session-people";

    const speakers = Array.isArray(session.speakers)
      ? session.speakers
      : Array.isArray(session.guests)
        ? session.guests
        : [];

    if (speakers.length) {
      speakers.forEach((speaker) => {
        peopleContainer.appendChild(createSpeakerCard(speaker));
      });
    } else {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "speaker-message";
      emptyMessage.textContent = "Speaker details coming soon.";
      peopleContainer.appendChild(emptyMessage);
    }

    article.append(heading, peopleContainer);
    return article;
  }

  function createSpeakerCard(speaker) {
    const card = document.createElement("article");
    card.className = "speaker-profile";

    const photo = document.createElement("div");
    photo.className = "speaker-profile-photo";

    const imageSource = safeImageSource(speaker.image);

    if (imageSource) {
      const img = document.createElement("img");
      img.src = imageSource;
      img.alt = `Portrait of ${speaker.name || "guest speaker"}`;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("error", () => {
        img.remove();
        photo.classList.add("is-placeholder");
      }, { once: true });

      photo.appendChild(img);
    } else {
      photo.classList.add("is-placeholder");
    }

    const content = document.createElement("div");
    content.className = "speaker-profile-content";

    const tag = document.createElement("span");
    tag.className = "speaker-session-tag";
    tag.textContent = "Guest Speaker";

    const name = document.createElement("h4");
    name.textContent = speaker.name || "Guest Speaker";

    const role = document.createElement("p");
    role.className = "speaker-profile-role";
    role.textContent = speaker.role || speaker.title || "Guest speaker";

    const bio = document.createElement("div");
    bio.className = "speaker-bio";

    const paragraphs = normaliseParagraphs(
      speaker.bio || speaker.biography
    );

    if (paragraphs.length) {
      paragraphs.forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        bio.appendChild(p);
      });
    } else {
      const p = document.createElement("p");
      p.textContent = "Speaker biography coming soon.";
      bio.appendChild(p);
    }

    content.append(tag, name, role, bio);
    card.append(photo, content);

    return card;
  }

  function normaliseParagraphs(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map((paragraph) => String(paragraph).trim())
        .filter(Boolean);
    }

    return String(value)
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  function safeImageSource(source) {
    if (typeof source !== "string") return "";

    const value = source.trim();

    if (!value || value.startsWith("//")) return "";

    if (/^https:\/\//i.test(value)) return value;

    // Local image paths are supported; unsafe URL schemes are not.
    if (/^(javascript|data|vbscript):/i.test(value)) return "";

    return value;
  }

  function showMessage(message) {
    sessionsContainer.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.className = "speaker-message";
    paragraph.textContent = message;

    sessionsContainer.appendChild(paragraph);
  }
});
