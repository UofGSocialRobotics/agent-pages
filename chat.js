// SETTINGS
var config = {
    broker : "wss://iot.eclipse.org/ws",
    main_topic : "UoGSR/ca/",
    topic_publish : "UoGSR/ca/Client/",
    topic_subscribe : "UoGSR/ca/Server_out/",  
    connection_message : "new client connected",
    reconnectTimeout : 2000,
};

var app_global = {
    resp_div : document.getElementById("response"),
    clientIP : false,
    server_disconnected : true,
    mqtt : false,
    clientID : false,
};


(function () {
    var Message;
    
    $(function () {
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
        // sendMessage('Hello Philip! :)');
        // setTimeout(function () {
        //     return sendMessage('Hi Sandy! How are you?');
        // }, 1000);
        // return setTimeout(function () {
        //     return sendMessage('I\'m fine, thank you!');
        // }, 2000);
    });
}.call(this));

function sendMessage(msg) {
    printMessage(msg,'right')
    return MQTTSendMessage(msg);
}

function getMessageText(){
    var $message_input;
    $message_input = $('.message_input');
    return $message_input.val();
};

function Message(arg) {
    this.text = arg.text, this.message_side = arg.message_side;
    this.draw = function (_this) {
        return function () {
            var $message;
            $message = $($('.message_template').clone().html());
            $message.addClass(_this.message_side).find('.text').html(_this.text);
            $('.messages').append($message);
            return setTimeout(function () {
                return $message.addClass('appeared');
            }, 0);
        };
    }(this);
    return this;
};

function printMessage(text,message_side) {
    console.log("in here")
    console.log(text)
    var $messages, message;
    if (text.trim() === '') {
        return;
    }
    $('.message_input').val('');
    $messages = $('.messages');
    message = new Message({
        text: text,
        message_side: message_side
    });
    message.draw();
    return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};

function deleteAll(string,to_delete){
    while(string.includes(to_delete)){
        string = string.replace(to_delete,"");
    }
    return string;
}

function updateTopicSubscribe(client_id){
    config.topic_subscribe += client_id;
}

function onConnect(){
    //Once a connection has been made, make a subsrcription and send a message
    console.log("Connected");
    MQTTSendMessage(config.connection_message);
    app_global.mqtt.subscribe(config.topic_subscribe)
}

function MQTTConnect(jsonip){
    app_global.clientIP = jsonip.ip;
    console.log("Connecting to "+config.broker);
    var tmp = deleteAll(app_global.clientIP,".");
    app_global.clientID = "c" + tmp; //+ new Date().getTime();
    updateTopicSubscribe(app_global.clientID)
    app_global.mqtt = new Paho.MQTT.Client(config.broker, app_global.clientID);
    app_global.mqtt.onMessageArrived = onMessageArrived;
    var options = { timeout: 30, onSuccess: onConnect,};
    app_global.mqtt.connect(options);
}


function MQTTSendMessage(msg){
    if (msg == ""){
        var txt = "<p>Your must write a message.</p>";
    }
    else{
        app_global.server_disconnected = true;
        setTimeout(server_not_connected_message, 5000);

        // Send message to broker
        var message = new Paho.MQTT.Message(app_global.clientID+": "+msg);
        message.destinationName = config.topic_publish;
        app_global.mqtt.send(message);
    }

    // resp_div.innerHTML = txt;

}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
  printMessage(message.payloadString,'left');
  app_global.server_disconnected = false;
}

function server_not_connected_message(){
    if (app_global.server_disconnected){
        var text = "It looks like our server is not connected and we can't answer your question.<br>We apologize for the inconvenience.";
        app_global.server_disconnected = false;
        printMessage(text,"left");
    }
}
