// SETTINGS
var BROKER = "ws://iot.eclipse.org/ws";
var TOPIC = "UoGSocialRobotics/ConversationalAgent/m_ASR";

var mqtt;
var clientID;
var reconnectTimeout = 2000;
// var host = "broker.mqttdashboard.com";
// var host = "iot.eclipse.org"
// var port = 1883;

function onConnect(){
	//Once a connection has been made, make a subsrcription and send a message
	console.log("Connected");
	var message = new Paho.MQTT.Message(clientID+": new client connected: ");
	message.destinationName = TOPIC;
	mqtt.send(message);
}

function MQTTConnect(){
	console.log("Connecting to "+BROKER);
	clientID = "UofGConversationalAgent" + new Date().getTime();
	mqtt = new Paho.MQTT.Client(BROKER, clientID);
	var options = { timeout: 30, onSuccess: onConnect,};
	mqtt.connect(options);
}


function MQTTSendMessage(){
	//Get message
	var msg = document.getElementById("textfield").value;

	// Thank user for message
	var resp_div = document.getElementById("response");
	var txt = "<p>Thanks for your message to the world.</p>";
	resp_div.innerHTML = txt;

	// Send message to broker
	var message = new Paho.MQTT.Message(clientID+": "+msg);
	message.destinationName = TOPIC;
	mqtt.send(message);
}
