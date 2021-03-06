'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var registrationForm = document.querySelector('#registrationForm');

var stompClient = null;
var username = null;
var pw = null;
var newUser = null;
var newPsw = null;

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

function register(event) {
    newUser = document.querySelector('#newUser').value.trim();
    newPsw = document.querySelector('#psw').value.trim();
    var randEmail = makeid(6) + '@' + makeid(6) + ".com"
    const myJSON = {"username": newUser, "email": randEmail, "password": newPsw, "role": ["user"]};
    fetch("http://localhost:8080/api/auth/signup", {method: 'POST', body: JSON.stringify(myJSON), headers: {'Content-type': 'application/json; charset=UTF-8'}})
    .then(response => response.json())
    .then(json => {console.log(json);})
    .then(location.href = 'http://localhost:8080/');
    event.preventDefault();
}


function connect(event) {
    username = document.querySelector('#name').value.trim();
    pw = document.querySelector('#pw').value.trim();
    const signinJSON = {"username": username, "password": pw};
    fetch("http://localhost:8080/api/auth/signin", {method: 'POST', body: JSON.stringify(signinJSON), headers: {'Content-type': 'application/json; charset=UTF-8'}})
    .then((response) => {
        if (response.ok) {
            console.log(response.accessToken);
            var req = new XMLHttpRequest();
            req.open('GET', "http://localhost:8080/api/auth/signin", true);
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

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

if (usernameForm) {
    usernameForm.addEventListener('submit', connect, true)
}
if (messageForm){
    messageForm.addEventListener('submit', send, true)
}
if (registrationForm) {
    registrationForm.addEventListener('submit', register, true)
}
