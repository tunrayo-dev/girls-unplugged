
/* =========================================================
   GIRLS UNPLUGGED — ADDITIONAL CMS EDITORS
   FAQs • Guest Sessions • Other Page Sections
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const esc = (value) =>
    typeof escapeHTML === "function"
      ? escapeHTML(value ?? "")
      : String(value ?? "");

  let faqRows = [];
  let sessionRows = [];
  let pageRows = [];

  const client = () => {
    if (typeof supabaseClient === "undefined") {
      throw new Error("Supabase is not available.");
    }
    return supabaseClient;
  };

  function showMessage(selector, text, isError = false) {
    const element = $(selector);
    if (!element) return;

    element.textContent = text;
    element.style.color = isError ? "#b42318" : "";
  }

 
  let currentPageSlug = "about";

  const GU_PAGES = [
    ["about", "About"],
    ["circle", "Bloom & Glow Circle"],
    ["get-involved", "Get Involved"],
    ["contact", "Contact"],
    ["faq", "FAQ Page"],
    ["privacy", "Privacy Policy"]
  ];

  function switchSection(name, pageSlug) {
    if (pageSlug) currentPageSlug = pageSlug;

    document.querySelectorAll(".dashboard-section").forEach((section) => {
      section.classList.toggle(
        "active-section",
        section.id === `section-${name}`
      );
    });

    document.querySelectorAll(".dashboard-nav-item").forEach((button) => {
      const isActivePage =
        name === "page-editor" &&
        button.dataset.pageSlug === currentPageSlug;

      button.classList.toggle(
        "active",
        name === "page-editor"
          ? isActivePage
          : button.dataset.section === name
      );
    });

    if (name === "page-editor") {
      const pageSelect = $("#gu-page-slug");
      if (pageSelect) pageSelect.value = currentPageSlug;

      const page = GU_PAGES.find((item) => item[0] === currentPageSlug);
      const heading = $("#gu-page-editor-heading");

      if (heading) {
        heading.textContent = `${page?.[1] || "Page"} Editor`;
      }

      loadPages();
    }

    const dashboard = $(".main-content");
    if (dashboard) dashboard.scrollTop = 0;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  function addDashboardSections() {
    const nav = $(".dashboard-nav");
    const main = $(".main-content");

    if (!nav || !main) return;

   
    nav.querySelectorAll(
      '[data-section="content-tools"], [data-section="sessions"]'
    ).forEach((button) => button.remove());

    if (!nav.querySelector('[data-section="faqs"]')) {
      nav.insertAdjacentHTML("beforeend", `
        <button type="button" class="dashboard-nav-item" data-section="faqs">
          <span class="nav-symbol">08</span><span>FAQs</span>
        </button>

        ${GU_PAGES.map((page, index) => `
          <button type="button" class="dashboard-nav-item"
            data-section="page-editor" data-page-slug="${page[0]}">
            <span class="nav-symbol">${String(index + 9).padStart(2, "0")}</span>
            <span>${page[1]}</span>
          </button>
        `).join("")}

        <button type="button" class="dashboard-nav-item" data-section="sessions">
          <span class="nav-symbol">15</span><span>Guest Sessions</span>
        </button>
      `);
    }


    if (!$("#section-content-tools")) {
      main.insertAdjacentHTML(
        "beforeend",
        `
        <section id="section-content-tools" class="dashboard-section">
          <div class="page-heading">
            <div>
              <p class="eyebrow">08 / CONTENT MANAGEMENT</p>
              <h1>FAQs & Page Sections</h1>
              <p>Manage individual FAQs and additional website content.</p>
            </div>
          </div>

         
<div class="editor-card gu-faq-library">
  <div class="editor-card-header gu-faq-heading">
    <div>
      <p class="eyebrow">CONTENT LIBRARY</p>
      <h2>Frequently asked questions</h2>
      <p>Manage your questions one at a time.</p>
    </div>
    <button type="button" id="gu-faq-add" class="primary-button">
      + Add FAQ
    </button>
  </div>

  <div id="gu-faq-list" class="editor-list"></div>
</div>

<div id="gu-faq-editor-panel" class="editor-card gu-faq-editor hidden">
  <div class="editor-card-header gu-faq-heading">
    <div>
      <p class="eyebrow">FAQ EDITOR</p>
      <h2 id="gu-faq-editor-title">Add a question</h2>
      <p>Make your changes below.</p>
    </div>
    <button type="button" id="gu-faq-close" class="secondary-button">
      Close
    </button>
  </div>

  <form id="gu-faq-form">
    <input type="hidden" id="gu-faq-id">

    <div class="form-grid">
      <div class="form-group full">
        <label for="gu-faq-question">Question</label>
        <input id="gu-faq-question" type="text"
          placeholder="Enter the question" required>
      </div>

      <div class="form-group full">
        <label for="gu-faq-answer">Answer</label>
        <textarea id="gu-faq-answer" rows="5"
          placeholder="Write the answer" required></textarea>
      </div>

      <div class="form-group">
        <label for="gu-faq-category">Category</label>
        <input id="gu-faq-category" placeholder="e.g. Membership">
      </div>

      <div class="form-group">
        <label for="gu-faq-order">Display order</label>
        <input id="gu-faq-order" type="number" min="0" value="0">
      </div>

      <div class="form-group full gu-publish-box">
        <label class="gu-publish-label" for="gu-faq-published">
          <input id="gu-faq-published" type="checkbox">
          <span>
            <strong>Publish this FAQ</strong>
            <small>Published questions can appear on the public website.</small>
          </span>
        </label>
      </div>
    </div>

    <div class="gu-faq-actions">
      <span id="gu-faq-message" class="save-message" role="status"></span>
      <div>
        <button type="button" id="gu-faq-reset" class="secondary-button">
          Cancel
        </button>
        <button type="submit" class="primary-button">Save FAQ</button>
      </div>
    </div>
  </form>
</div>


          <div class="editor-card">
            <div class="editor-card-header">
              <div>
                <h2>Other page sections</h2>
                <p>
                  Store editable section content for Programs, Team,
                  Resources, Contact, Privacy and other pages.
                </p>
              </div>
            </div>

            <form id="gu-page-form">
              <input type="hidden" id="gu-page-id">

              <div class="form-grid">
                <div class="form-group">
                  <label for="gu-page-slug">Page</label>
                  <select id="gu-page-slug">
                    <option value="about">About</option>
                    <option value="programs">Programs</option>
                    <option value="team">Our Team</option>
                    <option value="resources">Resources</option>
                    <option value="get-involved">Get Involved</option>
                    <option value="contact">Contact</option>
                    <option value="circle">Bloom & Glow Circle</option>
                    <option value="impact">Impact</option>
                    <option value="faq">FAQ</option>
                    <option value="privacy">Privacy Policy</option>
                    <option value="speakers">Guest Speakers</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="gu-page-key">Section key</label>
                  <input id="gu-page-key" required placeholder="hero">
                </div>

                <div class="form-group">
                  <label for="gu-page-type">Section type</label>
                  <input id="gu-page-type" value="content" required>
                </div>

                <div class="form-group">
                  <label for="gu-page-title">Section title</label>
                  <input id="gu-page-title">
                </div>

                <div class="form-group">
                  <label for="gu-page-order">Display order</label>
                  <input id="gu-page-order" type="number" value="0">
                </div>

               
<div class="form-group full">
  <label for="gu-section-label">Section label</label>
  <input id="gu-section-label" placeholder="e.g. Our Story">
</div>

<div class="form-group full">
  <label for="gu-section-heading">Main heading</label>
  <input id="gu-section-heading" placeholder="Enter the section heading">
</div>

<div class="form-group full">
  <label for="gu-section-intro">Introductory text</label>
  <textarea id="gu-section-intro" rows="3"
    placeholder="Enter the short introduction"></textarea>
</div>

<div class="form-group full">
  <label for="gu-section-body">Body paragraphs</label>
  <textarea id="gu-section-body" rows="6"
    placeholder="Write each paragraph on a separate line"></textarea>
  <small>Put each paragraph on a new line.</small>
</div>

<div class="form-group full">
  <label>Cards in this section</label>
  <div id="gu-section-cards"></div>
  <button type="button" id="gu-add-card" class="secondary-button">
    + Add card
  </button>
</div>

<div class="form-group full">
  <label for="gu-section-button-text">Primary button text</label>
  <input id="gu-section-button-text" placeholder="e.g. Join the Sisterhood">
</div>

<div class="form-group full">
  <label for="gu-section-button-link">Primary button link</label>
  <input id="gu-section-button-link" placeholder="e.g. get-involved.html">
</div>

<div class="form-group full">
  <label for="gu-section-secondary-text">Secondary button text</label>
  <input id="gu-section-secondary-text" placeholder="Optional">
</div>

<div class="form-group full">
  <label for="gu-section-secondary-link">Secondary button link</label>
  <input id="gu-section-secondary-link" placeholder="e.g. about.html">
</div>

              <div class="form-group full gu-page-publish-field">
  <div class="publish-row">
    <label class="publish-switch" for="gu-page-published">
      <input id="gu-page-published" type="checkbox">
      <span class="switch-track"></span>
    </label>
    <label class="publish-label" for="gu-page-published">
      Publish this section
    </label>
  </div>
  <small class="gu-publish-help">
    Turn on to mark this section as published.
  </small>
</div>
              </div>

              <div class="editor-actions">
                <button type="submit" class="primary-button">Save section</button>
                <button type="button" id="gu-page-reset"
                  class="secondary-button">Clear</button>
                <span id="gu-page-message" class="save-message"></span>
              </div>
            </form>

            <div id="gu-page-list" class="editor-list"></div>
          </div>
        </section>

        <section id="section-sessions" class="dashboard-section">
          <div class="page-heading">
            <div>
              <p class="eyebrow">09 / GUEST SESSIONS</p>
              <h1>Guest Sessions</h1>
              <p>
                Manage conversations separately from the speakers' profiles.
              </p>
            </div>
          </div>

          <div class="editor-card">
            <div class="editor-card-header">
              <div>
                <h2>Session details</h2>
                <p>
                  Speaker IDs are optional comma-separated IDs from
                  your Speakers section.
                </p>
              </div>
            </div>

            <form id="gu-session-form">
              <input type="hidden" id="gu-session-id">

              <div class="form-grid">
                <div class="form-group full">
                  <label for="gu-session-title">Session title</label>
                  <input id="gu-session-title" required>
                </div>

                <div class="form-group">
                  <label for="gu-session-slug">Slug</label>
                  <input id="gu-session-slug" placeholder="girls-and-money">
                </div>

                <div class="form-group">
                  <label for="gu-session-date">Date</label>
                  <input id="gu-session-date" type="date">
                </div>

                <div class="form-group">
                  <label for="gu-session-start">Start time</label>
                  <input id="gu-session-start" placeholder="7:00 PM WAT">
                </div>

                <div class="form-group">
                  <label for="gu-session-end">End time</label>
                  <input id="gu-session-end" placeholder="8:30 PM WAT">
                </div>

                <div class="form-group">
                  <label for="gu-session-platform">Platform</label>
                  <input id="gu-session-platform" placeholder="Google Meet">
                </div>

                <div class="form-group">
                  <label for="gu-session-url">Meeting URL</label>
                  <input id="gu-session-url" type="url">
                </div>

                <div class="form-group">
                  <label for="gu-session-image">Cover image URL</label>
                  <input id="gu-session-image" type="url">
                </div>

                <div class="form-group">
                  <label for="gu-session-order">Display order</label>
                  <input id="gu-session-order" type="number" value="0">
                </div>

                <div class="form-group">
                  <label for="gu-session-speakers">Speaker IDs</label>
                  <input id="gu-session-speakers" placeholder="e.g. 2, 3">
                </div>

                <div class="form-group full">
                  <label for="gu-session-description">Description</label>
                  <textarea id="gu-session-description" rows="4"></textarea>
                </div>

                <div class="form-group">
                  <label>
                    <input id="gu-session-published" type="checkbox">
                    Published
                  </label>
                </div>
              </div>

              <div class="editor-actions">
                <button type="submit" class="primary-button">Save session</button>
                <button type="button" id="gu-session-reset"
                  class="secondary-button">Clear</button>
                <span id="gu-session-message" class="save-message"></span>
              </div>
            </form>

            <div id="gu-session-list" class="editor-list"></div>
          </div>
        </section>
        `
      );
    }


    const oldSection = $("#section-content-tools");

    if (oldSection && !$("#section-faqs")) {
      const faqSection = document.createElement("section");
      faqSection.id = "section-faqs";
      faqSection.className = "dashboard-section";
      faqSection.innerHTML = `
        <div class="page-heading">
          <div>
            <p class="eyebrow">08 / CONTENT MANAGEMENT</p>
            <h1>FAQs</h1>
            <p>Manage frequently asked questions separately from website pages.</p>
          </div>
        </div>
      `;

      const faqLibrary = oldSection.querySelector(".gu-faq-library");
      const faqEditor = oldSection.querySelector("#gu-faq-editor-panel");

      if (faqLibrary) faqSection.appendChild(faqLibrary);
      if (faqEditor) faqSection.appendChild(faqEditor);

      oldSection.id = "section-page-editor";

      const heading = oldSection.querySelector(".page-heading h1");
      if (heading) {
        heading.id = "gu-page-editor-heading";
        heading.textContent = "About Editor";
      }

      const eyebrow = oldSection.querySelector(".page-heading .eyebrow");
      if (eyebrow) eyebrow.textContent = "PAGE MANAGEMENT";

      const description = oldSection.querySelector(
        ".page-heading p:not(.eyebrow)"
      );
      if (description) {
        description.textContent = "Manage content for the selected page.";
      }

      main.insertBefore(faqSection, oldSection);
    }

     
    // Delegated navigation also supports buttons added above.
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-section]");
      if (!button) return;

      const name = button.dataset.section;
     
      if (
        name === "faqs" ||
        name === "page-editor" ||
        name === "sessions"
      ) {
        event.preventDefault();
        switchSection(name, button.dataset.pageSlug);
        refreshAll();
      }

    });

    $("#gu-faq-form").addEventListener("submit", saveFaq);
    $("#gu-page-form").addEventListener("submit", savePage);
    $("#gu-session-form").addEventListener("submit", saveSession);

    $("#gu-faq-reset").addEventListener("click", resetFaq);
    $("#gu-page-reset").addEventListener("click", resetPage);
    
    $("#gu-add-card").addEventListener("click", () => {
      addSectionCard();
    });

    $("#gu-section-cards").addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-card]");
      if (!removeButton) return;

      removeButton.closest(".gu-section-card-item").remove();
    });

    $("#gu-session-reset").addEventListener("click", resetSession);

    document.addEventListener("click", handleItemAction);
  }

 
async function loadFaqs() {
  const { data, error } = await client()
    .from("faq_items")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;

  faqRows = data || [];

  $("#gu-faq-list").innerHTML = faqRows.map((item) => `
    <article class="editor-item gu-faq-item">
      <div class="editor-item-header">
        <div class="gu-faq-main">
          <div class="gu-faq-meta">
            <span class="gu-faq-status ${item.published ? "published" : "draft"}">
              ${item.published ? "Published" : "Draft"}
            </span>
            <span>${esc(item.category || "Uncategorised")}</span>
          </div>
          <h3 class="editor-item-title">${esc(item.question)}</h3>
        </div>

        <div class="editor-item-actions">
          <button type="button" class="secondary-button"
            data-gu-edit="faq" data-id="${item.id}">Edit</button>
          <button type="button" class="danger-button"
            data-gu-delete="faq" data-id="${item.id}">Delete</button>
        </div>
      </div>

      <p class="gu-faq-answer-preview">${esc(item.answer)}</p>
    </article>
  `).join("") || `
    <div class="empty-state">
      <strong>No FAQs imported yet</strong>
      <p>Your existing website FAQs still need to be imported.</p>
    </div>`;
}

 
async function loadPages() {
  const { data, error } = await client()
    .from("page_content_items")
    .select("*")
    .order("page_slug")
    .order("display_order", { ascending: true });

  if (error) throw error;

  pageRows = data || [];

 $("#gu-page-list").innerHTML = pageRows
  .filter((item) => item.page_slug === currentPageSlug)
  .map((item) => `
    <article class="editor-card">
      <h3>${esc(item.page_slug)} / ${esc(item.section_key)}</h3>
      <p>${esc(item.title || item.content_type)} ·
        ${item.published ? "Published" : "Draft"}</p>
      <pre style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(
        JSON.stringify(item.metadata || {}, null, 2)
      )}</pre>
      <div class="editor-actions">
        <button type="button" class="secondary-button"
          data-gu-edit="page" data-id="${item.id}">Edit</button>
        <button type="button" class="secondary-button"
          data-gu-delete="page" data-id="${item.id}">Delete</button>
      </div>
    </article>
  `).join("") || '<p class="empty-state">No extra page sections yet.</p>';
}

  async function loadSessions() {
    const { data, error } = await client()
      .from("guest_sessions")
      .select("*")
      .order("session_date", { ascending: false, nullsFirst: false })
      .order("display_order", { ascending: true });

    if (error) throw error;

    sessionRows = data || [];

    $("#gu-session-list").innerHTML = sessionRows.map((item) => `
      <article class="editor-card">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.session_date || "Date not set")} ·
          ${item.published ? "Published" : "Draft"}</p>
        <p>${esc(item.description || "")}</p>
        <div class="editor-actions">
          <button type="button" class="secondary-button"
            data-gu-edit="session" data-id="${item.id}">Edit</button>
          <button type="button" class="secondary-button"
            data-gu-delete="session" data-id="${item.id}">Delete</button>
        </div>
      </article>
    `).join("") || '<p class="empty-state">No guest sessions yet.</p>';
  }

  async function refreshAll() {
    try {
      await Promise.all([loadFaqs(), loadPages(), loadSessions()]);
    } catch (error) {
      console.error("Additional CMS loading error:", error);
      showMessage("#gu-faq-message", error.message, true);
      showMessage("#gu-page-message", error.message, true);
      showMessage("#gu-session-message", error.message, true);
    }
  }

  function resetFaq() {
    $("#gu-faq-form").reset();
    $("#gu-faq-id").value = "";
    $("#gu-faq-order").value = "0";
    showMessage("#gu-faq-message", "");
  }

   
  function renderSectionCards(cards = []) {
    const container = $("#gu-section-cards");
    if (!container) return;

    container.innerHTML = "";

    cards.forEach((card) => addSectionCard(card));
  }

  function addSectionCard(card = {}) {
    const container = $("#gu-section-cards");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "gu-section-card-item editor-card";

    wrapper.innerHTML = `
      <div class="editor-card-header">
        <h3>Section card</h3>
        <button type="button"
          class="danger-button"
          data-remove-card>
          Remove card
        </button>
      </div>

      <div class="form-grid">
        <div class="form-group full">
          <label>Card title</label>
          <input data-card-field="title">
        </div>

        <div class="form-group full">
          <label>Card description</label>
          <textarea data-card-field="description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Icon or symbol</label>
          <input data-card-field="icon" placeholder="Optional">
        </div>

        <div class="form-group">
          <label>Number or statistic</label>
          <input data-card-field="number" placeholder="Optional">
        </div>

        <div class="form-group full">
          <label>Footer text</label>
          <input data-card-field="footer" placeholder="Optional">
        </div>
      </div>
    `;

    Object.entries({
      title: card.title,
      description: card.description,
      icon: card.icon,
      number: card.number,
      footer: card.footer
    }).forEach(([field, value]) => {
      wrapper.querySelector(
        `[data-card-field="${field}"]`
      ).value = value ?? "";
    });

    container.appendChild(wrapper);
  }


 
  function resetPage() {
    $("#gu-page-form").reset();
    $("#gu-page-id").value = "";
    $("#gu-page-slug").value = currentPageSlug;
    $("#gu-page-order").value = "0";
    $("#gu-page-type").value = "content";

    $("#gu-section-label").value = "";
    $("#gu-section-heading").value = "";
    $("#gu-section-intro").value = "";
    $("#gu-section-body").value = "";
    $("#gu-section-button-text").value = "";
    $("#gu-section-button-link").value = "";
    $("#gu-section-secondary-text").value = "";

    renderSectionCards([]);
    showMessage("#gu-page-message", "");
  }


  function resetSession() {
    $("#gu-session-form").reset();
    $("#gu-session-id").value = "";
    $("#gu-session-order").value = "0";
    showMessage("#gu-session-message", "");
  }

  async function saveFaq(event) {
    event.preventDefault();

    try {
      const id = $("#gu-faq-id").value;

      const payload = {
        question: $("#gu-faq-question").value.trim(),
        answer: $("#gu-faq-answer").value.trim(),
        category: $("#gu-faq-category").value.trim() || null,
        display_order: Number($("#gu-faq-order").value) || 0,
        published: $("#gu-faq-published").checked,
        updated_at: new Date().toISOString()
      };

      const query = id
        ? client().from("faq_items").update(payload).eq("id", id)
        : client().from("faq_items").insert(payload);

      const { error } = await query;
      if (error) throw error;

     resetFaq();
$("#gu-faq-editor-panel").classList.add("hidden");
showMessage("#gu-faq-message", "FAQ saved.");
await loadFaqs();
    } catch (error) {
      showMessage("#gu-faq-message", error.message, true);
    }
  }



async function savePage(event) {
  event.preventDefault();

  try {
    const id = $("#gu-page-id").value;
    const title = $("#gu-page-title").value.trim();
    const intro = $("#gu-section-intro").value.trim();

    const cards = Array.from(
      $("#gu-section-cards").querySelectorAll(".gu-section-card-item")
    ).map((card) => ({
      title: card.querySelector('[data-card-field="title"]').value.trim(),
      description: card.querySelector('[data-card-field="description"]').value.trim(),
      icon: card.querySelector('[data-card-field="icon"]').value.trim(),
      number: card.querySelector('[data-card-field="number"]').value.trim(),
      footer: card.querySelector('[data-card-field="footer"]').value.trim()
    }));

    const metadata = {
      label: $("#gu-section-label").value.trim(),
      heading: $("#gu-section-heading").value.trim() || title,
      intro,
      bodyParagraphs: $("#gu-section-body").value
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      cards,
      buttonText: $("#gu-section-button-text").value.trim(),
      buttonLink: $("#gu-section-button-link").value.trim(),
      secondaryButtonText: $("#gu-section-secondary-text").value.trim(),
      secondaryButtonLink: $("#gu-section-secondary-link").value.trim()
    };

    const payload = {
      page_slug: $("#gu-page-slug").value,
      section_key: $("#gu-page-key").value.trim(),
      content_type: $("#gu-page-type").value.trim() || "content",
      title: metadata.heading,
      description: intro,
      link: metadata.buttonLink || null,
      link_text: metadata.buttonText || null,
      icon: null,
      metadata,
      display_order: Number($("#gu-page-order").value) || 0,
      published: $("#gu-page-published").checked,
      updated_at: new Date().toISOString()
    };

    const query = id
      ? client().from("page_content_items").update(payload).eq("id", id)
      : client().from("page_content_items").insert(payload);

    const { error } = await query;
    if (error) throw error;

    resetPage();
    showMessage("#gu-page-message", "Section saved.");
    await loadPages();
  } catch (error) {
    console.error("Could not save page section:", error);
    showMessage("#gu-page-message", error.message, true);
  }
}



  async function saveSession(event) {
    event.preventDefault();

    try {
      const id = $("#gu-session-id").value;
      const title = $("#gu-session-title").value.trim();
      const slug = $("#gu-session-slug").value.trim() ||
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const payload = {
        slug,
        title,
        description: $("#gu-session-description").value.trim() || null,
        session_date: $("#gu-session-date").value || null,
        start_time: $("#gu-session-start").value.trim() || null,
        end_time: $("#gu-session-end").value.trim() || null,
        platform: $("#gu-session-platform").value.trim() || null,
        meeting_url: $("#gu-session-url").value.trim() || null,
        cover_image_url: $("#gu-session-image").value.trim() || null,
        display_order: Number($("#gu-session-order").value) || 0,
        published: $("#gu-session-published").checked,
        updated_at: new Date().toISOString()
      };

      let sessionId = id;

      if (id) {
        const { error } = await client()
          .from("guest_sessions")
          .update(payload)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await client()
          .from("guest_sessions")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        sessionId = data.id;
      }

      const speakerIds = [
        ...new Set(
          $("#gu-session-speakers").value
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => Number.isInteger(value) && value > 0)
        )
      ];

      const { error: deleteError } = await client()
        .from("guest_session_speakers")
        .delete()
        .eq("session_id", sessionId);

      if (deleteError) throw deleteError;

      if (speakerIds.length) {
        const rows = speakerIds.map((speaker_id, index) => ({
          session_id: sessionId,
          speaker_id,
          display_order: index
        }));

        const { error } = await client()
          .from("guest_session_speakers")
          .insert(rows);

        if (error) throw error;
      }

      resetSession();
      showMessage("#gu-session-message", "Session saved.");
      await loadSessions();
    } catch (error) {
      showMessage("#gu-session-message", error.message, true);
    }
  }

  async function handleItemAction(event) {
    const editButton = event.target.closest("[data-gu-edit]");
    const deleteButton = event.target.closest("[data-gu-delete]");

    if (editButton) {
      const type = editButton.dataset.guEdit;
      const id = editButton.dataset.id;

    
if (type === "faq") {
  const item = faqRows.find((row) => String(row.id) === id);
  if (!item) return;

  $("#gu-faq-id").value = item.id;
  $("#gu-faq-question").value = item.question;
  $("#gu-faq-answer").value = item.answer;
  $("#gu-faq-category").value = item.category || "";
  $("#gu-faq-order").value = item.display_order ?? 0;
  $("#gu-faq-published").checked = item.published;

  $("#gu-faq-editor-title").textContent = "Edit question";
  switchSection("faqs");

  $("#gu-faq-editor-panel").classList.remove("hidden");
  $("#gu-faq-editor-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


     
if (type === "page") {
  const item = pageRows.find((row) => String(row.id) === id);
  if (!item) return;

  const metadata =
    item.metadata && typeof item.metadata === "object"
      ? item.metadata
      : {};

  $("#gu-page-id").value = item.id;
  $("#gu-page-slug").value = item.page_slug;
  $("#gu-page-key").value = item.section_key;
  $("#gu-page-type").value = item.content_type || "content";
  $("#gu-page-title").value = item.title || "";
  $("#gu-page-order").value = item.display_order ?? 0;
  $("#gu-page-published").checked = item.published;

  $("#gu-section-label").value = metadata.label || "";
  $("#gu-section-heading").value = metadata.heading || item.title || "";
  $("#gu-section-intro").value = metadata.intro || item.description || "";
  $("#gu-section-body").value = Array.isArray(metadata.bodyParagraphs)
    ? metadata.bodyParagraphs.join("\n")
    : "";

  $("#gu-section-button-text").value = metadata.buttonText || item.link_text || "";
  $("#gu-section-button-link").value = metadata.buttonLink || item.link || "";
  $("#gu-section-secondary-text").value = metadata.secondaryButtonText || "";

  const secondaryLink = $("#gu-section-secondary-link");
  if (secondaryLink) {
    secondaryLink.value = metadata.secondaryButtonLink || "";
  }

  renderSectionCards(Array.isArray(metadata.cards) ? metadata.cards : []);

  switchSection("page-editor", item.page_slug);
  $("#gu-page-form").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


      if (type === "session") {
        const item = sessionRows.find((row) => String(row.id) === id);
        if (!item) return;

        $("#gu-session-id").value = item.id;
        $("#gu-session-title").value = item.title;
        $("#gu-session-slug").value = item.slug || "";
        $("#gu-session-description").value = item.description || "";
        $("#gu-session-date").value = item.session_date || "";
        $("#gu-session-start").value = item.start_time || "";
        $("#gu-session-end").value = item.end_time || "";
        $("#gu-session-platform").value = item.platform || "";
        $("#gu-session-url").value = item.meeting_url || "";
        $("#gu-session-image").value = item.cover_image_url || "";
        $("#gu-session-order").value = item.display_order ?? 0;

        const { data, error } = await client()
          .from("guest_session_speakers")
          .select("speaker_id")
          .eq("session_id", item.id);

        if (error) {
          showMessage("#gu-session-message", error.message, true);
          return;
        }

        $("#gu-session-speakers").value =
          (data || []).map((row) => row.speaker_id).join(", ");

        switchSection("sessions");
      }
    }

    if (deleteButton) {
      const type = deleteButton.dataset.guDelete;
      const id = deleteButton.dataset.id;

      if (!window.confirm("Delete this item? This cannot be undone.")) {
        return;
      }

      try {
        const table = {
          faq: "faq_items",
          page: "page_content_items",
          session: "guest_sessions"
        }[type];

        const { error } = await client()
          .from(table)
          .delete()
          .eq("id", id);

        if (error) throw error;

        await refreshAll();
      } catch (error) {
        window.alert("Could not delete item: " + error.message);
      }
    }
  }


document.addEventListener("DOMContentLoaded", () => {
  addDashboardSections();

  $("#gu-faq-add").addEventListener("click", () => {
    resetFaq();
    $("#gu-faq-editor-title").textContent = "Add a question";
    $("#gu-faq-editor-panel").classList.remove("hidden");
    $("#gu-faq-editor-panel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  $("#gu-faq-close").addEventListener("click", () => {
    $("#gu-faq-editor-panel").classList.add("hidden");
  });

  $("#gu-faq-reset").addEventListener("click", () => {
    resetFaq();
    $("#gu-faq-editor-panel").classList.add("hidden");
  });

  refreshAll();
});
})();

