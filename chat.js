// SETTINGS
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

var app_global = {
    agent_name : "Cora",
    connection_timeout : 20000,
    error : false,
    resp_div : document.getElementById("response"),
    clientIP : false,
    server_disconnected : true,
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
    if (app_global.user_wait == false && msg!="" && app_global.error == false){
        printMessage(msg,'right')
        return MQTTSendMessage(msg);
    }
}

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
    app_global.mqtt.subscribe(config.topic_subscribe);
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
    app_global.server_disconnected = true;
    setTimeout(function server_not_connected_message(){
        if (app_global.server_disconnected){
            console.log("Server disconnected error");
            var text = "It looks like our server is not connected and we can't answer your question.<br>We apologize for the inconvenience.";
            printMessage(text,"left");
            app_global.css_elm.setAttribute("href",app_global.css_val.error);
            app_global.server_disconnected = false;
            app_global.error = true;
            disable_user_input(app_global.user_input_placeholder_val.server_down);
        }
    }, app_global.connection_timeout);

    // Send message to broker
    var message = new Paho.MQTT.Message(app_global.clientID+": "+msg);
    message.destinationName = config.topic_publish;
    app_global.mqtt.send(message);

    //Print in console
    console.log("Sending message: "+msg);

    // Disable user input
    if (msg != config.connection_message && config.turn_by_turn){
        disable_user_input(app_global.user_input_placeholder_val.wait_for_agent_answer);
    }
}



// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    if (app_global.error == false){
        app_global.server_disconnected = false;
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

