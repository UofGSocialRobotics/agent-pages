# agent-pages

This repo is part of the Cora (Conversation Rapport-building Agent) project, which objective is to build a conversational agent. This is the client part of the project.


## Running the client	


The client has two ways to connect to the server, and chooses automatically which way to use:
* if the client is running fron the web (i.e. not on localhost), it uses a ___public broker___.
* if the client is running on localhost, it uses ___websockets___. Websockets are faster and smore reliable than using a public broker.

To run the client on localhost:
* download or clone this repo.
* open `index.html` in a browser.

Even when running the client on localhost, you can force the client to connect to the server via a public broker. To do so, in `chat.js`, set `app_global.use_broker` to `false`:
```javascript
var app_global = {
    ...
    use_broker : false,
    ...
}
````

Acces the client running on the web here: https://uofgsocialrobotics.github.io/agent-pages/.


___Note:___ All tests were run on the Chome browser.