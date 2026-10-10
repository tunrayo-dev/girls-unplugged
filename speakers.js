
/* ==========================================
   GIRLS UNPLUGGED
   GUEST SPEAKERS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const sessionList = document.getElementById("speaker-session-list");

  if (!sessionList) return;

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });

  const safeImageSource = (value = "") => {
    const source = String(value).trim();

    if (
      source.startsWith("https://") ||
      source.startsWith("images/")
    ) {
      return source;
    }

    return "";
  };

  const createSpeakerCard = (speaker) => {
    const name = escapeHTML(speaker.name);
    const bio = escapeHTML(speaker.bio);
    const image = safeImageSource(speaker.image);
    const safeImage = image ? escapeHTML(image) : "";

    const card = document.createElement("article");
    card.className = `speaker-profile${image ? "" : " has-no-photo"}`;

    const photoMarkup = image
      ? `
        <div class="speaker-profile-photo">
          <img
            src="${safeImage}"
            alt="Portrait of ${name}"
            loading="lazy"
            decoding="async"
          >
        </div>
      `
      : "";

    card.innerHTML = `
      ${photoMarkup}
      <div class="speaker-profile-content">
        <span class="speaker-session-tag">Guest speaker</span>
        <h4>${name}</h4>
        <p>${bio}</p>
      </div>
    `;

    const photo = card.querySelector(".speaker-profile-photo img");

    if (photo) {
      photo.addEventListener("error", () => {
        photo.closest(".speaker-profile-photo")?.remove();
        card.classList.add("has-no-photo");
      }, { once: true });
    }

    return card;
  };

  const createSessionCard = (session) => {
    const article = document.createElement("article");
    article.className = "speaker-session";
    article.id = `session-${session.id}`;

    const heading = document.createElement("div");
    heading.className = "speaker-session-heading";

    heading.innerHTML = `
      <span class="speaker-session-date">
        <span aria-hidden="true">✿</span>
        ${escapeHTML(session.date)}
      </span>
      <h3>${escapeHTML(session.title)}</h3>
    `;

    const people = document.createElement("div");
    people.className = "speaker-session-people";

    (Array.isArray(session.speakers) ? session.speakers : [])
      .forEach((speaker) => {
        people.appendChild(createSpeakerCard(speaker));
      });

    article.append(heading, people);

    return article;
  };

  const renderSessions = (sessions) => {
    sessionList.replaceChildren();

    if (!Array.isArray(sessions) || sessions.length === 0) {
      const message = document.createElement("p");
      message.className = "speaker-message";
      message.textContent = "Our guest conversation archive is being updated.";
      sessionList.appendChild(message);
      return;
    }

    sessions.forEach((session) => {
      sessionList.appendChild(createSessionCard(session));
    });
  };

  fetch("speakers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load the speaker data.");
      }

      return response.json();
    })
    .then((data) => {
      renderSessions(data.sessions);
    })
    .catch((error) => {
      console.error("Girls Unplugged speaker archive:", error);

      sessionList.replaceChildren();

      const message = document.createElement("p");
      message.className = "speaker-message";
      message.textContent =
        "We couldn't load the speaker archive right now. Please refresh the page and try again.";

      sessionList.appendChild(message);
    });
});
