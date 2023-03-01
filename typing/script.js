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
main = document.getElementById("main");

num = 0;

var switchEl = document.querySelector('.switch input');

window.onload = function() {
    uploadCSVButton.style.display = "none";
    usernameText.value = localStorage.getItem('username');
    passwordText.value = localStorage.getItem('password');
    if (window.matchMedia("(min-width: 800px)").matches) {
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

    if (!localStorage.getItem("defaultCSV"))
    {
        // If CSV is not provided by user, use the default
        const request = new XMLHttpRequest();
        request.open("GET", 'https://gist.githubusercontent.com/taroj1205/420c2e76184a47b18543c52ba229f510/raw/adcef62cf11593879be2ed1d715daeeca9bda7e5/dictionary.csv', true);
        request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                csv = this.responseText;
                localStorage.setItem('defaultCSV', csv);
            } else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
            }
        };
        request.send();
    }
};

// Check if the username and password match a stored database
function checkCredentials(username, password) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://172.25.238.211:5000/check", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // If the username exists in the database and the password matches, continue
            if (xhr.responseText === "valid") {
                document.getElementById('player').innerText = "Player: " + username;
                csv = localStorage.getItem('csv');
                console.log(username);
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
    getCSV();
    localStorage.getItem('csv');
    lines = csv.split("\n");
    console.log("csv:", lines);
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
    xhr.open("POST", "http://172.25.238.211:5000/furigana", true);
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
    getCSV();
    let csv = localStorage.getItem('csv'); // get the CSV from local storage
    uploadCSVButton.style.display = "block";
    removeContainer();
    if (csv) {
        game(num);
    }
}

function game(num)
{
    gameText.style.display = "inline-block";
    startMenuText.style.display = "none";
    playerText.style.display = "inline-block";
    resetText.style.display = "inline-block";
    wordsText.style.display = "inline-block";

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
    xhr.open('POST', 'http://172.25.238.211:5000/submit', true);
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
    const csvName = localStorage.getItem('csvName');
    const data = 'username=' + encodeURIComponent(username) + '&en=' + encodeURIComponent(en) + '&ja=' + encodeURIComponent(ja) + '&csvName=' + encodeURIComponent(csvName);
    xhr.send(data);
    document.querySelector("#words").innerHTML = "Words: " + historyText.getElementsByTagName("p").length;
}

function getData() {
    const xhr = new XMLHttpRequest();
    const username = localStorage.getItem('username');
    const csvName = localStorage.getItem('csvName');
    xhr.open('POST', 'http://172.25.238.211:5000/data', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            for (let i = data.length - 1; i >= 0; i--) {
                const item = data[i];
                const p = document.createElement('p');
                p.innerHTML = item.english + ': ' + item.japanese;
                document.getElementById('history').appendChild(p);
                document.querySelector("#words").innerHTML = "Words: " + historyText.getElementsByTagName("p").length;
            }
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 400) {
            const data = JSON.parse(xhr.responseText);
            console.log(data.error);
        }
        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
            document.querySelector('body').innerHTML = '<h1 style="text-align: center; font-size: 10vh;">Offline contact <a href="https://twitter.com/taroj1205">@taroj1205</a></h1>';
        }
    };
    const data = JSON.stringify({ 'username': username, 'csvName': csvName });
    xhr.send(data);
}

function resetHistory() {
    let password = prompt("Please enter your password to reset history:");
    let username = document.getElementById('player').innerText.split(': ')[1];
    if (password === null) {
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://172.25.238.211:5000/reset", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // If the password matches, delete the database
            if (xhr.responseText === "valid") {
                alert("History has been reset.");
                document.getElementById('history').innerHTML = "";
                document.getElementById('words').innerHTML = "Words: 0";
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

function getCSV() {
    const username = localStorage.getItem('username');
    const csvName = localStorage.getItem('csvName');
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const csvData = response.csvData;
          console.log(`Received CSV data: ${csvData}`);
          localStorage.setItem('csv', csvData);
        } else {
          alert('Error getting CSV file from Flask server!');
        }
      }
    };
    xhr.open('GET', `http://172.25.238.211:5000/get_csv?csvName=${csvName}&username=${username}`);
    xhr.send();
  }

function openFilePicker() {
    main.style.display = (main.style.display === "block") ? "block" : "none";
    enInput.style.display = (enInput.style.display === "block") ? "block" : "none";

    const input = document.createElement('textarea');
    input.rows = 10;
    input.cols = 50;
    input.style.width = '60vw';
    input.style.height = '50vh';
    input.value = '';
    input.placeholder = 'Paste CSV here...\nExample:\na,あ\ni,い';

    const submit = document.createElement('button');
    submit.innerText = 'Submit';
    submit.onclick = function() {
        const csv = input.value.trim();
        if (csv.length === 0) {
            if (confirm('Are you sure you want to reset the CSV?')) {
                localStorage.setItem('csvName', 'default');
                let defaultCSV = localStorage.getItem('defaultCSV');
                localStorage.setItem('csv', defaultCSV);
                sendCSVToFlask(csv, username);
                alert('CSV reset successful!');
                removeContainer();
            }
        } else {
            // process the submitted CSV
            let csvName = '';
            while (!csvName || csvName.toLowerCase() === 'default') {
                csvName = prompt('Please enter a name for the CSV file:');
                if (!csvName) {
                    alert('Invalid name. Please enter a different name.');
                } else if (csvName.toLowerCase() === 'default') {
                    alert('The name "default" is reserved. Please enter a different name.');
                } else {
                    sendCSVToFlask(csv, username);
                }
            }
            const lines = csv.split('\n');
            const firstLine = lines[0].trim();
            const lastLine = lines[lines.length - 1].trim();
            const numColsFirstLine = firstLine.split(',').length;
            const numColsLastLine = lastLine.split(',').length;
            if (numColsFirstLine > 1 && numColsFirstLine === numColsLastLine) {
                localStorage.setItem('csvName', csvName);
                localStorage.setItem('csv', csv); // store the CSV in local storage
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

    const useSaved = document.createElement('button');
    useSaved.innerText = 'Use Saved CSV';
    useSaved.onclick = async function() {
        const username = localStorage.getItem('username');
        let enteredName = '';
        const response = await fetch('http://172.25.238.211:5000/listCSVName', {
            method: 'POST',
            body: JSON.stringify({username: username}),
            headers: {'Content-Type': 'application/json'}
        });
        const csvNames = await response.json();
        console.log(csvNames);
        enteredName = prompt(`Please enter the name of the CSV file you want to use. Available options:\n${csvNames.join(',')}`);

        while (!csvNames.includes(enteredName)) {
            enteredName = prompt(`Could not find CSV with name "${enteredName}" in saved list.\nAvailable options:\n${csvNames.join(',')}`);
            if (csvNames.includes(enteredName)) {
                console.log("The name matches!");
                newWord();
                const history = document.getElementById('history');
                localStorage.setItem('csvName', enteredName);
                history.innerHTML = '';
                console.log("Cleared history display!");
                getData();
                removeContainer();
            }

            if (enteredName === null) {
                removeContainer();
                return;
            }
        }

        if (csvNames.includes(enteredName)) {
            console.log("The name matches!");
            localStorage.setItem('csvName', enteredName);
            const history = document.getElementById('history');
            history.innerHTML = '';
            console.log("Cleared history display!");
            newWord();
            removeContainer();
        }
        localStorage.setItem('csvName', enteredName);
        alert('CSV loaded successfully!');
        removeContainer();
    };

    // create the container element
    const container = document.createElement('div');
    container.id = 'csv'; // add "csv" class to the container element
    container.style.position = 'absolute';
    container.appendChild(input);
    container.appendChild(document.createElement('br'));
    container.appendChild(submit);
    container.appendChild(cancel);
    container.appendChild(useSaved);
    document.body.appendChild(container);
}



const removeContainer = () => {
    const container = document.getElementById('csv');
    if (container)
    {
        container.remove();
        main.style.display = (main.style.display === 'none') ? 'block' : 'none';
        enInput.style.display = (enInput.style.display === 'none') ? 'block' : 'none';
        enInput.focus();
    }
};

function sendCSVToFlask(csv, username) {
    const csvName = localStorage.getItem('csvName');
    console.log(username);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                return;
            } else {
                alert('Error sending CSV file to Flask server!');
            }
        }
    };
    xhr.open('POST', 'http://172.25.238.211:5000/upload_csv');
    xhr.setRequestHeader('Content-Type', 'application/json');
    const data = {
        csvName: csvName,
        csvData: csv,
        username: username
    };
    xhr.send(JSON.stringify(data));
}

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
