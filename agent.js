// SETTINGS
var BROKER = "wss://iot.eclipse.org/ws";
var MAIN_TOPIC = "UoGSocialRobotics/ConversationalAgent/"
var TOPIC_PUBLISH = MAIN_TOPIC+"Client/";
var TOPIC_SUBSCRIBE = MAIN_TOPIC + "Server_out/";
var resp_div = document.getElementById("response");

var mqtt;
var clientID;
var reconnectTimeout = 2000;
// var host = "broker.mqttdashboard.com";
// var host = "iot.eclipse.org"
// var port = 1883;

function updateTopicSubscribe(client_id){
	TOPIC_SUBSCRIBE += client_id;
}

function onConnect(){
	//Once a connection has been made, make a subsrcription and send a message
	console.log("Connected");
	var message = new Paho.MQTT.Message(clientID+": new client connected: ");
	message.destinationName = TOPIC_PUBLISH;
	mqtt.send(message);
	mqtt.subscribe(TOPIC_SUBSCRIBE)
}

function MQTTConnect(){
	console.log("Connecting to "+BROKER);
	clientID = "WebClient" + new Date().getTime();
	updateTopicSubscribe(clientID)
	mqtt = new Paho.MQTT.Client(BROKER, clientID);
	mqtt.onMessageArrived = onMessageArrived;
	var options = { timeout: 30, onSuccess: onConnect,};
	mqtt.connect(options);
}


function MQTTSendMessage(){
	//Get message
	var msg = document.getElementById("textfield").value;

	// Thank user for message
	var txt = "<p>Thanks for your message to the world.</p>";
	resp_div.innerHTML = txt;

	// Send message to broker
	var message = new Paho.MQTT.Message(clientID+": "+msg);
	message.destinationName = TOPIC_PUBLISH;
	mqtt.send(message);
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
  resp_div.innerHTML += "<br><p>"+message.payloadString+"</p>"
}
