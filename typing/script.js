window.onload = function() {
    document.getElementById('username').value = localStorage.getItem('username');
};

// Get the form element
const form = document.querySelector('form');

// Add a submit event listener to the form
form.addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the input element
  const input = document.querySelector('input[name="username"]');

  // Get the value of the input
  const username = input.value;

  // Save the username in local storage
  localStorage.setItem('username', username);

  document.getElementById('player').innerText = "Player: " + localStorage.getItem('username');

  const request = new XMLHttpRequest();
  request.open("GET", "https://raw.githubusercontent.com/taroj1205/taroj1205.github.io/main/typing/Files/dictionary.csv", true);
  request.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
          const lines = this.responseText.split("\n");
          const randomLine = lines[Math.floor(Math.random() * lines.length)];
          const [en, ja] = randomLine.split(",");
          document.querySelector("#ja").innerHTML = ja;
          document.querySelector("#en").innerHTML = en;
      }
  };
  request.send();

  document.getElementById("game").style.display = "block";
  document.getElementById("startMenu").style.display = "none";
});