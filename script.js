const navbarMenu = document.getElementById("menu");
const burgerMenu = document.getElementById("burger");
const headerMenu = document.getElementById("header");

// Open Close Navbar Menu on Click Burger
if (burgerMenu && navbarMenu) {
    burgerMenu.addEventListener("click", () => {
        burgerMenu.classList.toggle("is-active");
        navbarMenu.classList.toggle("is-active");
    });
}

// Close Navbar Menu on Click Menu Links
document.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", () => {
        burgerMenu.classList.remove("is-active");
        navbarMenu.classList.remove("is-active");
    });
});

// Change Header Background on Scrolling
window.addEventListener("scroll", () => {
    if (this.scrollY >= 85) {
        headerMenu.classList.add("on-scroll");
    } else {
        headerMenu.classList.remove("on-scroll");
    }
});


let jaContent = document.querySelector('#ja_content');
let enContent = document.querySelector('#en_content');
let jaTo = document.querySelector('#ja_to');
let enTo = document.querySelector('#en_to');

window.onload = function() {
  var switchEl = document.querySelector('.switch input');
  var language = navigator.language || navigator.languages[0];
  if (language === "ja") {
    switchEl.checked = false;
    jaContent.style.display = 'block';
    enContent.style.display = 'none';
    jaTo.style.display = 'block';
    enTo.style.display = 'none';
  } else {
    switchEl.checked = true;
    jaContent.style.display = 'none';
    enContent.style.display = 'block';
    jaTo.style.display = 'none';
    enTo.style.display = 'block';
  }
  switchEl.addEventListener('change', e => {
    jaContent.style.display = e.target.checked ? 'none' : 'block';
    enContent.style.display = e.target.checked ? 'block' : 'none';
    jaTo.style.display = e.target.checked ? 'none' : 'block';
    enTo.style.display = e.target.checked ? 'block' : 'none';
  });
}