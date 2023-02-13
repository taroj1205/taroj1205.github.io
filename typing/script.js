window.onload = function() {
    document.getElementById('username').value = localStorage.getItem('username');
    document.getElementById('password').value = localStorage.getItem('password');
};

// Check if the username and password match a stored database
function checkCredentials(username, password) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://taroj1205.pythonanywhere.com/check", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // If the username exists in the database and the password matches, continue
            if (xhr.responseText === "valid") {
                document.getElementById('player').innerText = "Player: " + username;
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
var form = document.querySelector('form');

// Add a submit event listener to the form
form.addEventListener('submit', (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the username and password input elements
    var input_username = document.querySelector('input[name="username"]');
    var input_password = document.querySelector('input[name="password"]');

    // Get the values of the inputs
    var username = input_username.value;
    var password = input_password.value;

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    // Check if the username and password match a stored database
    checkCredentials(username, password);
});


function start() {
    var num = 0;
    var request = new XMLHttpRequest();
    request.open("GET", "https://gist.githubusercontent.com/taroj1205/420c2e76184a47b18543c52ba229f510/raw/adcef62cf11593879be2ed1d715daeeca9bda7e5/dictionary.csv", true);
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var lines = this.responseText.split("\n");
            var randomLine = lines[Math.floor(Math.random() * lines.length)];
            var [en, ja] = randomLine.split(",");
            document.querySelector("#ja").innerHTML = ja;
            document.querySelector("#en").innerHTML = "<span style='color: white;'>" + en + "</span>";
            document.getElementById("game").style.display = "block";
            document.getElementById("startMenu").style.display = "none";
            document.getElementById("player").style.display = "block";
            document.getElementById("history").style.display = "block";

            getData();

            document.addEventListener("keypress", function(event) {
                var key = event.key;
                console.log(num,en[num],en,ja);

                if (num < en.length)
                {
                    if (key === en[num]) {
                        num++;
                        var typedOut = "<span style='color: grey;' id='typedOut'>" + en.substring(0, num) + "</span>";
                        var notYet = "<span style='color: #1fd755;' id='notYet'>" + en.substring(num) + "</span>";
                        document.querySelector("#en").innerHTML = typedOut + notYet;
                    }
                    else {
                        var typedOut = "<span style='color: grey;' id='typedOut'>" + en.substring(0, num) + "</span>";
                        var notYet = "<span style='color: #e06c75;' id='notYet'>" + en.substring(num) + "</span>";
                        document.querySelector("#en").innerHTML = typedOut + notYet;
                    }
                }
                if (en.length <= num) {
                    submitData(en, ja);
                    num = 0;
                    start();
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
function submitData(en, ja) {
    var xhr = new XMLHttpRequest();
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
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    var data = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&en=' + encodeURIComponent(en) + '&ja=' + encodeURIComponent(ja);
    xhr.send(data);
}

// Receive data
var isFirstData = true;

function getData() {
    var xhr = new XMLHttpRequest();
    var username = localStorage.getItem('username');
    xhr.open('GET', 'https://taroj1205.pythonanywhere.com/data/' + username, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (isFirstData) {
                for (var i = data.length - 1; i >= 0; i--) {
                    var item = data[i];
                    var p = document.createElement('p');
                    p.innerHTML = item.english + ': ' + item.japanese;
                    document.getElementById('history').appendChild(p);
                }
                isFirstData = false;
            } else {
                var latestData = data[data.length - 1];
                var p = document.createElement('p');
                p.innerHTML = latestData.english + ': ' + latestData.japanese;
                document.getElementById('history').insertBefore(p, document.getElementById('history').firstChild);
            }
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    xhr.send();
}
