//--------------------------------------------------------------------------------------------------------------//
//--------                                           CONFIGURATION                                      --------//
//--------------------------------------------------------------------------------------------------------------//

var config = {
    broker : "wss://iot.eclipse.org/ws", //"wss://mqtt.eclipse.org/ws",
    main_topic : "UoGSR/ca/",
    topic_publish : "UoGSR/ca/Client/",
    topic_subscribe : "UoGSR/ca/Server_out/",  
    connection_message : "new client connected",
    confirmed_connection_message : "Connection confirmed",
    amtinfo_ack : "ACK AMT_INFO",
    disconnection_message : "ERROR, you were disconnected. Start session again by refreshing page.",
    turn_by_turn : true,
	tts_activated : false,
    asr_activated : false,
};

//--------------------------------------------------------------------------------------------------------------//
//--------                                         ACCESS CHAT WINDOW                                   --------//
//--------------------------------------------------------------------------------------------------------------//
function accessChatWindow(tts_asr){
    var message_speech = document.getElementById("message_speech"); 
    var message_text = document.getElementById("message_text");
    if (tts_asr){
        config.tts_activated = true;
        config.asr_activated = true;
        console.log("Will be using TTS and ASR.");
        message_speech.style.display = "block";
        message_text.style.display = "none";
    }
    else{
        message_speech.style.display = "none";
        message_text.style.display = "block";
    }
    if(app_global.error){
        change_microphone_image("off");
    }
    var menu_page = document.getElementById("menu_page");
    menu_page.style.display = "none";
    var chat_window = document.getElementById("chat_window");
    chat_window.style.display = "block";


    setTimeout(function() {
        set_agent_name();
    }, 100)
    
}


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
    current_url : null,
    agent_name : "Cora",
    use_broker : true,
    socket : false,
    connection_timeout : 5,
    error : false,
    error_message_posted : false,
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
    amt_msg : {
        "amt_id" : null,
        "app_global.amt_msg" : null,
    },
};

app_global.current_url = window.location.pathname;
// console.log(current_url);

//--------------------------------------------------------------------------------------------------------------//
//--------                                           ON LOAD                                            --------//
//--------------------------------------------------------------------------------------------------------------//


(function () {
    var Message;
    
    $(function () {
        $('.send_message').click(function (e) {
            return send_chat();
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return send_chat();
            }
        });
        $('.amtid_input').keyup(function (e) {
            if (e.which === 13) {
                return send_amtid();
            }
        });
        setTimeout(function() {
            app_global.css_elm.setAttribute("href",app_global.css_val.no_error);
        }, 5)
        // sendMessage('Hello Philip! :)');
        // setTimeout(function () {
        //     return sendMessage('Hi Sandy! How are you?');
        // }, 1000);
        // return setTimeout(function () {
        //     return sendMessage('I\'m fine, thank you!');
        // }, 2000);
    });
}.call(this));

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function set_agent_name(){
    // console.log("set_agent_name");
    var title = "Chat with " + app_global.agent_name;
    var tab_title =  document.getElementById("tab_title");
    tab_title.innerHTML = title;
    if (is_chat()){
        var chat_title =  document.getElementById("chat_title");
        chat_title.innerHTML = title;
    }
    var menu_title =  document.getElementById("menu_title");
    menu_title.innerHTML = title;
    app_global.user_input_placeholder_val.wait_for_agent_answer = app_global.user_input_placeholder_val.wait_for_agent_answer.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.server_down = app_global.user_input_placeholder_val.server_down.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.client_disconnected = app_global.user_input_placeholder_val.client_disconnected.replace("AGENTNAME",app_global.agent_name);

    page = get_page();
    if (page=="intro.html" || page == "instructions.html"){
        var main_text =  document.getElementById("main_text").innerHTML;
        main_text = replaceAll(main_text,"AGENTNAME",app_global.agent_name);
        document.getElementById("main_text").innerHTML = main_text;
    }
}
set_agent_name();


//--------------------------------------------------------------------------------------------------------------//
//--------                                  WEBSITE NAVIGATION METHODS                                  --------//
//--------------------------------------------------------------------------------------------------------------//

function is_chat(){
    return app_global.current_url.includes("chat.html");
}

function get_page(){
    return app_global.current_url.split("/").pop();
}

function go_to_intro(){
    location.replace("intro.html")
}
function go_to_instructions(){
    location.replace("instructions.html")
}
function go_to_chat(){
    location.replace("chat.html")
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                          FORM METHODS                                        --------//
//--------              ----> stuffs to save for amt (ID, questionnaire answers, etc.)                  --------//
//--------------------------------------------------------------------------------------------------------------//

function check_amtid(id){
    //TODO
    if (id) return true;
    return false;
}

function send_amtid(){
    var id = document.getElementById("amtid_input").value;
    if (check_amtid(id)){
        app_global.amt_msg["amt_id"] = id;
        var msg = JSON.stringify(app_global.amt_msg);
        console.log(msg);
        res = send_message(msg);
    }
    else{
        alert("Enter your AMT ID.");
    }
}

//--------------------------------------------------------------------------------------------------------------//
//--------                            DECIDE IF USING WEBSOCKETS OR BORKER                              --------//
//-------- > Currently you can use websockets only when running the client and the server on localhost  --------//
//--------------------------------------------------------------------------------------------------------------//

// $(document).ready(function(){
function Connect(jsonip){
    switch(window.location.protocol) {
        case 'http:':
            app_global.use_broker = true;
            MQTTConnect(jsonip);
            break;
        case 'https:':
        //remote file over http or https
            app_global.use_broker = true;
            MQTTConnect(jsonip);
            break;
        case 'file:':
            if(app_global.use_broker==false){
                console.log("We re local - will not be using broker.");
                console.log("If you want to use the broker, set use_broker to true in app_global.");
                try{
                    init_websocket();
                }
                catch(err){
                    console.log("error");
                    console.log(err.message);
                    server_not_connected_message();
                }
            }
            else{
                MQTTConnect(jsonip);
            }
            break;
        default: 
            app_global.use_broker = true;
            MQTTConnect(jsonip);
    }
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                     WEBSOCKETS METHODS                                       --------//
//--------------------------------------------------------------------------------------------------------------//

function init_websocket(){
    app_global.socket = new WebSocket('ws://127.0.0.1:9000/');
    app_global.socket.onerror = function(event){
        app_global.error = true;
        server_not_connected_message();
    }
    app_global.socket.onopen = function(event){
        console.log("Web socket open");
        send_message_ws(config.connection_message);
    }
    app_global.socket.onmessage = function(event){
        console.log("Received message from python server (localhost):")
        console.log(event.data);
        handle_server_message(event.data);
    };
}

function isOpen(ws) { 
    return ws.readyState === ws.OPEN ;
}

function send_message_ws(msg){
    if (isOpen(app_global.socket)){
        app_global.socket.send(msg);
        return true;
    }
    else{
        app_global.error = true;
        server_not_connected_message();
        return false;
    }
}

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

function send_chat() {
    msg = getMessageText();
    if (app_global.user_wait == false && msg!="" && app_global.error == false){
        printMessage(msg,'right');
        res = send_message(msg);
        // Disable user input
        if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == false){
            disable_user_input(app_global.user_input_placeholder_val.wait_for_agent_answer);
        }
        else if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == true){
            change_microphone_image("off");
        }
        return res;
    }
};

function send_message(text){
    console.log("in send Message")
    var res = false;
    if (app_global.use_broker){
        res = MQTTSendMessage(text);
    }
    else{
        try{
            res = send_message_ws(msg);
        } catch(err) {
            app_global.error = true;
            server_not_connected_message();
        }
    }
}

// called when a message arrives
function handle_server_message(message) {
    // console.log("handle_server_message:"+message);
    app_global.disconnection_timer.stop();

    if (app_global.error == false){
        // app_global.server_disconnected = false;
        app_global.disconnection_timer.stop();
        if (get_page() == "chat.html") handle_chat_message(message);
        if (get_page() == "amtid.html" && config.amtinfo_ack == message) go_to_intro();
    }
    else {
        console.log("Error, will not print new messsage.")
    }
    
}

function handle_chat_message(message){
    if (message != config.confirmed_connection_message){
        var json_message = JSON.parse(message); 
        if (config.tts_activated) {
            var u = new SpeechSynthesisUtterance(json_message.sentence);
            u.onend = function (event) {
                change_microphone_image("wait");
            };
            window.speechSynthesis.speak(u);
        }
        printMessage(json_message.sentence,'left');  
        if (json_message.image){
            console.log(json_message.image);
            printMessage("<p style=\"text-align:center;\"><img src=\""+json_message.image+"\" width=\"50%\" /></p>",'left'+"");      
        }
        if (json_message.food_recipe){
            console.log(json_message.food_recipe);
            printMessage("<p style=\"text-align:center;\"><a target=\"_blank\" rel=\"noopener noreferrer\" href=\""+json_message.food_recipe+"\"> Click here to get the recipe </a></p>",'left'+"");                   
        }               
    }
    if (message == config.disconnection_message){
        app_global.css_elm.setAttribute("href",app_global.css_val.error);
        disable_user_input(app_global.user_input_placeholder_val.client_disconnected);
    }
    else{
        if (config.turn_by_turn && config.asr_activated == false){
            activate_user_input();
        }
        // else if (config.asr_activated){
        //     change_microphone_image("wait");
        // }
    }
    setFocusToTextBox();
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                        DEAL WITH INTERFACE                                   --------//
//--------------------------------------------------------------------------------------------------------------//
function setFocusToTextBox(){
    if (config.asr_activated == false){
        user_text_input = document.getElementById("user_text_input");
        user_text_input.focus();
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
    if (config.asr_activated == false){
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
}

function getMessageText(){
    if (config.asr_activated){
        return document.getElementById("transcript").value;
    }
    else{
        return document.getElementById("user_text_input").value;
    }
    // var $message_input;
    // $message_input = $('.message_input');
    // return $message_input.val();
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
    $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};

function deleteAll(string,to_delete){
    while(string.includes(to_delete)){
        string = string.replace(to_delete,"");
    }
    return string;
}

function server_not_connected_message(){
    console.log("time elapsed "+ app_global.disconnection_timer.timeElapsed.toString());
    console.log("Bool connection timed out: "+(app_global.disconnection_timer.timeElapsed > app_global.connection_timeout).toString());
    console.log("app_global.error: "+app_global.error.toString());
    if ((app_global.disconnection_timer.timeElapsed > app_global.connection_timeout || app_global.error) && !app_global.error_message_posted){
        setTimeout(function(){
            console.log("Server disconnected error");
            if (is_chat()) chat_error();
            else page_error();
        },10);
    }
}

function page_error(){
    var text = "";
    server_error = document.getElementById('server_error');
    server_error.style.display = "block";
    main_text_div = document.getElementById('main_text');
    main_text_div.style.display = "none";
}

function chat_error(){
    var text = "It looks like our server is not connected and we can't answer your question.<br>We apologize for the inconvenience.";
    printMessage(text,"left");
    app_global.css_elm.setAttribute("href",app_global.css_val.error);
    // app_global.last_message_send_at = getTimestamp();
    app_global.error = true;
    app_global.error_message_posted = true;
    disable_user_input(app_global.user_input_placeholder_val.server_down);
    console.log("Disable green_microphone button");
    console.log(config.asr_activated);
    if (config.asr_activated){
        console.log("Disable green_microphone button");
        change_microphone_image("off");
    }
}

function change_microphone_image(status){
    console.log("microphone status: "+status);
    if(status=="active"){
        display_microphone(false, true, false, false);
    }
    else if(status=="done"){
        display_microphone(false, false, false, true);
    }
    else if(status=="off"){
        display_microphone(false, false, true, false);
    }
    else if(status=="wait"){
        display_microphone(true, false, false, false);
    }
}

function display_microphone(green, red, grey, send){
    green_microphone = document.getElementById('green_microphone');
    red_microphone = document.getElementById('red_microphone');
    grey_microphone = document.getElementById('grey_microphone');
    send_button = document.getElementById('send_img');

    green_microphone.style.display = "none";
    red_microphone.style.display = "none";
    grey_microphone.style.display = "none";
    send_button.style.display = "none";

    if (green){
        green_microphone.style.display = "block";
    }
    if (red){
        red_microphone.style.display = "block";
    }
    if (grey){
        grey_microphone.style.display = "block";
    }
    if (send){
        send_button.style.display = "block";
    }
}

function on_microphone_hover(){
    document.getElementById('green_microphone').src = "img/microphone_green_white.png";
}
function off_microphone_hover(){
    document.getElementById('green_microphone').src = "img/green_microphone.png";
}

function on_send_hover(){
    document.getElementById('send_img').src = "img/send_white.png";
}
function off_send_hover(){
    document.getElementById('send_img').src = "img/send.png";
}


function on_click_microphone(){
    green_microphone = document.getElementById('green_microphone');
    // console.log(b.src);
    if (green_microphone.src.includes("img/microphone_green_white.png")){
        console.log("Starting dictation");
        startDictation();
    }
    else{
        console.log("Cannot speak now.");
    }
}

function on_click_send(){
    // console.log(b.src);
    change_microphone_image("wait");
    console.log("sending msg");
    send_chat();
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

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function MQTTConnect(jsonip){
    app_global.clientIP = jsonip.ip;
    console.log("Connecting to "+config.broker);
    var tmp = deleteAll(app_global.clientIP,".");
    app_global.clientID = "c" + makeid(10); //+ new Date().getTime();
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
    setTimeout(server_not_connected_message, app_global.connection_timeout * 1000 + 1000);

    // Send message to broker
    var message = new Paho.MQTT.Message(app_global.clientID+": "+msg);
    console.log("MQTTSendMessage");
    console.log(app_global.clientID+": "+msg);
    message.destinationName = config.topic_publish;
    console.log(config.topic_publish);
    console.log(app_global.mqtt.isConnected());
    app_global.mqtt.send(message);

    app_global.disconnection_timer.init();

    //Print in console
    console.log("Sending MQTT message: "+msg);
}


// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    handle_server_message(message.payloadString);
    console.log(app_global.mqtt.isConnected());
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                              TTS                                             --------//
//--------------------------------------------------------------------------------------------------------------//

// function ASR_action(txt){
//     console.log("ARS :-)");
//     console.log(txt);
// }

function startDictation() {

    change_microphone_image("active");

    if (window.hasOwnProperty('webkitSpeechRecognition')) {

        var recognition = new webkitSpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = function(e) {
            document.getElementById('transcript').value = e.results[0][0].transcript;
            recognition.stop();
            change_microphone_image("done");    
            // ASR_action(e.results[0][0].transcript);
            // document.getElementById('labnol').submit();
        };

        recognition.onerror = function(e) {
            recognition.stop();
            console.log("dictation error.");
            alert("There was a problem with dictation, we could not hear you.\n1 - Check that your green_microphone is on.\n2 - Go to a quiet place / speak louder.");
            change_microphone_image("wait");
        };

    }
}
