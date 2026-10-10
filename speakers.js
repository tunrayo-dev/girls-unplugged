/* ==========================================
   GIRLS UNPLUGGED
   GUEST SPEAKERS PAGE
   Loads session details and full biographies
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const sessionList = document.getElementById("speaker-session-list");

  if (!sessionList) return;

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  const safeImageSource = value => {
    const source = String(value || "").trim();

    // Only allow local image paths or secure HTTPS image URLs.
    if (
      source.startsWith("images/speakers/") ||
      source.startsWith("https://")
    ) {
      return source;
    }

    return "";
  };

  const normaliseBio = bio => {
    if (Array.isArray(bio)) return bio.filter(Boolean);
    if (typeof bio === "string" && bio.trim()) return [bio.trim()];
    return ["More information about this guest speaker will be added soon."];
  };

  function createSpeakerCard(speaker) {
    const card = document.createElement("article");
    card.className = "speaker-profile";

    const name = escapeHTML(speaker.name || "Guest Speaker");
    const role = escapeHTML(speaker.role || "Guest speaker");
    const image = safeImageSource(speaker.image);
    const paragraphs = normaliseBio(speaker.bio);

    const photo = document.createElement("div");
    photo.className = "speaker-profile-photo";

    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = `Portrait of ${speaker.name || "guest speaker"}`;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("error", () => {
        photo.replaceChildren();
        photo.classList.add("is-placeholder");
        photo.innerHTML = `
          <span class="speaker-photo-flower" aria-hidden="true">✿</span>
          <span>Add speaker photo</span>
        `;
      }, { once: true });

      photo.appendChild(img);
    } else {
      photo.classList.add("is-placeholder");
      photo.innerHTML = `
        <span class="speaker-photo-flower" aria-hidden="true">✿</span>
        <span>Add speaker photo</span>
      `;
    }

    const content = document.createElement("div");
    content.className = "speaker-profile-content";

    content.innerHTML = `
      <span class="speaker-session-tag">Guest speaker</span>
      <h4>${name}</h4>
      <p class="speaker-profile-role">${role}</p>
      <div class="speaker-bio">
        ${paragraphs.map(paragraph =>
          `<p>${escapeHTML(paragraph)}</p>`
        ).join("")}
      </div>
    `;

    card.append(photo, content);
    return card;
  }

  function createSessionCard(session) {
    const article = document.createElement("article");
    article.className = "speaker-session";
    article.id = `session-${String(session.id || "guest-session")
      .replace(/[^a-z0-9-]/gi, "-")}`;

    const heading = document.createElement("div");
    heading.className = "speaker-session-heading";

    heading.innerHTML = `
      <div class="speaker-session-meta">
        <span class="speaker-session-date">
          <span aria-hidden="true">✿</span>
          ${escapeHTML(session.date || "Date to be confirmed")}
        </span>
        <span class="speaker-session-type">Girls Unplugged Guest Conversation</span>
      </div>
      <h3>${escapeHTML(session.title || "Guest Conversation")}</h3>
      ${session.description
        ? `<p class="speaker-session-description">${escapeHTML(session.description)}</p>`
        : ""}
    `;

    const people = document.createElement("div");
    people.className = "speaker-session-people";

    if (Array.isArray(session.speakers) && session.speakers.length) {
      session.speakers.forEach(speaker => {
        people.appendChild(createSpeakerCard(speaker));
      });
    } else {
      people.innerHTML = `
        <p class="speaker-message">
          Speaker details for this session will be added soon.
        </p>
      `;
    }

    article.append(heading, people);
    return article;
  }

  function renderSessions(sessions) {
    sessionList.replaceChildren();

    if (!Array.isArray(sessions) || sessions.length === 0) {
      sessionList.innerHTML = `
        <p class="speaker-message">
          Our guest conversation archive is being updated.
        </p>
      `;
      return;
    }

    sessions.forEach(session => {
      sessionList.appendChild(createSessionCard(session));
    });
  }

  fetch("speakers.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("The speaker data could not be loaded.");
      }

      return response.json();
    })
    .then(data => renderSessions(data.sessions))
    .catch(error => {
      console.error("Girls Unplugged speaker archive:", error);

      sessionList.innerHTML = `
        <p class="speaker-message">
          We couldn't load the speaker archive. Please refresh the page
          or check that speakers.json is saved in the website's root folder.
        </p>
      `;
    });
});
