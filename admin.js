/* =========================================================
   GIRLS UNPLUGGED ADMIN DASHBOARD
   ========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL = "https://siiysnvzwjoyvmxqjruz.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_jT9aTC0gXSYO8sel2kDVtQ_HmsSI3Q4";

const BUCKET = "girls-unplugged-media";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentUser = null;

let settingsRecord = null;

let impactStats = [];
let programs = [];
let speakers = [];
let teamMembers = [];
let resources = [];


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  setupNavigation();
  setupLogin();
  setupPasswordToggle();
  setupMobileSidebar();
  setupAddButtons();

  updateDashboardDate();

  await checkExistingSession();

});


/* =========================================================
   AUTHENTICATION
   ========================================================= */

async function checkExistingSession() {

  try {

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {

      showLogin();

      return;
    }

    const authorized = await verifyAdmin(session.user.id);

    if (!authorized) {

      await supabaseClient.auth.signOut();

      showLogin();

      showLoginMessage(
        "This account does not have admin access.",
        "error"
      );

      return;
    }

    currentUser = session.user;

    showDashboard();

    await loadEverything();

  } catch (error) {

    console.error(error);

    showLogin();

  }

}


/* =========================================================
   VERIFY ADMIN
   ========================================================= */

async function verifyAdmin(userId) {

  console.log("========== ADMIN DIAGNOSTIC ==========");
  console.log("LOGIN UID:", userId);

  const {
    data: userData,
    error: userError
  } = await supabaseClient.auth.getUser();

  console.log("CURRENT AUTH USER:", userData?.user?.id);
  console.log("AUTH ERROR:", userError);

  const {
    data,
    error
  } = await supabaseClient
    .from("admin_users")
    .select("id, user_id")
    .eq("user_id", userId);

  console.log("ADMIN QUERY DATA:", data);
  console.log("ADMIN QUERY ERROR:", error);

  const diagnostic = `
LOGIN UID:
${userId || "NONE"}

CURRENT AUTH USER:
${userData?.user?.id || "NONE"}

ADMIN QUERY DATA:
${JSON.stringify(data) || "NONE"}

ADMIN QUERY ERROR:
${error?.message || "NONE"}
`;

  console.log(diagnostic);

  const messageBox = $("#login-message");

  if (messageBox) {
    messageBox.textContent = diagnostic;
    messageBox.style.whiteSpace = "pre-line";
    messageBox.style.display = "block";
  }

  if (error) {
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}
  
/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

  const form = $("#login-form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;

    const button = form.querySelector("button[type='submit']");

    button.disabled = true;
    button.textContent = "Signing in...";

    showLoginMessage("", "");

    try {

      const {
        data,
        error
      } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      const authorized = await verifyAdmin(data.user.id);

      if (!authorized) {

        await supabaseClient.auth.signOut();

        throw new Error(
          "Your account is authenticated but does not have admin access."
        );

      }

      currentUser = data.user;

      showDashboard();

      await loadEverything();

    } catch (error) {

      console.error(error);

      showLoginMessage(
        error.message || "Unable to sign in.",
        "error"
      );

    } finally {

      button.disabled = false;
      button.textContent = "Sign in";

    }

  });

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function setupPasswordToggle() {

  const toggle = $("#toggle-password");
  const password = $("#login-password");

  if (!toggle || !password) return;

  toggle.addEventListener("click", () => {

    const isPassword =
      password.getAttribute("type") === "password";

    password.setAttribute(
      "type",
      isPassword ? "text" : "password"
    );

    toggle.textContent =
      isPassword ? "Hide" : "Show";

  });

}


/* =========================================================
   SHOW / HIDE SCREENS
   ========================================================= */

function showLogin() {

  $("#login-screen").classList.remove("hidden");
  $("#dashboard").classList.add("hidden");

}


function showDashboard() {

  $("#login-screen").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");

}


/* =========================================================
   LOGIN MESSAGE
   ========================================================= */

function showLoginMessage(message, type) {

  const element = $("#login-message");

  if (!element) return;

  element.textContent = message;

  element.className = "form-message";

  if (type) {
    element.classList.add(type);
  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

  await supabaseClient.auth.signOut();

  currentUser = null;

  showLogin();

  $("#login-form").reset();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  $$(".dashboard-nav-item").forEach((button) => {

    button.addEventListener("click", () => {

      const section = button.dataset.section;

      openSection(section);

      closeMobileSidebar();

    });

  });

}


function openSection(sectionName) {

  $$(".dashboard-nav-item").forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.section === sectionName
    );

  });

  $$(".dashboard-section").forEach((section) => {

    section.classList.remove("active-section");

  });

  const target = $(`#section-${sectionName}`);

  if (target) {
    target.classList.add("active-section");
  }

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {

  const button = $("#mobile-sidebar-toggle");

  if (!button) return;

  button.addEventListener("click", () => {

    $("#sidebar").classList.toggle("open");

  });

}


function closeMobileSidebar() {

  const sidebar = $("#sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

}


/* =========================================================
   ADD BUTTONS
   ========================================================= */

function setupAddButtons() {

  $("#add-impact")?.addEventListener(
    "click",
    () => addImpact()
  );

  $("#add-program")?.addEventListener(
    "click",
    () => addProgram()
  );

  $("#add-speaker")?.addEventListener(
    "click",
    () => addSpeaker()
  );

  $("#add-team")?.addEventListener(
    "click",
    () => addTeamMember()
  );

  $("#add-resource")?.addEventListener(
    "click",
    () => addResource()
  );

  $("#logout-button")?.addEventListener(
    "click",
    logout
  );

}


/* =========================================================
   LOAD EVERYTHING
   ========================================================= */

async function loadEverything() {

  await Promise.all([
    loadSettings(),
    loadHomepage(),
    loadImpact(),
    loadPrograms(),
    loadSpeakers(),
    loadTeam(),
    loadResources()
  ]);

  updateOverview();

}


/* =========================================================
   HOMEPAGE
   ========================================================= */

async function loadHomepage() {

  const {
    data,
    error
  } = await supabaseClient
    .from("homepage_content")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {

    console.error("Homepage error:", error);

    const container = $("#homepage-editor");

    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <strong>Could not load homepage content.</strong>
          <p>${escapeHTML(error.message)}</p>
        </div>
      `;
    }

    return;
  }

  homepageContent = data || [];

  renderHomepage();

}


function renderHomepage() {

  const container = $("#homepage-editor");

  if (!container) return;

  if (!homepageContent.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No homepage content found.</strong>
        <p>Your homepage content has not been added yet.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = homepageContent.map((item) => {

    const content = item.content || {};

    return `

      <article class="editor-card homepage-editor-card">

        <div class="editor-card-header">

          <div>

            <p class="eyebrow">
              ${escapeHTML(
                String(item.display_order).padStart(2, "0")
              )}
            </p>

            <h2>
              ${escapeHTML(item.section)}
            </h2>

            <p>
              Edit the content for this homepage section.
            </p>

          </div>

          <div class="publish-row">

            <label class="publish-switch">

              <input
                id="homepage-published-${item.id}"
                type="checkbox"
                ${item.published !== false ? "checked" : ""}
              >

              <span class="switch-track"></span>

            </label>

            <span class="publish-label">
              Published
            </span>

          </div>

        </div>


        <div class="homepage-fields">

          ${renderHomepageFields(
            item.id,
            content
          )}

        </div>


        <div class="editor-actions">

          <button
            type="button"
            class="primary-button"
            onclick="saveHomepageSection(${item.id})"
          >
            Save ${escapeHTML(item.section)}
          </button>

          <span
            id="homepage-message-${item.id}"
            class="save-message"
          ></span>

        </div>

      </article>

    `;

  }).join("");

}


function renderHomepageFields(id, content) {

  let html = "";

  Object.entries(content).forEach(([key, value]) => {

    if (Array.isArray(value)) {

      html += `
        <div class="homepage-array full">

          <div class="homepage-array-heading">
            ${formatHomepageLabel(key)}
          </div>

          <div class="homepage-array-items">

            ${value.map((item, index) => {

              if (
                item &&
                typeof item === "object" &&
                !Array.isArray(item)
              ) {

                return `
                  <div class="homepage-nested-card">

                    <div class="homepage-nested-title">
                      ${formatHomepageLabel(key)}
                      ${index + 1}
                    </div>

                    ${Object.entries(item).map(
                      ([nestedKey, nestedValue]) => {

                        return renderHomepageField(
                          id,
                          `${key}.${index}.${nestedKey}`,
                          nestedKey,
                          nestedValue
                        );

                      }
                    ).join("")}

                  </div>
                `;

              }

              return renderHomepageField(
                id,
                `${key}.${index}`,
                key,
                item
              );

            }).join("")}

          </div>

        </div>
      `;

      return;
    }


    if (
      value &&
      typeof value === "object"
    ) {

      html += `
        <div class="homepage-object full">

          <div class="homepage-array-heading">
            ${formatHomepageLabel(key)}
          </div>

          ${Object.entries(value).map(
            ([nestedKey, nestedValue]) =>
              renderHomepageField(
                id,
                `${key}.${nestedKey}`,
                nestedKey,
                nestedValue
              )
          ).join("")}

        </div>
      `;

      return;
    }


    html += renderHomepageField(
      id,
      key,
      key,
      value
    );

  });

  return html;
}


function renderHomepageField(
  id,
  path,
  label,
  value
) {

  const fieldId =
    `homepage-${id}-${path.replace(/[^a-zA-Z0-9]/g, "-")}`;

  const isLongText =
    String(value ?? "").length > 120 ||
    String(label).toLowerCase().includes("description") ||
    String(label).toLowerCase().includes("paragraph") ||
    String(label).toLowerCase().includes("bio");

  return `

    <div class="form-group">

      <label for="${fieldId}">
        ${formatHomepageLabel(label)}
      </label>

      ${
        isLongText

          ? `
            <textarea
              id="${fieldId}"
              data-homepage-path="${escapeHTML(path)}"
              data-homepage-type="textarea"
            >${escapeHTML(value ?? "")}</textarea>
          `

          : `
            <input
              id="${fieldId}"
              type="text"
              value="${escapeHTML(value ?? "")}"
              data-homepage-path="${escapeHTML(path)}"
              data-homepage-type="input"
            >
          `
      }

    </div>

  `;
}


function formatHomepageLabel(value) {

  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

}


async function saveHomepageSection(id) {

  const item =
    homepageContent.find(
      (entry) => entry.id === id
    );

  if (!item) return;


  const message =
    $(`#homepage-message-${id}`);

  if (message) {
    message.textContent = "Saving...";
    message.className = "save-message";
  }


  const updatedContent =
    structuredClone(item.content || {});


  const fields =
    document.querySelectorAll(
      `[data-homepage-path]`
    );


  fields.forEach((field) => {

    const path =
      field.dataset.homepagePath;

    if (!field.id.includes(`homepage-${id}-`)) {
      return;
    }

    setNestedValue(
      updatedContent,
      path,
      field.value
    );

  });


  const published =
    $(`#homepage-published-${id}`)?.checked !== false;


  const {
    error
  } = await supabaseClient
    .from("homepage_content")
    .update({
      content: updatedContent,
      published,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);


  if (error) {

    console.error(error);

    if (message) {
      message.textContent =
        error.message || "Could not save.";
      message.className = "save-message";
    }

    return;
  }


  if (message) {
    message.textContent =
      "Saved successfully.";
    message.className =
      "save-message success";
  }


  await loadHomepage();

}


function setNestedValue(
  object,
  path,
  value
) {

  const parts =
    path.split(".");

  let current = object;


  for (let index = 0; index < parts.length - 1; index++) {

    const part = parts[index];

    if (
      current[part] === undefined ||
      current[part] === null
    ) {

      const nextPart =
        parts[index + 1];

      current[part] =
        /^\d+$/.test(nextPart)
          ? []
          : {};

    }

    current = current[part];

  }


  const finalKey =
    parts[parts.length - 1];


  const originalValue =
    current[finalKey];


  if (typeof originalValue === "number") {

    const numberValue =
      Number(value);

    current[finalKey] =
      Number.isNaN(numberValue)
        ? 0
        : numberValue;

  } else {

    current[finalKey] =
      value;

  }

}


/* =========================================================
   SETTINGS
   ========================================================= */

async function loadSettings() {

  const {
    data,
    error
  } = await supabaseClient
    .from("site_settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1);

  if (error) {

    console.error("Settings error:", error);

    return;
  }

  settingsRecord = data?.[0] || null;

  $("#settings-site-name").value =
    settingsRecord?.site_name || "";

  $("#settings-tagline").value =
    settingsRecord?.tagline || "";

  $("#settings-description").value =
    settingsRecord?.description || "";

  $("#settings-email").value =
    settingsRecord?.email || "";

  $("#settings-instagram").value =
    settingsRecord?.instagram_url || "";

  $("#settings-tiktok").value =
    settingsRecord?.tiktok_url || "";

  $("#settings-whatsapp").value =
    settingsRecord?.whatsapp_url || "";


  $("#settings-form").onsubmit = saveSettings;

}


async function saveSettings(event) {

  event.preventDefault();

  const message = $("#settings-message");

  message.textContent = "Saving...";
  message.className = "save-message";


  const values = {

    site_name:
      $("#settings-site-name").value.trim(),

    tagline:
      $("#settings-tagline").value.trim(),

    description:
      $("#settings-description").value.trim(),

    email:
      $("#settings-email").value.trim(),

    instagram_url:
      $("#settings-instagram").value.trim(),

    tiktok_url:
      $("#settings-tiktok").value.trim(),

    whatsapp_url:
      $("#settings-whatsapp").value.trim(),

    updated_at:
      new Date().toISOString()

  };


  try {

    let result;

    if (settingsRecord?.id) {

      result = await supabaseClient
        .from("site_settings")
        .update(values)
        .eq("id", settingsRecord.id);

    } else {

      result = await supabaseClient
        .from("site_settings")
        .insert(values);

    }

    if (result.error) {
      throw result.error;
    }

    message.textContent = "Settings saved successfully.";
    message.className = "save-message success";

    await loadSettings();

  } catch (error) {

    console.error(error);

    message.textContent =
      error.message || "Could not save settings.";

    message.className = "save-message";

  }

}


/* =========================================================
   IMPACT
   ========================================================= */

async function loadImpact() {

  const {
    data,
    error
  } = await supabaseClient
    .from("impact_stats")
    .select("*")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {

    console.error("Impact error:", error);

    return;
  }

  impactStats = data || [];

  renderImpact();

}


function renderImpact() {

  const container = $("#impact-list");

  if (!container) return;

  if (!impactStats.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No impact statistics yet.</strong>
        <p>Add your first statistic below.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = impactStats.map((stat) => `

    <article class="editor-item">

      <div class="editor-item-header">

        <div class="editor-item-title">
          ${escapeHTML(stat.label || "Untitled statistic")}
        </div>

        <div class="editor-item-actions">

          <button
            type="button"
            class="small-button"
            onclick="saveImpact(${stat.id})"
          >
            Save
          </button>

          <button
            type="button"
            class="danger-button"
            onclick="deleteImpact(${stat.id})"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="item-form-grid">

        <div class="form-group">
          <label>Label</label>
          <input
            id="impact-label-${stat.id}"
            type="text"
            value="${escapeHTML(stat.label || "")}"
            placeholder="Community Members"
          >
        </div>


        <div class="form-group">
          <label>Value</label>
          <input
            id="impact-value-${stat.id}"
            type="number"
            value="${stat.value ?? ""}"
            placeholder="120"
          >
        </div>


        <div class="form-group">
          <label>Suffix</label>
          <input
            id="impact-suffix-${stat.id}"
            type="text"
            value="${escapeHTML(stat.suffix || "")}"
            placeholder="+"
          >
        </div>


        <div class="form-group">
          <label>Display order</label>
          <input
            id="impact-order-${stat.id}"
            type="number"
            value="${stat.display_order ?? 0}"
          >
        </div>

      </div>

    </article>

  `).join("");

}


async function addImpact() {

  const {
    error
  } = await supabaseClient
    .from("impact_stats")
    .insert({
      stat_key: `stat_${Date.now()}`,
      label: "New statistic",
      value: 0,
      suffix: "",
      display_order: impactStats.length
    });

  if (error) {

    alert(error.message);

    return;
  }

  await loadImpact();

}


async function saveImpact(id) {

  const values = {

    label:
      $(`#impact-label-${id}`).value.trim(),

    value:
      Number($(`#impact-value-${id}`).value || 0),

    suffix:
      $(`#impact-suffix-${id}`).value.trim(),

    display_order:
      Number($(`#impact-order-${id}`).value || 0),

    updated_at:
      new Date().toISOString()

  };


  const {
    error
  } = await supabaseClient
    .from("impact_stats")
    .update(values)
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadImpact();

}


async function deleteImpact(id) {

  if (!confirm("Delete this statistic?")) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("impact_stats")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadImpact();

}


/* =========================================================
   PROGRAMS
   ========================================================= */

async function loadPrograms() {

  const {
    data,
    error
  } = await supabaseClient
    .from("programs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {

    console.error("Programs error:", error);

    return;
  }

  programs = data || [];

  renderPrograms();

}


function renderPrograms() {

  const container = $("#programs-list");

  if (!container) return;

  if (!programs.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No programs yet.</strong>
        <p>Add your first program below.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = programs.map((item) => `

    <article class="editor-item">

      <div class="editor-item-header">

        <div class="editor-item-title">
          ${escapeHTML(item.title || "Untitled program")}
        </div>

        <div class="editor-item-actions">

          <button
            type="button"
            class="small-button"
            onclick="saveProgram(${item.id})"
          >
            Save
          </button>

          <button
            type="button"
            class="danger-button"
            onclick="deleteProgram(${item.id})"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="item-form-grid">

        <div class="form-group">
          <label>Title</label>
          <input
            id="program-title-${item.id}"
            value="${escapeHTML(item.title || "")}"
            type="text"
          >
        </div>


        <div class="form-group">
          <label>Section</label>
          <input
            id="program-section-${item.id}"
            value="${escapeHTML(item.section || "")}"
            type="text"
            placeholder="Community"
          >
        </div>


        <div class="form-group full">
          <label>Description</label>
          <textarea
            id="program-description-${item.id}"
          >${escapeHTML(item.description || "")}</textarea>
        </div>


        <div class="form-group">
          <label>Link</label>
          <input
            id="program-link-${item.id}"
            value="${escapeHTML(item.link || "")}"
            type="url"
            placeholder="https://..."
          >
        </div>


        <div class="form-group">
          <label>Link text</label>
          <input
            id="program-link-text-${item.id}"
            value="${escapeHTML(item.link_text || "")}"
            type="text"
            placeholder="Learn more"
          >
        </div>


        <div class="form-group">
          <label>Icon</label>
          <input
            id="program-icon-${item.id}"
            value="${escapeHTML(item.icon || "")}"
            type="text"
            placeholder="Use a class/name if your site supports it"
          >
        </div>


        <div class="form-group">
          <label>Display order</label>
          <input
            id="program-order-${item.id}"
            value="${item.display_order ?? 0}"
            type="number"
          >
        </div>


        <div class="form-group full">

          <div class="publish-row">

            <label class="publish-switch">

              <input
                id="program-published-${item.id}"
                type="checkbox"
                ${item.published !== false ? "checked" : ""}
              >

              <span class="switch-track"></span>

            </label>

            <span class="publish-label">
              Published
            </span>

          </div>

        </div>

      </div>

    </article>

  `).join("");

}


async function addProgram() {

  const {
    error
  } = await supabaseClient
    .from("programs")
    .insert({
      slug: `program-${Date.now()}`,
      title: "New program",
      description: "",
      link: "",
      link_text: "Learn more",
      icon: "",
      section: "",
      display_order: programs.length,
      published: true
    });

  if (error) {

    alert(error.message);

    return;
  }

  await loadPrograms();

}


async function saveProgram(id) {

  const values = {

    title:
      $(`#program-title-${id}`).value.trim(),

    section:
      $(`#program-section-${id}`).value.trim(),

    description:
      $(`#program-description-${id}`).value.trim(),

    link:
      $(`#program-link-${id}`).value.trim(),

    link_text:
      $(`#program-link-text-${id}`).value.trim(),

    icon:
      $(`#program-icon-${id}`).value.trim(),

    display_order:
      Number($(`#program-order-${id}`).value || 0),

    published:
      $(`#program-published-${id}`).checked,

    updated_at:
      new Date().toISOString()

  };


  const {
    error
  } = await supabaseClient
    .from("programs")
    .update(values)
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadPrograms();

}


async function deleteProgram(id) {

  if (!confirm("Delete this program?")) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("programs")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadPrograms();

}


/* =========================================================
   SPEAKERS
   ========================================================= */

async function loadSpeakers() {

  const {
    data,
    error
  } = await supabaseClient
    .from("speakers")
    .select("*")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {

    console.error("Speakers error:", error);

    return;
  }

  speakers = data || [];

  renderSpeakers();

}


function renderSpeakers() {

  const container = $("#speakers-list");

  if (!container) return;

  if (!speakers.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No speakers yet.</strong>
        <p>Add your first speaker below.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = speakers.map((item) => `

    <article class="editor-item">

      <div class="editor-item-header">

        <div class="editor-item-title">
          ${escapeHTML(item.name || "New speaker")}
        </div>

        <div class="editor-item-actions">

          <button
            type="button"
            class="small-button"
            onclick="saveSpeaker(${item.id})"
          >
            Save
          </button>

          <button
            type="button"
            class="danger-button"
            onclick="deleteSpeaker(${item.id})"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="item-form-grid">

        <div class="form-group">
          <label>Name</label>
          <input
            id="speaker-name-${item.id}"
            value="${escapeHTML(item.name || "")}"
            type="text"
          >
        </div>


        <div class="form-group">
          <label>Role</label>
          <input
            id="speaker-role-${item.id}"
            value="${escapeHTML(item.role || "")}"
            type="text"
          >
        </div>


        <div class="form-group full">
          <label>Bio</label>
          <textarea
            id="speaker-bio-${item.id}"
          >${escapeHTML(item.bio || "")}</textarea>
        </div>


        <div class="form-group">
          <label>Social/profile URL</label>
          <input
            id="speaker-social-${item.id}"
            value="${escapeHTML(item.social_url || "")}"
            type="url"
            placeholder="https://..."
          >
        </div>


        <div class="form-group">
          <label>Display order</label>
          <input
            id="speaker-order-${item.id}"
            value="${item.display_order ?? 0}"
            type="number"
          >
        </div>


        <div class="form-group full">

          <label>Speaker photo</label>

          <div class="image-upload">

            <div class="image-preview" id="speaker-preview-${item.id}">

              ${
                item.image_url
                  ? `<img src="${escapeHTML(item.image_url)}" alt="">`
                  : `<span class="image-preview-empty">No image</span>`
              }

            </div>


            <div class="file-upload">

              <input
                id="speaker-image-${item.id}"
                type="file"
                accept="image/*"
              >

              <span class="file-upload-note">
                Upload a JPG, PNG, WEBP or other supported image.
              </span>

            </div>

          </div>

        </div>


        <div class="form-group full">

          <div class="publish-row">

            <label class="publish-switch">

              <input
                id="speaker-published-${item.id}"
                type="checkbox"
                ${item.published !== false ? "checked" : ""}
              >

              <span class="switch-track"></span>

            </label>

            <span class="publish-label">
              Published
            </span>

          </div>

        </div>

      </div>

    </article>

  `).join("");


  speakers.forEach((speaker) => {

    const input =
      $(`#speaker-image-${speaker.id}`);

    if (!input) return;

    input.addEventListener("change", (event) => {

      previewImage(
        event.target,
        `#speaker-preview-${speaker.id}`
      );

    });

  });

}


async function addSpeaker() {

  const {
    error
  } = await supabaseClient
    .from("speakers")
    .insert({
      name: "New speaker",
      role: "",
      bio: "",
      image_url: "",
      social_url: "",
      display_order: speakers.length,
      published: true
    });

  if (error) {

    alert(error.message);

    return;
  }

  await loadSpeakers();

}


async function saveSpeaker(id) {

  const speaker = speakers.find(
    (item) => item.id === id
  );

  if (!speaker) return;


  let imageUrl = speaker.image_url || "";

  const file =
    $(`#speaker-image-${id}`)?.files?.[0];


  try {

    if (file) {

      imageUrl = await uploadImage(
        file,
        "speakers"
      );

    }


    const values = {

      name:
        $(`#speaker-name-${id}`).value.trim(),

      role:
        $(`#speaker-role-${id}`).value.trim(),

      bio:
        $(`#speaker-bio-${id}`).value.trim(),

      image_url:
        imageUrl,

      social_url:
        $(`#speaker-social-${id}`).value.trim(),

      display_order:
        Number($(`#speaker-order-${id}`).value || 0),

      published:
        $(`#speaker-published-${id}`).checked,

      updated_at:
        new Date().toISOString()

    };


    const {
      error
    } = await supabaseClient
      .from("speakers")
      .update(values)
      .eq("id", id);


    if (error) {
      throw error;
    }


    await loadSpeakers();

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Could not save speaker."
    );

  }

}


async function deleteSpeaker(id) {

  if (!confirm("Delete this speaker?")) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("speakers")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadSpeakers();

}


/* =========================================================
   TEAM
   ========================================================= */

async function loadTeam() {

  const {
    data,
    error
  } = await supabaseClient
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {

    console.error("Team error:", error);

    return;
  }

  teamMembers = data || [];

  renderTeam();

}


function renderTeam() {

  const container = $("#team-list");

  if (!container) return;

  if (!teamMembers.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No team members yet.</strong>
        <p>Add your first team member below.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = teamMembers.map((item) => `

    <article class="editor-item">

      <div class="editor-item-header">

        <div class="editor-item-title">
          ${escapeHTML(item.name || "New team member")}
        </div>

        <div class="editor-item-actions">

          <button
            type="button"
            class="small-button"
            onclick="saveTeamMember(${item.id})"
          >
            Save
          </button>

          <button
            type="button"
            class="danger-button"
            onclick="deleteTeamMember(${item.id})"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="item-form-grid">

        <div class="form-group">
          <label>Name</label>
          <input
            id="team-name-${item.id}"
            value="${escapeHTML(item.name || "")}"
            type="text"
          >
        </div>


        <div class="form-group">
          <label>Role</label>
          <input
            id="team-role-${item.id}"
            value="${escapeHTML(item.role || "")}"
            type="text"
          >
        </div>


        <div class="form-group full">
          <label>Bio</label>
          <textarea
            id="team-bio-${item.id}"
          >${escapeHTML(item.bio || "")}</textarea>
        </div>


        <div class="form-group">
          <label>Social/profile URL</label>
          <input
            id="team-social-${item.id}"
            value="${escapeHTML(item.social_url || "")}"
            type="url"
            placeholder="https://..."
          >
        </div>


        <div class="form-group">
          <label>Display order</label>
          <input
            id="team-order-${item.id}"
            value="${item.display_order ?? 0}"
            type="number"
          >
        </div>


        <div class="form-group full">

          <label>Team member photo</label>

          <div class="image-upload">

            <div
              class="image-preview"
              id="team-preview-${item.id}"
            >

              ${
                item.image_url
                  ? `<img src="${escapeHTML(item.image_url)}" alt="">`
                  : `<span class="image-preview-empty">No image</span>`
              }

            </div>


            <div class="file-upload">

              <input
                id="team-image-${item.id}"
                type="file"
                accept="image/*"
              >

              <span class="file-upload-note">
                Upload a profile photo.
              </span>

            </div>

          </div>

        </div>


        <div class="form-group full">

          <div class="publish-row">

            <label class="publish-switch">

              <input
                id="team-published-${item.id}"
                type="checkbox"
                ${item.published !== false ? "checked" : ""}
              >

              <span class="switch-track"></span>

            </label>

            <span class="publish-label">
              Published
            </span>

          </div>

        </div>

      </div>

    </article>

  `).join("");


  teamMembers.forEach((member) => {

    const input =
      $(`#team-image-${member.id}`);

    if (!input) return;

    input.addEventListener("change", (event) => {

      previewImage(
        event.target,
        `#team-preview-${member.id}`
      );

    });

  });

}


async function addTeamMember() {

  const {
    error
  } = await supabaseClient
    .from("team_members")
    .insert({
      name: "New team member",
      role: "",
      bio: "",
      image_url: "",
      social_url: "",
      display_order: teamMembers.length,
      published: true
    });

  if (error) {

    alert(error.message);

    return;
  }

  await loadTeam();

}


async function saveTeamMember(id) {

  const member = teamMembers.find(
    (item) => item.id === id
  );

  if (!member) return;


  let imageUrl = member.image_url || "";

  const file =
    $(`#team-image-${id}`)?.files?.[0];


  try {

    if (file) {

      imageUrl = await uploadImage(
        file,
        "team"
      );

    }


    const values = {

      name:
        $(`#team-name-${id}`).value.trim(),

      role:
        $(`#team-role-${id}`).value.trim(),

      bio:
        $(`#team-bio-${id}`).value.trim(),

      image_url:
        imageUrl,

      social_url:
        $(`#team-social-${id}`).value.trim(),

      display_order:
        Number($(`#team-order-${id}`).value || 0),

      published:
        $(`#team-published-${id}`).checked,

      updated_at:
        new Date().toISOString()

    };


    const {
      error
    } = await supabaseClient
      .from("team_members")
      .update(values)
      .eq("id", id);


    if (error) {
      throw error;
    }


    await loadTeam();

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Could not save team member."
    );

  }

}


async function deleteTeamMember(id) {

  if (!confirm("Delete this team member?")) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("team_members")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadTeam();

}


/* =========================================================
   RESOURCES
   ========================================================= */

async function loadResources() {

  const {
    data,
    error
  } = await supabaseClient
    .from("resources")
    .select("*")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {

    console.error("Resources error:", error);

    return;
  }

  resources = data || [];

  renderResources();

}


function renderResources() {

  const container = $("#resources-list");

  if (!container) return;

  if (!resources.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No resources yet.</strong>
        <p>Add your first resource below.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = resources.map((item) => `

    <article class="editor-item">

      <div class="editor-item-header">

        <div class="editor-item-title">
          ${escapeHTML(item.title || "Untitled resource")}
        </div>

        <div class="editor-item-actions">

          <button
            type="button"
            class="small-button"
            onclick="saveResource(${item.id})"
          >
            Save
          </button>

          <button
            type="button"
            class="danger-button"
            onclick="deleteResource(${item.id})"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="item-form-grid">

        <div class="form-group">
          <label>Title</label>
          <input
            id="resource-title-${item.id}"
            value="${escapeHTML(item.title || "")}"
            type="text"
          >
        </div>


        <div class="form-group">
          <label>Category</label>
          <input
            id="resource-category-${item.id}"
            value="${escapeHTML(item.category || "")}"
            type="text"
            placeholder="Scholarships / STEM / Leadership"
          >
        </div>


        <div class="form-group full">
          <label>Description</label>
          <textarea
            id="resource-description-${item.id}"
          >${escapeHTML(item.description || "")}</textarea>
        </div>


        <div class="form-group">
          <label>Resource URL</label>
          <input
            id="resource-url-${item.id}"
            value="${escapeHTML(item.url || "")}"
            type="url"
            placeholder="https://..."
          >
        </div>


        <div class="form-group">
          <label>Display order</label>
          <input
            id="resource-order-${item.id}"
            value="${item.display_order ?? 0}"
            type="number"
          >
        </div>


        <div class="form-group full">

          <label>Image</label>

          <div class="image-upload">

            <div
              class="image-preview"
              id="resource-preview-${item.id}"
            >

              ${
                item.image_url
                  ? `<img src="${escapeHTML(item.image_url)}" alt="">`
                  : `<span class="image-preview-empty">No image</span>`
              }

            </div>


            <div class="file-upload">

              <input
                id="resource-image-${item.id}"
                type="file"
                accept="image/*"
              >

              <span class="file-upload-note">
                Optional resource image.
              </span>

            </div>

          </div>

        </div>


        <div class="form-group full">

          <div class="publish-row">

            <label class="publish-switch">

              <input
                id="resource-published-${item.id}"
                type="checkbox"
                ${item.published !== false ? "checked" : ""}
              >

              <span class="switch-track"></span>

            </label>

            <span class="publish-label">
              Published
            </span>

          </div>

        </div>

      </div>

    </article>

  `).join("");


  resources.forEach((resource) => {

    const input =
      $(`#resource-image-${resource.id}`);

    if (!input) return;

    input.addEventListener("change", (event) => {

      previewImage(
        event.target,
        `#resource-preview-${resource.id}`
      );

    });

  });

}


async function addResource() {

  const {
    error
  } = await supabaseClient
    .from("resources")
    .insert({
      title: "New resource",
      description: "",
      category: "",
      url: "",
      image_url: "",
      display_order: resources.length,
      published: true
    });

  if (error) {

    alert(error.message);

    return;
  }

  await loadResources();

}


async function saveResource(id) {

  const resource = resources.find(
    (item) => item.id === id
  );

  if (!resource) return;


  let imageUrl = resource.image_url || "";

  const file =
    $(`#resource-image-${id}`)?.files?.[0];


  try {

    if (file) {

      imageUrl = await uploadImage(
        file,
        "resources"
      );

    }


    const values = {

      title:
        $(`#resource-title-${id}`).value.trim(),

      description:
        $(`#resource-description-${id}`).value.trim(),

      category:
        $(`#resource-category-${id}`).value.trim(),

      url:
        $(`#resource-url-${id}`).value.trim(),

      image_url:
        imageUrl,

      display_order:
        Number($(`#resource-order-${id}`).value || 0),

      published:
        $(`#resource-published-${id}`).checked,

      updated_at:
        new Date().toISOString()

    };


    const {
      error
    } = await supabaseClient
      .from("resources")
      .update(values)
      .eq("id", id);


    if (error) {
      throw error;
    }


    await loadResources();

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Could not save resource."
    );

  }

}


async function deleteResource(id) {

  if (!confirm("Delete this resource?")) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("resources")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await loadResources();

}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function previewImage(input, previewSelector) {

  const file = input.files?.[0];

  if (!file) return;

  const preview = $(previewSelector);

  if (!preview) return;

  const reader = new FileReader();

  reader.onload = (event) => {

    preview.innerHTML = `
      <img
        src="${event.target.result}"
        alt="Image preview"
      >
    `;

  };

  reader.readAsDataURL(file);

}


/* =========================================================
   STORAGE UPLOAD
   ========================================================= */

async function uploadImage(file, folder) {

  if (!file) {
    throw new Error("No image selected.");
  }


  const extension =
    file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";


  const safeName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;


  const path =
    `${folder}/${safeName}`;


  const {
    error
  } = await supabaseClient
    .storage
    .from(BUCKET)
    .upload(
      path,
      file,
      {
        cacheControl: "3600",
        upsert: false
      }
    );


  if (error) {
    throw error;
  }


  const {
    data
  } = supabaseClient
    .storage
    .from(BUCKET)
    .getPublicUrl(path);


  return data.publicUrl;

}


/* =========================================================
   OVERVIEW
   ========================================================= */

function updateOverview() {

  const memberStat =
    impactStats.find(
      (item) =>
        String(item.label || "")
          .toLowerCase()
          .includes("community members")
    );

  const countryStat =
    impactStats.find(
      (item) =>
        String(item.label || "")
          .toLowerCase()
          .includes("countries")
    );


  $("#overview-members").textContent =
    memberStat
      ? `${memberStat.value ?? 0}${memberStat.suffix || ""}`
      : "—";


  $("#overview-countries").textContent =
    countryStat
      ? `${countryStat.value ?? 0}${countryStat.suffix || ""}`
      : "—";


  $("#overview-programs").textContent =
    programs.length;


  $("#overview-resources").textContent =
    resources.length;

}


/* =========================================================
   DATE
   ========================================================= */

function updateDashboardDate() {

  const element = $("#dashboard-date");

  if (!element) return;

  const date = new Date();

  element.textContent =
    date.toLocaleDateString(
      "en-NG",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


/* =========================================================
   SUPABASE AUTH STATE
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_OUT") {

      currentUser = null;

      showLogin();

    }

  }
);
