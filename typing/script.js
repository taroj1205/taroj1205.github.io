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

  const lines = [
      "english,japanese",
      "hello,こんにちは",
      "goodbye,さようなら",
      "yes,はい",
      "no,いいえ"
  ];

  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  const [en, ja] = randomLine.split(",");
  document.querySelector("#game").innerHTML = `<h1>${ja}</h1>\n<h1>${en}</h1>`;

  document.getElementById("game").style.display = "block";
  document.getElementById("startMenu").style.display = "none";
});