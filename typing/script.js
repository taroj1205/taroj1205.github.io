window.onload = function() {
    document.getElementById('username').value = localStorage.getItem('username');
    document.getElementById('password').value = localStorage.getItem('password');
};

// Check if the username and password match a stored database
function checkCredentials(username, password) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://taroj1205.pythonanywhere.com/check", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // If the username exists in the database and the password matches, continue
            if (xhr.responseText === "valid") {
                document.getElementById('player').innerText = "Player: " + username;
                getData();
                start();
            }
            // If the username exists but the password doesn't match, retry the form
            else {
                alert("Invalid username or password. Please try again.");
            }
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    xhr.send("username=" + username + "&password=" + password);
}

// Get the form element
const form = document.querySelector('form');

// Add a submit event listener to the form
form.addEventListener('submit', (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the username and password input elements
    const input_username = document.querySelector('input[name="username"]');
    const input_password = document.querySelector('input[name="password"]');

    // Get the values of the inputs
    const username = input_username.value;
    const password = input_password.value;

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    // Check if the username and password match a stored database
    checkCredentials(username, password);
});

var lines;
var currentWordEN;
var currentWordJA;

function newWord() {
    var randomLine = lines[Math.floor(Math.random() * lines.length)];
    var [en, ja] = randomLine.split(",");
    currentWordEN = en;
    currentWordJA = ja;

    document.querySelector("#ja").innerHTML = ja;
    document.querySelector("#en").innerHTML = "<span style='color: white;'>" + en + "</span>";
}


function start() {
    let num = 0;
    const request = new XMLHttpRequest();
    request.open("GET", "https://gist.githubusercontent.com/taroj1205/420c2e76184a47b18543c52ba229f510/raw/adcef62cf11593879be2ed1d715daeeca9bda7e5/dictionary.csv", true);
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            lines = this.responseText.split("\n");

            document.getElementById("game").style.display = "block";
            document.getElementById("startMenu").style.display = "none";
            document.getElementById("player").style.display = "block";
            document.getElementById("history").style.display = "block";
            document.getElementById("reset").style.display = "block";
            document.getElementById("words").style.display = "block";

            newWord();

            document.addEventListener("keypress", function(event) {
                let key = event.key;
                console.log(num, currentWordEN[num], currentWordEN, currentWordJA);

                if (key === currentWordEN[num]) {
                    num++;
                    const typedOut = "<span style='color: grey;' id='typedOut'>" + currentWordEN.substring(0, num) + "</span>";
                    const notYet = "<span style='color: #1fd755;' id='notYet'>" + currentWordEN.substring(num) + "</span>";
                    document.querySelector("#en").innerHTML = typedOut + notYet;

                    if (num >= currentWordEN.length) {
                        num = 0;
                        const p = document.createElement('p');
                        p.innerHTML = currentWordEN + ': ' + currentWordJA;
                        document.getElementById('history').insertBefore(p, document.getElementById('history').firstChild);
                        submitData(currentWordEN, currentWordJA);
                        newWord();
                    }
                }
                else {
                    const typedOut = "<span style='color: grey;' id='typedOut'>" + currentWordEN.substring(0, num) + "</span>";
                    const notYet = "<span style='color: #e06c75;' id='notYet'>" + currentWordEN.substring(num) + "</span>";
                    document.querySelector("#en").innerHTML = typedOut + notYet;
                }
            });

        }
        else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    request.send();
}

// Send data
function submitData(currentWordEN, currentWordJA) {
    let en = currentWordEN;
    let ja = currentWordJA;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://taroj1205.pythonanywhere.com', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log('Data submitted successfully');
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    const data = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&en=' + encodeURIComponent(en) + '&ja=' + encodeURIComponent(ja);
    xhr.send(data);
    document.querySelector("#words").innerHTML = "Words: " + document.getElementById("history").getElementsByTagName("p").length;
}

// Receive data
function getData() {
    const xhr = new XMLHttpRequest();
    const username = localStorage.getItem('username');
    xhr.open('GET', 'https://taroj1205.pythonanywhere.com/data/' + username, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            for (let i = data.length - 1; i >= 0; i--) {
                const item = data[i];
                const p = document.createElement('p');
                p.innerHTML = item.english + ': ' + item.japanese;
                document.getElementById('history').appendChild(p);
                document.querySelector("#words").innerHTML = "Words: " + document.getElementById("history").getElementsByTagName("p").length;
            }
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    xhr.send();
}

function resetHistory() {
    let password = prompt("Please enter your password to reset history:");
    let username = document.getElementById('player').innerText.split(': ')[1];
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://taroj1205.pythonanywhere.com/reset", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // If the password matches, delete the database
            if (xhr.responseText === "valid") {
                alert("History has been reset.");
                document.getElementById('history').innerHTML = "";
            }
            // If the password doesn't match, retry the form
            else {
                alert("Invalid password. Please try again.");
            }
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    xhr.send("username=" + username + "&password=" + password);
    getData();
}
