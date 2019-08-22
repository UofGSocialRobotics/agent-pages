//--------------------------------------------------------------------------------------------------------------//
//--------                                           CONFIGURATION                                      --------//
//--------------------------------------------------------------------------------------------------------------//

var config = {
    // broker : "wss://iot.eclipse.org/ws", //"wss://mqtt.eclipse.org/ws",
    // main_topic : "UoGSR/ca/",
    // topic_publish : "UoGSR/ca/Client/",
    // topic_subscribe : "UoGSR/ca/Server_out/",  
    // connection_message : "client connected",
    // confirmed_connection_message : "Connection confirmed",
    // amtinfo_ack : "ACK AMT_INFO",
    // disconnection_message : "ERROR, you were disconnected. Start session again by refreshing page.",
    turn_by_turn : true,
	tts_activated : false,
    asr_activated : false,
    // use_broker : false,
};


var configFirebase = {
    apiKey: "AIzaSyAOUs8A2cS_xeit0eB2_fOrO9rCoGnoTsQ",
    authDomain: "coraapp-eba76.firebaseio.com",
    databaseURL: "https://coraapp-eba76.firebaseio.com",
    // projectId: "datacollection-2f3de",
    storageBucket: "coraapp-eba76.appspot.com",
    // messagingSenderId: "608271042127"
  };
  firebase.initializeApp(configFirebase);

  FIREBASE_KEYS = {
      USERS : "Users",
      SESSIONS : "Sessions",
      DATETIME : "datetime",
      CLIENTID : "client_id",
      ACKFOR : "for",
    //   CHATJSON : "chat_json",
      UTTERANCE: "utterance",
      AMTID : "amt_id",
      ACK : "ack",
      DATACOLLECTION : "data_collection",
      DIALOG : "dialog",
      POSTSTUDYANSWERS : "questionnaire_answers",
      PRESTUDYANSWERS : "pre_study_questionnaire_answers",
      SOURCE : "source",
      TEXT : "text"
  };
  FIREBASE_VALUES = {
        CLIENT : "client",
        AGENT : "agent"
  };
  FIREBASE_REFS = {
      SESSIONS : false,
      USERS : false,
      CURRENT_SESSION : false
  };
  FIREBASE_SESSION_STRUCTURE = {};
//--------------------------------------------------------------------------------------------------------------//
//--------                                         ACCESS CHAT WINDOW                                   --------//
//--------------------------------------------------------------------------------------------------------------//
function accessChatWindow(){
    var message_speech = document.getElementById("message_speech"); 
    var message_text = document.getElementById("message_text");
    if(config.asr_activated == true && config.tts_activated == true){
        console.log("Will be using TTS and ASR.");
        message_speech.style.display = "block";
        message_text.style.display = "none";
    }
    else{
        console.log("Will NOT be using TTS and ASR.");
        message_speech.style.display = "none";
        message_text.style.display = "block";
    }
    if(app_global.error){
        change_microphone_image("off");
    }
    return callback_accessChatWindow();
    
}

function callback_accessChatWindow(){
    set_agent_name();
    keyboard_functions();
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
    socket : false,
    connection_timeout : 5,
    error : false,
    error_message_posted : false,
    resp_div : document.getElementById("response"),
    // clientIP : false,
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
    amt_msg : "for_data_collection",
    points_likert_scale : 5,
    q_id : false,
    last_dialog_at : false,
};

var PAGES = {
    AMTID : "amtid.html",
    INTRO : "intro.html",
    INSTRUCTIONS : "instructions.html",
    PRE_STUDY_QUESTIONNAIRE : "pre_study_questionnaire.html",
    CHAT_SETUP : "chat_setup.html",
    CHAT : "chat.html",
    QUESTIONNAIRE : "questionnaire.html",
    THANKS : "thanks.html",
}
var PAGES_SEQUENCE = [PAGES.AMTID, PAGES.INTRO, PAGES.INSTRUCTIONS, PAGES.PRE_STUDY_QUESTIONNAIRE, PAGES.CHAT_SETUP, PAGES.CHAT, PAGES.QUESTIONNAIRE, PAGES.THANKS];

var MSG_TYPES = {
    INFO : 'info',
    DATA_COLLECTION : "data_collection",
    ACK : "ack",
    DIALOG : "dialog"
}

app_global.current_url = window.location.href;
// console.log(current_url);

var QUESTIONS = {
    "q1": {
        "question1" : "1) I felt I was in sync with AGENTNAME.",
        "question2" : "2) I was able to say everything I wanted to say during the interaction.",
        "question3" : "3) AGENTNAME was interested in what I was saying.",
        "question4" : "4) AGENTNAME was respectful to me and considered to my concerns.",
        "question5" : "5) AGENTNAME was warm and caring.",
        "question6" : "6) AGENTNAME was friendly to me.",
        "question7" : "7) AGENTNAME and I established rapport.",
        "question8" : "8) I felt I had no connection with AGENTNAME",
    },
    "q2" : {
        "question9" : "9) The movies recommended to me during this interaction matched my interests.",
        "question10" : "10) AGENTNAME allowed me to specify and change my preferences during the interaction",
        "question11" : "11) I would use AGENTNAME to get movie recommendations in the future.",
        "question12" : "12) I easily found the movies I was looking for.",
        "question13" : "13) I would watch the movies recommended to me, given the opportunity.",
        "question14" : "14) I was satisfied with the movies recommended to me.",
        "question15" : "15) AGENTNAME provided sufficient details about the movies recommended.",
        "question16" : "16) AGENTNAME explained her reasoning behind the recommendations.",
    }
};

var PRE_STUDY_QUESTIONNAIRE = {
    "question1" : "For movie recommendations, do you favor novelty or similarity?"
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                           ON LOAD                                            --------//
//--------------------------------------------------------------------------------------------------------------//

function keyboard_functions() {
    var Message;
    console.log("in keyboard_functions");
    $('.send_message').on("click", function (e) {
        return send_chat();
    });

    $('.message_input').keyup(function (e) {
        if (e.which === 13) {
            return send_chat();
        }
    });
    $('#amtid_input').keyup(function (e) {
        if (e.which === 13) {
            return send_amtid();
        }
    });
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replace_agent_name(text){
    return replaceAll(text,"AGENTNAME",app_global.agent_name);
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
    else{
        var page_title =  document.getElementById("page_title");
        page_title.innerHTML = title + "<br><br>";
    }
    app_global.user_input_placeholder_val.wait_for_agent_answer = app_global.user_input_placeholder_val.wait_for_agent_answer.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.server_down = app_global.user_input_placeholder_val.server_down.replace("AGENTNAME",app_global.agent_name);
    app_global.user_input_placeholder_val.client_disconnected = app_global.user_input_placeholder_val.client_disconnected.replace("AGENTNAME",app_global.agent_name);

    page = get_page();
    if (page==PAGES.INTRO || page == PAGES.INSTRUCTIONS){
        var main_text =  document.getElementById("main_text").innerHTML;
        main_text = replaceAll(main_text,"AGENTNAME",app_global.agent_name);
        document.getElementById("main_text").innerHTML = main_text;
    }
}

function remove_other_var(s){
    if (s.includes("?")){
        var s_splited = s.split("?");
        return s_splited[0];
    } else return s;
}

function get_client_id_from_url(splited_url, callback){
    app_global.clientID = remove_other_var(splited_url);
    console.log(app_global.clientID);
    callback();
}

function get_client_id(){
    var splited_url = app_global.current_url.split("clientid="); //window.location.href
    if (splited_url.length > 1) get_client_id_from_url(splited_url[1], init_firebase_current_session_ref);
    else {
        console.log("Creating new user");
        var ref_new_user = FIREBASE_REFS.USERS.push("New user").then(function get_name(snapshot){
            console.log("Successfully created new user");
            app_global.clientID = snapshot.key;
            FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DATACOLLECTION][FIREBASE_KEYS.CLIENTID] = snapshot.key;
            console.log(app_global.clientID);
            create_new_session(snapshot.key);
            app_global.disconnection_timer.init();
        });
    }
}

function get_tts_asr(callback){
    page = get_page();
    if (page==PAGES.CHAT){
        var splited_url = app_global.current_url.split("tts_asr="); //window.location.href
        if (splited_url.length > 1) {
            var asrtts_bool= (remove_other_var(splited_url[1]) == "true");
            config.tts_activated = asrtts_bool;
            config.asr_activated = asrtts_bool;
        }
        console.log("tts_ars activated = "+config.asr_activated.toString());
        callback();
    }
}

function get_q_id(callback){
    console.log("in get_q_id");
    page = get_page();
    if (page==PAGES.QUESTIONNAIRE){
        var splited_url = app_global.current_url.split("q_id="); //window.location.href
        if (splited_url.length > 1) {
            var q_id = remove_other_var(splited_url[1]);
            if(q_id in QUESTIONS){
                app_global.q_id = q_id;
                console.log("Questionnaire id = "+app_global.q_id);
                callback();
            }
            else q_id_error("q_id "+q_id+" does not exists.");
        }
        else q_id_error("No q_id found.");
    }
    else q_id_error();
}

function q_id_error(details=false){
    if (details != false) console.log(details);
    console.log('ERROR while reading q_id');
}

function init_firebase_static_refs(callback){
    FIREBASE_REFS.SESSIONS = firebase.database().ref().child(FIREBASE_KEYS.SESSIONS);
    FIREBASE_REFS.USERS = firebase.database().ref().child(FIREBASE_KEYS.USERS);
    callback();
}
function init_firebase_current_session_ref(){
    FIREBASE_REFS.CURRENT_SESSION = firebase.database().ref(FIREBASE_KEYS.SESSIONS+"/"+app_global.clientID);
    FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DATACOLLECTION][FIREBASE_KEYS.CLIENTID] = app_global.clientID;
}
function create_new_session(key){
    if (key){
        var new_session = {};
        new_session[key] = FIREBASE_SESSION_STRUCTURE;
        FIREBASE_REFS.SESSIONS.update(new_session).then(function(){
            FIREBASE_REFS.CURRENT_SESSION = FIREBASE_REFS.SESSIONS.child(key);
        }).catch(function(error){
             firebase_error(error);
        });
    }
    else {
        console.log("ERROR: clientID not set, cannot create a new session!!");
    }
}
function firebase_error(error){
    console.log("===================== ERROR WITH FIREBASE !!!!! ==================");
    console.log(error);
}
function firebase_listen_ack_connection(){
    FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK).once('value').then(function(snapshot){
        return check_ack_listner();
    });
}

function check_ack_listner(snapshot){
    console.log(snapshot.val);
    if (snapshot.val == true){
        app_global.disconnection_timer.stop();
        var reset_ack_to_false = {};
        reset_ack_to_false[FIREBASE_KEYS.ACK] = false;
        FIREBASE_REFS.CURRENT_SESSION.update(reset_ack_to_false);
        return true;
    }
    else return false;
}
function check_ack(){
    console.log(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK));
    // return check_ack_listner(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK));
    var cond = FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK).once('value').then(function(snapshot){
        return check_ack_listner(snapshot);
    });
    if (cond) {
        return true;
    }
    else {
        return false;
    }
}

// function set_firebase_sessions_structure(){
var data_col = {};
data_col[FIREBASE_KEYS.AMTID] = false;
data_col[FIREBASE_KEYS.CLIENTID] = app_global.clientID;
data_col[FIREBASE_KEYS.PRESTUDYANSWERS] = false;
data_col[FIREBASE_KEYS.POSTSTUDYANSWERS] = false;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DATACOLLECTION] = data_col;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DIALOG] = {};
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DIALOG][FIREBASE_KEYS.CLIENTID] = app_global.clientID;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.ACK] = false;
// }

function on_load(){
    init_firebase_static_refs(get_client_id);
    // set_firebase_sessions_structure();
    keyboard_functions();
    set_agent_name();
    app_global.css_elm.setAttribute("href",app_global.css_val.no_error);
    get_tts_asr(accessChatWindow);
    page = get_page();
    if (page == PAGES.QUESTIONNAIRE) get_q_id(create_questionnaire);
    if (page == PAGES.THANKS) amt_validation_code();
    if (page == PAGES.PRE_STUDY_QUESTIONNAIRE) create_pre_study_questionnaire();
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                  WEBSITE NAVIGATION METHODS                                  --------//
//--------------------------------------------------------------------------------------------------------------//

function is_chat(){
    // console.log(app_global.current_url);
    return app_global.current_url.includes(PAGES.CHAT);
}

function get_page(){
    return app_global.current_url.split("/").pop().split("?")[0];
}
function get_page_name(){
    return get_page().split(".")[0];
}

function go_to_intro(){
    location.replace(PAGES.INTRO+"?clientid="+app_global.clientID)
}
function go_to_instructions(){
    location.replace(PAGES.INSTRUCTIONS+"?clientid="+app_global.clientID)
}
function go_to_pre_study_questionnaire(){
    location.replace(PAGES.PRE_STUDY_QUESTIONNAIRE+"?clientid="+app_global.clientID)
}
function go_to_chat_setup(){
    location.replace(PAGES.CHAT_SETUP+"?clientid="+app_global.clientID)
}
function go_to_chat(tts_asr){
    location.replace(PAGES.CHAT+"?clientid="+app_global.clientID+"?tts_asr="+tts_asr.toString())
}
function go_to_questionnaire(x){
    location.replace(PAGES.QUESTIONNAIRE+"?clientid="+app_global.clientID+"?q_id="+x)
}
function go_to_page_after_questionnaire(){
    if (get_page() == PAGES.PRE_STUDY_QUESTIONNAIRE) go_to_chat_setup();
    else if (app_global.q_id == "q1") go_to_questionnaire("q2");
    else if (app_global.q_id == "q2") go_to_thanks();
    else console.log("In go_to_page_after_questionnaire, questionnaire id is "+app_global.q_id.toString()+" - don't know what to do!");
}
function go_to_thanks(){
    location.replace(PAGES.THANKS+"?clientid="+app_global.clientID)
}
function go_to_next_page(param){
    var current_page = get_page();
    if (current_page == PAGES.QUESTIONNAIRE) go_to_page_after_questionnaire();
    var index_page = PAGES_SEQUENCE.indexOf(current_page);
    if (index_page >= 0){
        if (index_page < PAGES_SEQUENCE.length){
            var next_page = PAGES_SEQUENCE[index_page+1];
            switch(next_page){
                case PAGES.INTRO:
                    go_to_intro();
                    break;
                case PAGES.INSTRUCTIONS:
                    go_to_instructions();
                    break;
                case PAGES.PRE_STUDY_QUESTIONNAIRE:
                    go_to_pre_study_questionnaire();
                    break;
                case PAGES.CHAT_SETUP:
                    go_to_chat_setup();
                    break;
                default:
                    console.log("ERROR: not implemented for "+next_page);
                    break;                
            }
        }
    }
}
//--------------------------------------------------------------------------------------------------------------//
//--------                                     QUESTIONNAIRE METHODS                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function get_questionnaire_answers(){
    var page = get_page();
    if (page==PAGES.QUESTIONNAIRE) var q_dict = QUESTIONS[app_global.q_id];
    else var q_dict = PRE_STUDY_QUESTIONNAIRE;
    var answers = {};
    var n_question = Object.keys(q_dict).length;
    var count_questions = 0;
    for (key in q_dict){
        var radios = document.getElementsByName('likert_'+key);
        count_questions++;
        for (var i = 0, length = radios.length; i < length; i++){
            if (radios[i].checked){
                // do whatever you want with the checked radio
                a = radios[i].value.slice(-1);
                answers[key] = a;
                // console.log(a);
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
        if (count_questions == n_question){
            if (Object.keys(answers).length == n_question){
                console.log(answers);
                // var to_send = {'type': MSG_TYPES.DATA_COLLECTION};
                if (page==PAGES.QUESTIONNAIRE) send_data_collection(answers, FIREBASE_KEYS.POSTSTUDYANSWERS);
                else send_data_collection(answers, FIREBASE_KEYS.PRESTUDYANSWERS);
                // send_message(JSON.stringify(to_send), go_to_page_after_questionnaire);
                // console.log(answers.length, QUESTIONS.length);  
            }
            else{
                alert("You must answer all questions.")
            }
        }
    }
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

function add_datetime_and_client_id(dictionary){
    if (dictionary == false) var updated_dict = {};
    else var updated_dict = dictionary;
    updated_dict[FIREBASE_KEYS.DATETIME] =  new Date().toLocaleString();
    updated_dict[FIREBASE_KEYS.CLIENTID] =  app_global.clientID;
    return updated_dict;
}

function send_data_collection(piece_of_data, datacol_key){
    if (check_ack()){
        if ((typeof piece_of_data) == "string"){
            var data = {};
            var new_dict = add_datetime_and_client_id(false);
            new_dict['value'] = piece_of_data;
            data[datacol_key] = new_dict;
        }
        else {
            var data = {};
            // piece_of_data[FIREBASE_KEYS.DATETIME] = new Date().toLocaleString();
            data[datacol_key] = add_datetime_and_client_id(piece_of_data);
        }
        console.log("witting data in firebase");
        console.log(FIREBASE_REFS.CURRENT_SESSION.path);
        FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.DATACOLLECTION).update(data).then(function(snapshot){
            go_to_next_page();
        });
    }
    else{
        app_global.error = true;
        page_error();
    }
}

function send_dialog(text){
    var data = add_datetime_and_client_id(dictionary=false);
    data[FIREBASE_KEYS.SOURCE] = FIREBASE_VALUES.CLIENT;
    data[FIREBASE_KEYS.TEXT] = text;
    console.log(data);
    console.log(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.DIALOG).path)
    FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.DIALOG).push(data).then(function(snapshot){
        console.log("Save in Firebase: " + text);
    });

    console.log(FIREBASE_REFS.CURRENT_SESSION+'/'+FIREBASE_KEYS.DIALOG);
    var dialog_ref = FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.DIALOG);
    console.log(dialog_ref.path);

    dialog_ref.limitToLast(2).on('child_added', function(snapshot) {
        // all records after the last continue to invoke this function
        var key = snapshot.key;
        console.log("Debug: change in firebase/dialog.");
        if (key != FIREBASE_KEYS.CLIENTID){
            var dialog = snapshot.val();
            if (dialog[FIREBASE_KEYS.SOURCE] == FIREBASE_VALUES.AGENT) {
                console.log("Received dialog:")
                console.log(dialog);
                handle_server_message(dialog);
            }
        }
    });
}

function send_amtid(){
    var id = document.getElementById("amtid_input").value;
    if (check_amtid(id)){
        send_data_collection(id, FIREBASE_KEYS.AMTID);
    }
    else{
        alert("Enter your AMT ID.");
    }
}


function create_json_string_message(content, type){
    var d = {
        'content': content,
        'type': type,
        'client_id': app_global.clientID
    }
    return JSON.stringify(d);
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
            $message.addClass('appeared');
        };
    }(this);
    return this;
};

function send_chat() {
    // console.log("debug: in send chat");
    msg = getMessageText();
    // console.log(app_global.user_wait,msg,app_global.error);
    if (app_global.user_wait == false && msg!="" && app_global.error == false){
        printMessage(msg,'right');
        // res = send_message(JSON.stringify({'type': MSG_TYPES.DIALOG, 'content': msg}));
        send_dialog(msg);
        // Disable user input
        if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == false){
            disable_user_input(app_global.user_input_placeholder_val.wait_for_agent_answer);
        }
        else if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == true){
            change_microphone_image("off");
        }
        // return res;
    }
};

// function send_message(text, callback = null){
//     // console.log("in send Message")
//     var res = false;
//     if (config.use_broker){
//         res = MQTTSendMessage(text);
//     }
//     else{
//         try{
//             res = send_message_ws(text);
//         } catch(err) {
//             console.log(err);
//             app_global.error = true;
//             console.log("send_message set app_global.error to true");
//             server_not_connected_message();
//         }
//     }
//     console.log("sent "+text);
//     typeof callback == "function" && callback();
// }



// called when a message arrives
function handle_server_message(message) {
    // console.log("handle_server_message:"+message);
    app_global.disconnection_timer.stop();

    if (app_global.error == false){
        // app_global.server_disconnected = false;
        app_global.disconnection_timer.stop();
        if (is_chat()) {
            try{
                handle_chat_message(message);
            }
            catch(error) {
                console.log("/!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ ERROR in handle_chat_message /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\");
                console.log(error);
            }
        }
        if (get_page() == PAGES.AMTID && config.amtinfo_ack == message) go_to_intro();
    }
    else {
        console.log("Error, will not print new message.")
    }
    
}

function handle_chat_message(message){
    console.log("handle_chat_message");
    if (message == config.disconnection_message){
        app_global.css_elm.setAttribute("href",app_global.css_val.error);
        disable_user_input(app_global.user_input_placeholder_val.client_disconnected);
    }
    else {
        if (message != config.confirmed_connection_message && app_global.last_dialog_at != message[FIREBASE_KEYS.DATETIME]){
            // var json_message = JSON.parse(message); 
            app_global.last_dialog_at = message[FIREBASE_KEYS.DATETIME];
            json_message = message;
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
            if (agent_says_bye(json_message)){
                            terminate_conversation();
            }
            else if (config.turn_by_turn && config.asr_activated == false){
                activate_user_input();
                setFocusToTextBox();
            }           
        }
    }
}

function agent_says_bye(json_message){
    // return true;
    if (json_message.intent && json_message.intent == "bye") return true;
    else return false;
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
    if (config.asr_activated == true){
        console.log("Should we really be here????");
        return document.getElementById("transcript").value;
    }
    else{
        var user_text_input = document.getElementById("user_text_input");
        // console.log(user_text_input);
        // console.log(user_text_input.value);
        return user_text_input.value;
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
            console.log("time out?" + (app_global.disconnection_timer.timeElapsed > app_global.connection_timeout).toString());
            console.log("app_global.error?" + (app_global.error).toString());
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
    if (main_text_div) main_text_div.style.display = "none";
    amtid_text_div = document.getElementById('amtid_text');
    if (amtid_text_div) amtid_text_div.style.display = "none";
    questionnaire_div = document.getElementById('questionnaire_wrap');
    if (questionnaire_div) questionnaire_div.style.display = "none";
}

function chat_error(){
    var text = "It looks like our server is not connected and we can't answer your question.<br>We apologize for the inconvenience.";
    printMessage(text,"left");
    app_global.css_elm.setAttribute("href",app_global.css_val.error);
    // app_global.last_message_send_at = getTimestamp();
    app_global.error = true;
    console.log("chat error set app_global.error to true");
    app_global.error_message_posted = true;
    disable_user_input(app_global.user_input_placeholder_val.server_down);
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

function create_questionnaire(){
    if (app_global.q_id in QUESTIONS){
        for (var key in QUESTIONS[app_global.q_id]){
            // console.log(key,QUESTIONS[key]);
            create_likert_scale(key,QUESTIONS[app_global.q_id][key]);
        }
    }
    else q_id_error();
}

function create_pre_study_questionnaire(){
    for (var key in PRE_STUDY_QUESTIONNAIRE){
        // console.log(key,QUESTIONS[key]);
        create_likert_scale(key,PRE_STUDY_QUESTIONNAIRE[key], "Novelty", "Similarity");
    }
}


function create_likert_scale(q_id, q_text, label_1="totally disagree", label_5="totally agree"){
    questionnaire = document.getElementById("questionnaire");
    html = "<label class=\"statement\">"+replace_agent_name(q_text)+"</label><ul class='likert'>";
    for (i = 1; i <= app_global.points_likert_scale; i++) {
        if (i == 1) html += "<li><input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"><label>"+label_1+"</label></li>";
        else if (i == app_global.points_likert_scale) {
            html += "<li><input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"><label>"+label_5+"</label></li></ul>";
            // console.log(questionnaire.innerHTML);
            questionnaire.innerHTML += html;
        }
        else html += "<li><input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"></li>";
    }
}

function terminate_conversation(){
    console.log("conversation is over");
    var questionnaire_button = document.getElementById("go_to_questionnaire");
    questionnaire_button.style.display = "block";
    var message_speech = document.getElementById("message_speech"); 
    var message_text = document.getElementById("message_text");
    message_speech.style.display = "none";
    message_text.style.display = "none";
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
    MQTTSendMessage(JSON.stringify({'content':config.connection_message, 'type':MSG_TYPES.INFO}) );
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
    // app_global.clientIP = jsonip.ip;
    console.log("Connecting to "+config.broker);
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
    // console.log("MQTTSendMessage");
    // console.log(app_global.clientID+": "+msg);
    message.destinationName = config.topic_publish;
    // console.log(config.topic_publish);
    console.log("Connection open? "+app_global.mqtt.isConnected().toString());
    app_global.mqtt.send(message);

    app_global.disconnection_timer.init();

    //Print in console
    console.log("Sending MQTT message: "+msg);
}


// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    handle_server_message(message.payloadString);
    // console.log(app_global.mqtt.isConnected());
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

//--------------------------------------------------------------------------------------------------------------//
//--------                                       AMT VALIDATION CODE                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function amt_validation_code(){
    var amt_div = document.getElementById("AMT_validation_code");
    var code = "VAL"+app_global.clientID;
    amt_div.innerHTML = code;
}