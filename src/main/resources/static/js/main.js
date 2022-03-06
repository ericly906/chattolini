'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');

var privateMessageArea = document.querySelector('#privateMessageArea');

var connectingElement = document.querySelector('.connecting');

var registrationForm = document.querySelector('#registrationForm');

var stompClient = null;
var username = null;
var pw = null;
var newUser = null;
var newPsw = null;

var messageCount = 0;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result;
}

function togglePopUp(id) {
  if (document.getElementById(id).style.display == "block") {
    document.getElementById(id).style.display = "none";
  } else {
    document.getElementById(id).style.display = "block";
  }
}

function register(event) {
    newUser = document.querySelector('#newUser').value.trim();
    newPsw = document.querySelector('#psw').value.trim();
    var randEmail = makeid(6) + '@' + makeid(6) + ".com"
    const myJSON = {"username": newUser, "email": randEmail, "password": newPsw, "role": ["user"]};
    fetch("https://chattolini.herokuapp.com/api/auth/signup", {method: 'POST', body: JSON.stringify(myJSON), headers: {'Content-type': 'application/json; charset=UTF-8'}})
    .then(response => response.json())
    .then(json => {console.log(json);})
    .then(location.href = 'https://chattolini.herokuapp.com/');
    event.preventDefault();
}


function connect(event) {
    username = document.querySelector('#name').value.trim();
    pw = document.querySelector('#pw').value.trim();
    const signinJSON = {"username": username, "password": pw};
    fetch("https://chattolini.herokuapp.com/api/auth/signin", {method: 'POST', body: JSON.stringify(signinJSON), headers: {'Content-type': 'application/json; charset=UTF-8'}})
    .then((response) => {
        if (response.ok) {
            console.log(response.accessToken);
            var req = new XMLHttpRequest();
            req.open('GET', "https://chattolini.herokuapp.com/api/auth/signin", true);
            req.setRequestHeader('Authorization', 'Bearer' + response.accessToken);
            if(username) {
                usernamePage.classList.add('hidden');
                chatPage.classList.remove('hidden');
        
                var socket = new SockJS("/eric");
                stompClient = Stomp.over(socket);
        
                stompClient.connect({}, onConnected, onError);
            }
        } else {
            alert('Bad credentials');
            throw new Error('Bad credentials');
        }
    })
    .catch((error) => {console.log(error);});
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.register",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}

//var userDM = null;

/**
function onPrivateConnected(userDM) {
    stompClient.subscribe('/topic/' + userDM, onPrivateMessageReceived);
}
**/


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function send(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var usernameElement = document.createElement('span');
        var currentTime = new Date().toLocaleTimeString();
        var usernameText = document.createElement("usernameText");
        if (message.sender == username) {
            usernameText.innerHTML = "<input type='button' value=" + message.sender + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + currentTime + " onclick='togglePopUp(" + messageCount + ")' style='background: none;border: none;padding: 0;text-decoration: underline;cursor: pointer;font-size: 18px;font-weight: 600;color: #cfcfcf;'/><div class='popup' id= " + messageCount + " style='display: none'><input type='button' class='close' value=&times; onclick='togglePopUp(" + messageCount + ")'/>" + message.sender + "</div>";
        } else {
            usernameText.innerHTML = "<input type='button' value=" + message.sender + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + currentTime + " onclick='togglePopUp(" + messageCount + ")' style='background: none;border: none;padding: 0;text-decoration: underline;cursor: pointer;font-size: 18px;font-weight: 600;color: #cfcfcf;'/><div class='popup' id= " + messageCount + " style='display: none'><input type='button' class='close' value=&times; onclick='togglePopUp(" + messageCount + ")'/>" + message.sender + "<button class='dm'>Direct Message</button></div>";
        }
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
        messageCount += 1;
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

/**
function onPrivateMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement('li');
    messageElement.classList.add('chat-message');
    var usernameElement = document.createElement('span');
    var currentTime = new Date().toLocaleTimeString();
    var usernameText = document.createTextNode(message.sender + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + currentTime);
    usernameElement.appendChild(usernameText);
    messageElement.appendChild(usernameElement);
    //need to make private messaging area
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);
    privateMessageArea.appendChild(messageElement);
    privateMessageArea.scrollTop = privateMessageArea.scrollHeight;
}
**/


if (usernameForm) {
    usernameForm.addEventListener('submit', connect, true)
}
if (messageForm){
    messageForm.addEventListener('submit', send, true)
}
if (registrationForm) {
    registrationForm.addEventListener('submit', register, true)
}
