/* ========================================
   GIRLS UNPLUGGED
   NAVIGATION JAVASCRIPT
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const menuToggle =
    document.querySelector(".menu-toggle");

  const mobileMenu =
    document.querySelector(".mobile-menu");

  const menuLinks =
    document.querySelectorAll(".mobile-menu a");

  const desktopLinks =
    document.querySelectorAll(".nav-links a");


  /* ======================================
     CHECK ELEMENTS
  ====================================== */

  if (!menuToggle || !mobileMenu) {
    return;
  }


  /* ======================================
     OPEN / CLOSE MENU
  ====================================== */

  function openMenu() {

    mobileMenu.classList.add("active");

    menuToggle.classList.add("active");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    document.body.classList.add(
      "menu-open"
    );

  }


  function closeMenu() {

    mobileMenu.classList.remove("active");

    menuToggle.classList.remove("active");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "menu-open"
    );

  }


  function toggleMenu() {

    const isOpen =
      mobileMenu.classList.contains("active");


    if (isOpen) {

      closeMenu();

    } else {

      openMenu();

    }

  }


  /* ======================================
     MENU BUTTON
  ====================================== */

  menuToggle.addEventListener(
    "click",
    toggleMenu
  );


  /* ======================================
     MOBILE MENU LINKS
  ====================================== */

  menuLinks.forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        closeMenu();

      }
    );

  });


  /* ======================================
     ESCAPE KEY
  ====================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        mobileMenu.classList.contains("active")
      ) {

        closeMenu();

        menuToggle.focus();

      }

    }
  );


  /* ======================================
     CLICK OUTSIDE MENU
  ====================================== */

  document.addEventListener(
    "click",
    (event) => {

      const clickedInsideMenu =
        mobileMenu.contains(event.target);

      const clickedToggle =
        menuToggle.contains(event.target);


      if (
        mobileMenu.classList.contains("active") &&
        !clickedInsideMenu &&
        !clickedToggle
      ) {

        closeMenu();

      }

    }
  );


  /* ======================================
     ACTIVE PAGE LINK
  ====================================== */

  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  const pageName =
    currentPage === ""
      ? "index.html"
      : currentPage;


  const allNavigationLinks =
    document.querySelectorAll(
      ".nav-links a, .mobile-menu a"
    );


  allNavigationLinks.forEach((link) => {

    const href =
      link.getAttribute("href");


    if (!href) {
      return;
    }


    const cleanHref =
      href.split("#")[0];


    if (
      cleanHref === pageName ||
      (
        pageName === "index.html" &&
        (
          cleanHref === "" ||
          cleanHref === "/"
        )
      )
    ) {

      link.classList.add("active");

    }

  });


  /* ======================================
     CLOSE MENU WHEN RESIZING
  ====================================== */

  window.addEventListener(
    "resize",
    () => {

      if (
        window.innerWidth > 900 &&
        mobileMenu.classList.contains("active")
      ) {

        closeMenu();

      }

    }
  );

});