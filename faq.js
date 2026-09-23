/* ========================================
   GIRLS UNPLUGGED
   FAQ JAVASCRIPT
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const faqItems =
    document.querySelectorAll(".faq-item");


  /* ======================================
     STOP IF THERE ARE NO FAQ ITEMS
  ====================================== */

  if (faqItems.length === 0) {
    return;
  }


  /* ======================================
     FAQ ACCORDION
  ====================================== */

  faqItems.forEach((item) => {

    const question =
      item.querySelector(".faq-question");

    const answer =
      item.querySelector(".faq-answer");


    if (!question || !answer) {
      return;
    }


    /* --------------------------------------
       INITIAL ACCESSIBILITY STATE
    -------------------------------------- */

    question.setAttribute(
      "aria-expanded",
      "false"
    );


    answer.setAttribute(
      "aria-hidden",
      "true"
    );


    /* --------------------------------------
       CLICK
    -------------------------------------- */

    question.addEventListener(
      "click",
      () => {

        const isOpen =
          item.classList.contains("active");


        /*
          Close every other FAQ first.
          This keeps the section clean.
        */

        faqItems.forEach((otherItem) => {

          if (otherItem !== item) {

            otherItem.classList.remove(
              "active"
            );


            const otherQuestion =
              otherItem.querySelector(
                ".faq-question"
              );


            const otherAnswer =
              otherItem.querySelector(
                ".faq-answer"
              );


            if (otherQuestion) {

              otherQuestion.setAttribute(
                "aria-expanded",
                "false"
              );

            }


            if (otherAnswer) {

              otherAnswer.setAttribute(
                "aria-hidden",
                "true"
              );

            }

          }

        });


        /* ----------------------------------
           TOGGLE CURRENT ITEM
        ---------------------------------- */

        if (isOpen) {

          item.classList.remove("active");

          question.setAttribute(
            "aria-expanded",
            "false"
          );

          answer.setAttribute(
            "aria-hidden",
            "true"
          );

        } else {

          item.classList.add("active");

          question.setAttribute(
            "aria-expanded",
            "true"
          );

          answer.setAttribute(
            "aria-hidden",
            "false"
          );

        }

      }
    );


    /* --------------------------------------
       KEYBOARD SUPPORT
    -------------------------------------- */

    question.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          question.click();

        }

      }
    );

  });

});