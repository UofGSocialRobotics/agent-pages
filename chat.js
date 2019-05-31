//--------------------------------------------------------------------------------------------------------------//
//--------                                           CONFIGURATION                                      --------//
//--------------------------------------------------------------------------------------------------------------//

var config = {
    broker : "wss://iot.eclipse.org/ws",
    main_topic : "UoGSR/ca/",
    topic_publish : "UoGSR/ca/Client/",
    topic_subscribe : "UoGSR/ca/Server_out/",  
    connection_message : "new client connected",
    confirmed_connection_message : "Connection confirmed",
    disconnection_message : "ERROR, you were disconnected. Start session again by refreshing page.",
    turn_by_turn : true,
};

//--------------------------------------------------------------------------------------------------------------//
//--------                                         CLASS DEFINITION                                     --------//
//--------------------------------------------------------------------------------------------------------------//

function getTimestamp(){
    return Math.floor(Date.now() / 1000);
}

class Timer {
    constructor(){
        this.started = false;
        this.started_at = 0;
    }

    init(){
        this.started = true;
        if (this.started_at == 0){
            this.started_at = getTimestamp();
        }
    }

    stop(){
        this.started = false;
        this.started_at = 0;
    }

    get timeElapsed(){
        if (this.started){
            return (getTimestamp() - this.started_at);
        } else {
            return 0;
        }
    }
};

//--------------------------------------------------------------------------------------------------------------//
//--------                                         GLOBAL VARIABLES                                     --------//
//--------------------------------------------------------------------------------------------------------------//

var app_global = {
    agent_name : "Cora",
    connection_timeout : 5,
    error : false,
    resp_div : document.getElementById("response"),
    clientIP : false,
    // server_disconnected : true,
    // last_message_send_at : getTimestamp(),
    disconnection_timer : new Timer(),
    mqtt : false,
    clientID : false,
    css_elm : document.getElementById("error_css"),
    css_val : {
        error : "error.css",
        no_error : "avatar.css",
    },
    user_wait : false,
    user_input_placeholder_val : {
        can_type : "Type your message here...",
        wait_for_agent_answer : "Wait for AGENTNAME's answer",
        server_down : "Our server is disconnected, you cannot chat with AGENTNAME",
        client_disconnected : "You were disconnected, you cannot chat with AGENTNAME",
    },
};


//--------------------------------------------------------------------------------------------------------------//
//--------                                           ON LOAD                                            --------//
//--------------------------------------------------------------------------------------------------------------//



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
        setTimeout(function() {
            app_global.css_elm.setAttribute("href",app_global.css_val.no_error);
        }, 10)
        // sendMessage('Hello Philip! :)');
        // setTimeout(function () {
        //     return sendMessage('Hi Sandy! How are you?');
        // }, 1000);
        // return setTimeout(function () {
        //     return sendMessage('I\'m fine, thank you!');
        // }, 2000);
    });
}.call(this));



function set_agent_name(){
    var tab_title =  document.getElementById("tab_title");
    tab_title.innerHTML = "Chat with " + app_global.agent_name;
    var chat_title =  document.getElementById("chat_title");
    chat_title.innerHTML = "Chat with " + app_global.agent_name;
    app_global.user_input_placeholder_val.wait_for_agent_answer = app_global.user_input_placeholder_val.wait_for_agent_answer.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.server_down = app_global.user_input_placeholder_val.server_down.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.client_disconnected = app_global.user_input_placeholder_val.client_disconnected.replace("AGENTNAME",app_global.agent_name);
}
set_agent_name();


//--------------------------------------------------------------------------------------------------------------//
//--------                                           CHAT METHODS                                       --------//
//--------------------------------------------------------------------------------------------------------------//

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

function sendMessage(msg) {
    if (app_global.user_wait == false && msg!="" && app_global.error == false){
        printMessage(msg,'right')
        return MQTTSendMessage(msg);
    }
};

// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    app_global.disconnection_timer.stop();

    if (app_global.error == false){
        // app_global.server_disconnected = false;
        app_global.disconnection_timer.stop();

        if (message.payloadString != config.confirmed_connection_message){
            printMessage(message.payloadString,'left');        
        }
        if (message.payloadString == config.disconnection_message){
            app_global.css_elm.setAttribute("href",app_global.css_val.error);
            disable_user_input(app_global.user_input_placeholder_val.client_disconnected);
        }
        else{
            if (config.turn_by_turn){
                activate_user_input();
            }
        }
    }
    else {
        console.log("Error, will not print new messsage.")
    }
  // activate_user_input();
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                        DEAL WITH INTERFACE                                   --------//
//--------------------------------------------------------------------------------------------------------------//


function disable_user_input(placeholder_message){
    //disable text input and set placeholder
    var user_input_elm = document.getElementById("user_text_input");
    user_input_elm.setAttribute("style","font-style:italic");
    user_input_elm.setAttribute("placeholder",placeholder_message);
    user_input_elm.disabled = true;
    //disable send button
    var send_button = document.getElementById("send_message_button");
    send_button.classList.remove('send_message');
    send_button.classList.add('disable_send_message');
    app_global.user_wait = true;
}

function activate_user_input(){
    //activate textfield
    var user_input_elm = document.getElementById("user_text_input");
    user_input_elm.setAttribute("style","");
    user_input_elm.setAttribute("placeholder",app_global.user_input_placeholder_val.can_type);
    user_input_elm.disabled = false;
    //activate button
    var send_button = document.getElementById("send_message_button");
    send_button.classList.remove('disable_send_message');
    send_button.classList.add('send_message');
    app_global.user_wait = false;
}

function getMessageText(){
    var $message_input;
    $message_input = $('.message_input');
    return $message_input.val();
};


function printMessage(text,message_side) {
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

//--------------------------------------------------------------------------------------------------------------//
//--------                                       BROKER/MQTT COMMUNICATION                              --------//
//--------------------------------------------------------------------------------------------------------------//

function updateTopicSubscribe(client_id){
    config.topic_subscribe += client_id;
}

function onConnect(){
    //Once a connection has been made, make a subsrcription and send a message
    console.log("Connected");
    MQTTSendMessage(config.connection_message);
    app_global.mqtt.subscribe(config.topic_subscribe);
    // app_global.disconnection_timer.init();
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
    //Start disconnection timer
    // app_global.disconnection_timer.init();

    // if disconnection
    setTimeout(function server_not_connected_message(){
        console.log("time elapsed "+ app_global.disconnection_timer.timeElapsed.toString());
        console.log("Bool connection timed out: "+(app_global.disconnection_timer.timeElapsed > app_global.connection_timeout).toString());
        if (app_global.disconnection_timer.timeElapsed > app_global.connection_timeout){
            console.log("Server disconnected error");
            var text = "It looks like our server is not connected and we can't answer your question.<br>We apologize for the inconvenience.";
            printMessage(text,"left");
            app_global.css_elm.setAttribute("href",app_global.css_val.error);
            // app_global.last_message_send_at = getTimestamp();
            app_global.error = true;
            disable_user_input(app_global.user_input_placeholder_val.server_down);
        }
    }, app_global.connection_timeout * 1000 + 1000);

    // Send message to broker
    var message = new Paho.MQTT.Message(app_global.clientID+": "+msg);
    message.destinationName = config.topic_publish;
    app_global.mqtt.send(message);
    app_global.disconnection_timer.init();

    //Print in console
    console.log("Sending message: "+msg);

    // Disable user input
    if (msg != config.connection_message && config.turn_by_turn){
        disable_user_input(app_global.user_input_placeholder_val.wait_for_agent_answer);
    }
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                 LOACALHOST SERVER COMMUNICATION                              --------//
//--------------------------------------------------------------------------------------------------------------//

// var connection = new WebSocket('ws://html5rocks.websocket.org/echo', ['soap', 'xmpp']);

// // When the connection is open, send some data to the server
// connection.onopen = function () {
//   connection.send('Ping'); // Send the message 'Ping' to the server
// };

// // Log errors
// connection.onerror = function (error) {
//   console.log('WebSocket Error ' + error);
// };

// // Log messages from the server
// connection.onmessage = function (e) {
//   console.log('Server: ' + e.data);
// };
