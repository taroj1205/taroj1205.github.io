gameText = document.getElementById("game");
startMenuText = document.getElementById("startMenu");
playerText = document.getElementById("player");
historyText = document.getElementById("history");
resetText = document.getElementById("reset");
wordsText = document.getElementById("words");
usernameText = document.getElementById('username');
passwordText = document.getElementById('password');
uploadCSVButton = document.getElementById('upload-csv');
menuToggle = document.getElementById("menu-toggle");
historyMenu = document.getElementById("history-menu");
historyMenuButton = document.getElementById("menu-toggle");
submitButton = document.getElementById("username-submit");
scrollToTopButton = document.getElementById("scroll-to-top-button");
usernameInput = document.querySelector("#username");
passwordInput = document.querySelector("#password");
switchFurigana = document.querySelector(".switch input");
enInput = document.getElementById("en-input")

num = 0;

var switchEl = document.querySelector('.switch input');

window.onload = function() {
    usernameText.value = localStorage.getItem('username');
    passwordText.value = localStorage.getItem('password');
    if (window.matchMedia("(min-width: 800px)").matches || !usernameText) {
        usernameInput.focus();
    }
    else if (!passwordText)
    {
        passwordInput.focus();
    }

    var furiganaSettings = localStorage.getItem("furiganaSettings");
    if (furiganaSettings)
    {
        if (furiganaSettings === "off") {
        switchEl.checked = true;
        localStorage.setItem("off", furiganaSettings);
        } if (furiganaSettings === "on") {
            switchEl.checked = false;
            localStorage.setItem("on", furiganaSettings);
        }
        console.log("furigana settings:", furiganaSettings);
    } if (!furiganaSettings)
    {
        localStorage.setItem("furiganaSettings", "off");
        switchEl.checked = true;
    }
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
                submitButton.disabled = false;
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

    submitButton.disabled = true;

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
    if (randomLine === 0)
    {
        randomLine++;
    }
    var [en, ja] = randomLine.split(",");
    currentWordEN = en;
    currentWordJA = ja;

    if (localStorage.getItem("furiganaSettings") === "on")
    {
        const words = ja.match(/[\p{Script=Han}]+/ug);
        if (words)
        {
            furigana(ja);
        }
    }

    document.querySelector("#ja").innerHTML = ja;
    document.querySelector("#en").innerHTML = "<span style='color: white;'>" + en + "</span>";
}

// Check if the username and password match a stored database
function furigana(ja) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://taroj1205.pythonanywhere.com/furigana", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                displayFurigana(response);
            } else {
                document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
            }
        }
    };
    xhr.send("word=" + encodeURIComponent(ja));
}

function displayFurigana(response) {
    console.log(response);
    document.querySelector("#ja").innerHTML = response;
}

function start() {
    let num = 0;
    let csv = localStorage.getItem('csv'); // get the CSV from local storage
    removeContainer();
    if (csv) {
        lines = csv.split("\n");
        game(lines,num);
    }
    else {
        // If CSV is not provided by user, use the default
        const request = new XMLHttpRequest();
        request.open("GET", 'https://gist.githubusercontent.com/taroj1205/420c2e76184a47b18543c52ba229f510/raw/adcef62cf11593879be2ed1d715daeeca9bda7e5/dictionary.csv', true);
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                lines = this.responseText.split("\n");
                localStorage.setItem('csv', this.responseText); // store the CSV in local storage
                game(lines,num);
            }
        else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
        };
        request.send();
    }
}

function game(lines,num)
{
    gameText.style.display = "inline-block";
    startMenuText.style.display = "none";
    playerText.style.display = "inline-block";
    resetText.style.display = "inline-block";
    wordsText.style.display = "inline-block";
    uploadCSVButton.style.display = "none";

    enInput.focus();

    document.querySelector('body').classList.add('run');

    newWord();

    enInput.addEventListener("input", function(event) {
        if (event.inputType === "insertText") {
            let key = event.data;
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
        }
        else {
            return;
        }
    });
}

// Send data
function submitData(currentWordEN, currentWordJA) {
    let en = currentWordEN;
    let ja = currentWordJA;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://taroj1205.pythonanywhere.com/', true);
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
    document.querySelector("#words").innerHTML = "Words: " + historyText.getElementsByTagName("p").length;
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
                document.querySelector("#words").innerHTML = "Words: " + historyText.getElementsByTagName("p").length;
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
    if (password === null) {
        return;
    }
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
}

function openFilePicker() {
    // toggle the start menu
    startMenuText.style.display = (startMenuText.style.display === "flex") ? "none" : "flex";
    uploadCSVButton.style.display = (uploadCSVButton.style.display === "block") ? "none" : "block";

    if (!document.getElementById('csv')) {
        // create the file picker elements
        const input = document.createElement('textarea');
        input.rows = 10;
        input.cols = 50;
        input.style.width = '60vw';
        input.style.height = '50vh';
        input.value = localStorage.getItem('csv');
        input.placeholder = 'Paste CSV here...\nExample:\na,あ\ni,い';

        const submit = document.createElement('button');
        submit.innerText = 'Submit';
        submit.onclick = function() {
            // process the submitted CSV
            const csv = input.value.trim();
            if (csv.length == 0) {
                if (confirm("Are you sure you want to reset the CSV?")) {
                    localStorage.removeItem('csv');
                    alert('Done a csv reset!');
                    removeContainer();
                }
            } else {
                const lines = csv.split('\n');
                const firstLine = lines[0].trim();
                const lastLine = lines[lines.length - 1].trim();
                const numColsFirstLine = firstLine.split(',').length;
                const numColsLastLine = lastLine.split(',').length;
                if (numColsFirstLine > 1 && numColsFirstLine === numColsLastLine) {
                    localStorage.setItem('csv', csv); // store the CSV in local storage
                    alert('CSV file saved to local storage! ' + csv);
                    removeContainer();
                } else {
                    alert('The input is not a valid CSV file!\nExample:\na,あ\ni,い');
                }
            }
        };

        const cancel = document.createElement('button');
        cancel.innerText = 'Cancel';
        cancel.onclick = function() {
            removeContainer();
        };

        // create the container element
        const container = document.createElement('div');
        container.id = 'csv'; // add "csv" class to the container element
        container.style.position = 'absolute';
        container.appendChild(input);
        container.appendChild(document.createElement("br"));
        container.appendChild(submit);
        container.appendChild(cancel);
        document.body.appendChild(container);
    }

    function removeContainer() {
        // remove the file picker elements
        const container = document.getElementById('csv');
        container.parentNode.removeChild(container);

        // toggle the start menu display
        startMenuText.style.display = (startMenuText.style.display === "none") ? "flex" : "none";
        uploadCSVButton.style.display = (uploadCSVButton.style.display === "none") ? "block" : "none";
    }
}


const removeContainer = () => {
    const container = document.getElementById('csv');
    if (container)
    {
        container.remove();
    }
};

menuToggle.addEventListener("click", function() {
    historyMenu.style.display = (historyMenu.style.display === "inline-block") ? "none" : "inline-block";
    enInput.style.display = (enInput.style.display === "block") ? "none" : "block";
    if (enInput.style.display === "block")
        {
            enInput.focus();
            console.log("Focus changed!");
        }
});

switchFurigana.addEventListener('change', e => {
    console.log("buttonc lcikcckceck");
    let set = e.target.checked ? 'off' : 'on';
    localStorage.setItem("furiganaSettings", set);
    switchEl.checked = !!e.target.checked;
});

document.addEventListener("keydown", function(event) {
    enInput.focus();
    enInput.value += event.key;
    var inputEvent = new InputEvent('input', {bubbles: true});
    enInput.dispatchEvent(inputEvent);
});