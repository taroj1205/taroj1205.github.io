window.onload = function() {
    document.getElementById('username').value = localStorage.getItem('username');
};

document.addEventListener("keydown", function(event) {
    var key = event.key;
    if (key == "Enter") {
        var form = document.querySelector("form[name='enter_username']");
        form.dispatchEvent(new Event("submit"));
    }
});

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
  start();
});

function start() {
    let num = 0;
    const request = new XMLHttpRequest();
    request.open("GET", "https://gist.githubusercontent.com/taroj1205/420c2e76184a47b18543c52ba229f510/raw/adcef62cf11593879be2ed1d715daeeca9bda7e5/dictionary.csv", true);
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const lines = this.responseText.split("\n");
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            const [en, ja] = randomLine.split(",");
            document.querySelector("#ja").innerHTML = ja;
            document.querySelector("#en").innerHTML = "<span style='color: white;'>" + en + "</span>";
            document.getElementById("game").style.display = "block";
            document.getElementById("startMenu").style.display = "none";

            document.addEventListener("keydown", function(event) {
                var key = event.key;
                console.log(num,en[num],en,ja);

                if (key == "Escape")
                {
                    document.getElementById("game").style.display = "none";
                    document.getElementById("player").style.display = "none";
                    document.getElementById("startMenu").style.display = "flex";
                    return;
                }
                if (key == "Alt")
                {
                    return;
                }
                if (num < en.length)
                {
                    if (key === en[num]) {
                        num++;
                        const typedOut = "<span style='color: grey;'>" + en.substring(0, num) + "</span>";
                        const notYet = "<span style='color: #1fd755;'>" + en.substring(num) + "</span>";
                        document.querySelector("#en").innerHTML = typedOut + notYet;
                    }
                    else {
                        const typedOut = "<span style='color: grey;'>" + en.substring(0, num) + "</span>";
                        const notYet = "<span style='color: #e06c75;'>" + en.substring(num) + "</span>";
                        document.querySelector("#en").innerHTML = typedOut + notYet;
                    }
                }
                if (num >= en.length) {
                    num = 0;
                    start();
                }
            });

        }
    };
    request.send();
}
