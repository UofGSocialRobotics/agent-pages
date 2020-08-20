//--------------------------------------------------------------------------------------------------------------//
//--------                                           CONFIGURATION                                      --------//
//--------------------------------------------------------------------------------------------------------------//

var config = {
    turn_by_turn : true,
	tts_activated : false,
    asr_activated : false,
};


var configFirebase = {
    apiKey: "U2FsdGVkX18jZcK+nwNOHT4JnZf8Te8uYrjx77+mYj82EnUI2LiXnv6lB+kJ/a/maCYIjntJt5s4wdj/bIOheA==",
    authDomain: "U2FsdGVkX18vkDrVmVBVF2Dfh8m4gSXcOAOkr2PRelLmL4hsvu1mS8gJch5NTbWd",
    databaseURL: "U2FsdGVkX1+Qaft1SxJdWoukM/d1AylyCidNR/ML/6J6q/SB2s7cZR7/Q56acogXXNj+hHKsPk5ww69pLXQI/Q==",
    storageBucket: "U2FsdGVkX18SO89wQ1NKUuxPdEaey6nYDPzQuVaPeCQ8hCOXLVoVGva/+qS4ZP1Q"
};

//--------------------------------------------------------------------------------------------------------------//
//--------                                      TIMER CLASS DEFINITION                                  --------//
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
    voices : [],
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
    data_to_send : {
        datacol_key: false,
        piece_of_data: false,
        text: false,
        dialog_stated: false,
    },
    answers_demographics : {},
    answers_nochat : {},
    answer_demographics_weight_kg : undefined,
    answer_demographics_height_cm : undefined,
    rs_user_pref: [],
    rs_right_clicks: [],
    answer_rs_post_study : {
        whats_important: [],
        free_comment: false
    },
    answer_rs_satisfaction : {
        satisfaction: false,
        easiness: false,
        influence: false,
        comments: false
    },
    recipes_to_rate: false,
    recipes_rate: false
};

var PAGES = {
    AMTID : "amtid.html",
    INTRO : "intro.html",
    INSTRUCTIONS : "instructions.html",
    DEMOGRPAHICS : "demographics.html",
    PRE_STUDY_QUESTIONNAIRE : "pre_study_questionnaire.html",
    FOOD_DIAGNOSIS : "food_diagnosis.html",
    CHAT_SETUP : "chat_setup.html",
    CHAT : "chat.html",
    CHAT_GUIDED: "chat_guided.html",
    QUESTIONNAIRE : "questionnaire.html",
    THANKS : "thanks.html",
    DEMOGRPAHICS : "demographics.html",
    INFORMATION_FORM : "information_form.html",
    CONSENT_FORM : "consent_form.html",
    CHECK_SPEAKERS : "check_speakers.html",
    CHECK_MICROPHONE : "check_microphone.html",
    FREE_TEXT_FEEDBACK : "free_text_feedback.html",
    TUTO : "tuto.html",
    NOCHAT: "no_chat.html",
    RS_EVAL_RECIPES: "rs_eval_implicit.html",
    RS_EVAL_SINGLE_RECIPE: "rs_eval.html",
    RS_EVAL_INTRO: "rs_eval_intro.html",
    RS_INSTRUCTIONS: "rs_instructions.html",
    RS_QUESTIONNAIRE: "rs_food_questionnaire.html"
}
// var PAGES_SEQUENCE = [PAGES.INFORMATION_FORM, PAGES.CONSENT_FORM, PAGES.AMTID, PAGES.FOOD_DIAGNOSIS, PAGES.INSTRUCTIONS, PAGES.CHAT_GUIDED, PAGES.QUESTIONNAIRE, PAGES.FREE_TEXT_FEEDBACK, PAGES.DEMOGRPAHICS, PAGES.THANKS];
var PAGES_SEQUENCE = [PAGES.INFORMATION_FORM, PAGES.CONSENT_FORM, PAGES.AMTID, 
    PAGES.RS_INSTRUCTIONS, PAGES.RS_EVAL_RECIPES, PAGES.RS_EVAL_INTRO, PAGES.RS_EVAL_RECIPES, PAGES.RS_QUESTIONNAIRE,
    PAGES.FOOD_DIAGNOSIS, 
    PAGES.DEMOGRPAHICS, PAGES.THANKS];

var MSG_TYPES = {
    INFO : 'info',
    DATA_COLLECTION : "data_collection",
    ACK : "ack",
    DIALOG : "dialog"
}

var CUSINES = ["African", "American", "British", "Cajun", "Caribbean", "Chinese", "Eastern european", "European", "French", "German", "Greek", "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean", "Latin american", "Mediterranean", "Mexican", "Middle eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"];
var CHARACTERISTICS_USUAL_DINNER = ["Light", "Healthy", "Easy / fast to make", "Unhealthy", "Vegetarian", "Vegan", "Low in carbs", "Pick-up food", "Ready meal"]

app_global.current_url = window.location.href;
// console.log(current_url);

var QUESTIONS = {
    "q1": {
        "question1" : "I felt I was in sync with AGENTNAME.", 
        // "question22" : "I felt like AGENTNAME was a human.", 
        "question2" : "I was able to say everything I wanted to say during the interaction.", 
        "question17" : "I intent to make the recipe recommended to me.", 
        "question3" : "AGENTNAME was interested in what I was saying.", 
        "question4" : "AGENTNAME was respectful to me and considered to my concerns.", 
        "question18" : "I will try to make the recipe recommended to me.", 
        "question5" : "AGENTNAME was warm and caring.", 
        "question24" : "AGENTNAME disclosed information about herself.", 
        "question6" : "AGENTNAME was friendly to me.", 
        "question19" : "I want to make the recipe recommended to me.", 
        "question7" : "AGENTNAME and I established rapport.", 
        "question8" : "I felt I had <b>no</b> connection with AGENTNAME", 
        // "question23" : "AGENTNAME pretended to be a computer program." 
    },
    // "q2" : {
    //     "question9" : "9) The movies recommended to me during this interaction matched my interests.",
    //     "question10" : "10) AGENTNAME allowed me to specify and change my preferences during the interaction",
    //     "question11" : "11) I would use AGENTNAME to get movie recommendations in the future.",
    //     "question12" : "12) I easily found the movies I was looking for.",
    //     "question13" : "13) I would watch the movies recommended to me, given the opportunity.",
    //     "question14" : "14) I was satisfied with the movies recommended to me.",
    //     "question15" : "15) AGENTNAME provided sufficient details about the movies recommended.",
    //     "question16" : "16) AGENTNAME explained her reasoning behind the recommendations.",
    // }
    "q2" : {
        // "quetion9": "How likely is it that you will make this recipe?"
        "question9" : "The recipe recommended to me during this interaction matched my preferences.", 
        // "question25" : "I felt like AGENTNAME was a computer program.", 
        "question10" : " AGENTNAME allowed me to specify and change my preferences during the interaction.", 
        "question20" : "I expect to make the recipe recommended to me.", 
        "question11" : "I would use AGENTNAME to get recipe recommendations in the future.", 
        "question12" : "I easily found the recipe I was looking for.", 
        "question21" : "It is likely I will make the recipe recommended to me.", 
        "question13" : "The recipes recommended by AGENTNAME were healthy.", 
        "question14" : "I was satisfied with the recipe recommended to me.", 
        "question15" : "AGENTNAME provided sufficient details about the recipe recommended.",
        "question16" : "AGENTNAME explained her reasoning behind the recommendations.", 
        // "question26" : "AGENTNAME pretended to be a human.", 
        "question27" : "Answer \"Totally agree\" to this question please.",
    }
};

var PRE_STUDY_QUESTIONNAIRE = {
    "question1" : "For movie recommendations, do you favor novelty or similarity?"
}

var DIAGNOSIS_FOODS = {
    // "question1": "SUPER FOOD SALAD",
    // "question2": "VEGETABLE STIR FRY",
    // "question3": "BAKED FISH WITH VEGETABLES",
    // "question4": "TURKEY AND ROAST VEGETABLES",
    // "question5": "CHICKEN BREAST SALAD",
    // "question6": "PIZZA",
    // "question7": "BURGER AND CHIPS",
    // "question8": "FISH AND CHIPS",
    // "question9": "DONER KEBAD",
    // "question10": "MACARONI AND CHEESE",
    "question1": "BROCCOLI",
    "question2": "CHIPS / FRIES",
    "question3": "CARROTS",
    "question4": "PIZZA",
    "question5": "TOMATOES",
    "question6": "PASTA",
    "question7": "LETTUCE",
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                      FIREBASE GLOBAL VARIABLES                               --------//
//--------------------------------------------------------------------------------------------------------------//

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
    TEXT : "text",
    FOODDIAGNOSISANSWERS : "food_diagnosis_answers",
    DEMOGRPAHICS : "demographics",
    FREECOMMENTS : "free_comments",
    NOCHAT : "no_chat",
    LIKED_RECIPES: "liked_recipes",
    RIGHT_CLICKED_RECIPES: "right_clicked_recipes",
    RS_POSTSTUDYANSWERS: "rs_post_study_answers",
    RS_SATISFACTION: "rs_satisfaction",
    RECIPE_RATINGS: "recipe_ratings"
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

// function set_firebase_sessions_structure(){
var data_col = {};
data_col[FIREBASE_KEYS.AMTID] = false;
data_col[FIREBASE_KEYS.CLIENTID] = app_global.clientID;
data_col[FIREBASE_KEYS.PRESTUDYANSWERS] = false;
data_col[FIREBASE_KEYS.POSTSTUDYANSWERS+"_q1"] = false;
data_col[FIREBASE_KEYS.POSTSTUDYANSWERS+"_q2"] = false;
data_col[FIREBASE_KEYS.FOODDIAGNOSISANSWERS] = false;
data_col[FIREBASE_KEYS.DEMOGRPAHICS] = false;
data_col[FIREBASE_KEYS.FREECOMMENTS] = false;
data_col[FIREBASE_KEYS.NOCHAT] = false;
data_col[FIREBASE_KEYS.RS_POSTSTUDYANSWERS] = false;
data_col[FIREBASE_KEYS.RS_SATISFACTION] = false;
data_col[FIREBASE_KEYS.RECIPE_RATINGS] = false;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DATACOLLECTION] = data_col;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DIALOG] = {};
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.DIALOG][FIREBASE_KEYS.CLIENTID] = app_global.clientID;
FIREBASE_SESSION_STRUCTURE[FIREBASE_KEYS.ACK] = false;
// }

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
//--------                                           ON LOAD                                            --------//
//--------------------------------------------------------------------------------------------------------------//

function on_load(){
    console.log("in on_load");
    // cora_is_typing();
    if (decrypt_config() == true) {
        initialize_firebase();
        init_firebase_static_refs(get_client_id);
    }
    // set_firebase_sessions_structure();
    keyboard_functions();
    set_agent_name();
    app_global.css_elm.setAttribute("href",app_global.css_val.no_error);
    var page = get_page();
    console.log(page);
    if (page == PAGES.CHAT) get_tts_asr(accessChatWindow);
    else get_tts_asr();
    if (page == PAGES.QUESTIONNAIRE) get_q_id(create_questionnaire);
    // else if (page == PAGES.THANKS) amt_validation_code();
    else if (page == PAGES.PRE_STUDY_QUESTIONNAIRE) create_pre_study_questionnaire();   
    else if (page == PAGES.FOOD_DIAGNOSIS) create_food_diagnosis_questionnaire();
    // else if (page == PAGES.DEMOGRPAHICS) init_demogrpahics();
    else if (page == PAGES.CHAT_GUIDED) {
        console.log("Chat guided page!");
        chat_guided_setup_onclick_event();
    }
    else if (page == PAGES.NOCHAT) init_nochat();
    else if (page == PAGES.CHAT) {
        alert('Say \"Hello\" to Cora to start the interaction.\nBe aware that the system can be a little slow sometimes.');
    }
    else if (page == PAGES.RS_EVAL_RECIPES) {
        var step = get_value_from_url_var("step");
        if (step == "learn_pref"){
            console.log("asking to learning pref -- sending dialog");
            send_dialog("start_pref_gathering");
        } else if (step == "reco"){
            console.log("asking to start_rs_eval -- sending dialog");
            send_dialog("start_rs_eval");
        }
    }
    else if (page == PAGES.RS_EVAL_SINGLE_RECIPE) {
        var step = get_value_from_url_var("step");
        if (step == "reco"){
            console.log("asking to start_rs_eval -- sending dialog");
            send_dialog("start_rs_eval");
        }
    }
	window.speechSynthesis.onvoiceschanged = function() {
        app_global.voices=window.speechSynthesis.getVoices();
    };
}


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

function set_agent_name(){
    console.log("set_agent_name");
    var title = "Chat with " + app_global.agent_name;
    var tab_title =  document.getElementById("tab_title");
    tab_title.innerHTML = title;
    if (is_chat()){
        var chat_title =  document.getElementById("chat_title");
        chat_title.innerHTML = title;
    }
    // else{
    //     var page_title =  document.getElementById("page_title");
    //     page_title.innerHTML = title + "<br><br>";
    // }
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

//--------------------------------------------------------------------------------------------------------------//
//--------                                     HELPER FUNCTIONS                                         --------//
//--------------------------------------------------------------------------------------------------------------//


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replace_agent_name(text){
    return replaceAll(text,"AGENTNAME",app_global.agent_name);
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                         URL VARIABLES                                        --------//
//--------------------------------------------------------------------------------------------------------------//

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

function get_value_from_url_var(var_name){
    var splited_url = app_global.current_url.split(var_name+"=");
    return remove_other_var(splited_url[1]);
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
    // page = get_page();
    // if (page==PAGES.CHAT){
    var splited_url = app_global.current_url.split("tts_asr="); //window.location.href
    if (splited_url.length > 1) {
        var asrtts_bool= (remove_other_var(splited_url[1]) == "true");
        config.tts_activated = asrtts_bool;
        config.asr_activated = asrtts_bool;
    }
    else{
        console.log("WARNING: can't find tts_asr var in url.")
    }
    console.log("tts_ars activated = "+config.asr_activated.toString());
    if (callback) callback();
    else return asrtts_bool;
    // }
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



//--------------------------------------------------------------------------------------------------------------//
//--------                                         FIREBASE FUNCTIONS                                   --------//
//--------------------------------------------------------------------------------------------------------------//


//--------                                           Helper functions                                   --------//
//--------------------------------------------------------------------------------------------------------------//

function firebase_error(error){
    console.log("===================== ERROR WITH FIREBASE !!!!! ==================");
    console.log(error);
}

//--------                                 Connection and new session set up                            --------//
//--------------------------------------------------------------------------------------------------------------//

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

function decrypt_config(){
    Object.keys(configFirebase).forEach(function(key) {
        configFirebase[key] = CryptoJS.AES.decrypt(configFirebase[key], "Secret Passphrase").toString(CryptoJS.enc.Utf8);
    });
    return true;
}

function initialize_firebase(){
    firebase.initializeApp(configFirebase);
}


//--------                                    Acknowledgments functions                                 --------//
//--------------------------------------------------------------------------------------------------------------//

function check_ack(callback){
    console.log("in check_ack");
    callback();
    // console.log(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK));
    // // return check_ack_listner(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK));
    // var cond = FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.ACK).once('value').then(function(snapshot){
    //     console.log(snapshot.val());
    //     // console.log("we are here");
    //     // if (snapshot.val() == true) {
    //     var data = {};
    //     data[FIREBASE_KEYS.ACK] = false;
    //     FIREBASE_REFS.CURRENT_SESSION.update(data);
    //     callback();
    //     // }
    //     // else{
    //     //     app_global.error = true;
    //     //     server_not_connected_message();
    //     // }
    // });
}

//--------                                       Update firebase functions                              --------//
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

function send_data_collection_callback(){
    console.log("in send_data_collection_callback");
    var piece_of_data = app_global.data_to_send.piece_of_data;
    var datacol_key = app_global.data_to_send.datacol_key;
    if (piece_of_data == false || datacol_key == false){
        console.log("ERROR: text not set!!!");
    }
    else {
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
            if (get_page() == PAGES.NOCHAT){
                console.log("Waiting for recommendation");
            }
            else {
                go_to_next_page();
            }
        });
    }
}

function send_data_collection(piece_of_data, datacol_key){
    app_global.data_to_send.datacol_key = datacol_key;
    if (datacol_key == FIREBASE_KEYS.POSTSTUDYANSWERS) {
        console.log("get_value_from_url_var(q_id);");
        console.log(get_value_from_url_var("q_id"));
        app_global.data_to_send.datacol_key += "_" + get_value_from_url_var("q_id");
    }
    app_global.data_to_send.piece_of_data = piece_of_data;
    console.log("app_global.data_to_send.datacol_key");
    console.log(app_global.data_to_send.datacol_key);
    check_ack(send_data_collection_callback);
}

function send_dialog_callback(){
    console.log("in send_dialog_callback");
    var text = app_global.data_to_send.text;
    console.log(app_global.data_to_send.text);
    if (text == false){
        console.log("ERROR: text not set!!!");
    }
    else {
        var data = add_datetime_and_client_id(dictionary=false);
        data[FIREBASE_KEYS.SOURCE] = FIREBASE_VALUES.CLIENT;
        if (get_page() == PAGES.RS_EVAL_RECIPES){
            data[FIREBASE_KEYS.RIGHT_CLICKED_RECIPES] = app_global.rs_right_clicks;
            data[FIREBASE_KEYS.LIKED_RECIPES] = text;
        }
        else {
            data[FIREBASE_KEYS.TEXT] = text;
        }
        console.log(data);
        console.log(FIREBASE_REFS.CURRENT_SESSION.child(FIREBASE_KEYS.DIALOG).path);
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
}

function send_dialog(text){
    console.log("in send_dialog");
    app_global.data_to_send.text = text;
    send_dialog_callback();
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

//--------------------------------------------------------------------------------------------------------------//
//--------                                  WEBSITE NAVIGATION METHODS                                  --------//
//--------------------------------------------------------------------------------------------------------------//

function is_chat(){
    // console.log(app_global.current_url);
    return (app_global.current_url.includes(PAGES.CHAT) && !app_global.current_url.includes(PAGES.NOCHAT));
}

function get_page(){
    return app_global.current_url.split("/").pop().split("?")[0];
}
function get_page_name(){
    return get_page().split(".")[0];
}

function url_vars_to_string(){
    var url_vars = "?clientid="+app_global.clientID+"?tts_asr="+config.tts_activated.toString();
    if (get_page() == PAGES.RS_INSTRUCTIONS){
        url_vars += "?step=learn_pref";
    } else if (get_page() == PAGES.RS_EVAL_INTRO){
        url_vars += "?step=reco";
    }
    return url_vars;
}

function go_to_questionnaire(x){
    location.replace(PAGES.QUESTIONNAIRE+url_vars_to_string()+"?q_id="+x);
}
function go_to_page_after_questionnaire(){
    if (get_page() == PAGES.PRE_STUDY_QUESTIONNAIRE) go_to_chat_setup();
    else if (app_global.q_id == "q1") go_to_questionnaire("q2");
    else if (app_global.q_id == "q2") go_to_next_page_general_case();
    else console.log("In go_to_page_after_questionnaire, questionnaire id is "+app_global.q_id.toString()+" - don't know what to do!");
}

function go_to_prolific_validation_page(){
    location.replace("https://app.prolific.co/submissions/complete?cc=49D46426");
}

function go_to_next_page(param){
    setTimeout(function(){ go_to_next_page_after_timeout(param); }, 500);
}

function go_to_next_page_after_timeout(param){
    var current_page = get_page();
    if (current_page == PAGES.QUESTIONNAIRE) go_to_page_after_questionnaire();
    else if (current_page == PAGES.RS_EVAL_RECIPES) go_to_page_after_eval_recipes();
    else go_to_next_page_general_case();
}

function go_to_next_page_general_case(){
    var current_page = get_page();
    var index_page = PAGES_SEQUENCE.indexOf(current_page);
    if (index_page >= 0){
        if (index_page < PAGES_SEQUENCE.length){
            var next_page = PAGES_SEQUENCE[index_page+1];
            location.replace(next_page+url_vars_to_string());
        }
    }
    else{
        console.log("Can't find current page, can't move to next one!!");
    }
}

function go_to_page_after_eval_recipes(){
    var step = get_value_from_url_var("step");
    if (step == "learn_pref"){
        go_to_next_page_general_case();
    } else if (step == "reco"){
        var next_page = PAGES.RS_QUESTIONNAIRE;
        // var next_page = PAGES.THANKS;
        location.replace(next_page+url_vars_to_string());
    }
}

function move_to_next_step(){
    var step = get_value_from_url_var("step");
    if (step == "learn_pref"){
        save_user_pref(go_to_next_page_general_case);
    } else if (step == "reco"){
        save_user_pref(display_satisfaction_questionnaire);
    }
}

function rs_go_to_post_study(){
    location.replace(PAGES.DEMOGRPAHICS+url_vars_to_string());
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                     QUESTIONNAIRE METHODS                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function get_questionnaire_answers(){
    var page = get_page();
    if (page==PAGES.QUESTIONNAIRE) var q_dict = QUESTIONS[app_global.q_id];
    else if (page == PAGES.PRE_STUDY_QUESTIONNAIRE) var q_dict = PRE_STUDY_QUESTIONNAIRE;
    else if (page == PAGES.FOOD_DIAGNOSIS) var q_dict = DIAGNOSIS_FOODS;
    var answers = {};
    var n_question = Object.keys(q_dict).length;
    var count_questions = 0;
    for (key in q_dict){
        var radios = document.getElementsByName('likert_'+key);
        count_questions++;
        for (var i = 0, length = radios.length; i < length; i++){
            if (radios[i].checked){
                // do whatever you want with the checked radio
                var splited_text = radios[i].value.split("_")
                var a = splited_text[splited_text.length-1]
                answers[key] = a;
                // console.log(a);
                // only one radio can be logically checked, don't check the rest
                break;
            }
        }
        if (count_questions == n_question){
            if (Object.keys(answers).length == n_question){
                console.log(answers);
                if (page==PAGES.QUESTIONNAIRE) send_data_collection(answers, FIREBASE_KEYS.POSTSTUDYANSWERS);
                else if (page==PAGES.PRE_STUDY_QUESTIONNAIRE) send_data_collection(answers, FIREBASE_KEYS.PRESTUDYANSWERS);
                else if (page==PAGES.FOOD_DIAGNOSIS) send_data_collection(answers, FIREBASE_KEYS.FOODDIAGNOSISANSWERS);
            }
            else{
                alert("You must answer all questions.")
            }
        }
    }
}

function get_free_text_feedback(){
    var div_free_text_about_cora = document.getElementById("free_text_about_cora");
    var div_free_text_about_study = document.getElementById("free_text_about_study");
    var data = {};
    data["free_text_about_study"] = div_free_text_about_study.value;
    data["free_text_about_cora"] = div_free_text_about_cora.value;
    send_data_collection(data, FIREBASE_KEYS.FREECOMMENTS);
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                     RECEIVE MESSAGES FUNCTIONS                               --------//
//--------------------------------------------------------------------------------------------------------------//

// called when a message arrives
function handle_server_message(message) {
    console.log("handle_server_message:");
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
        else if (get_page() == PAGES.CHAT_GUIDED) {
            try{
                handle_guided_chat_message(message);
            }
            catch(error) {
                console.log("/!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ ERROR in handle_guided_hat_message /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\");
                console.log(error);
            }
        }
        else if (get_page() == PAGES.NOCHAT) {
            try{
                handle_nochat_message(message);
            }
            catch(error) {
                console.log("/!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ ERROR in handle_NOchat_message /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\");
                console.log(error);
            }
        }
        else if (get_page() == PAGES.RS_EVAL_RECIPES || get_page() == PAGES.RS_EVAL_SINGLE_RECIPE){
            try{
                handle_rs_eval_message(message);
            }
            catch(error) {
                console.log("/!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ ERROR in handle_rs_eval_message /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\ /!\\");
                console.log(error);
            }
        }
        if (get_page() == PAGES.AMTID && config.amtinfo_ack == message) go_to_intro();
    }
    else {
        console.log("Error, will not print new message.")
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
            $message.addClass('appeared');
        };
    }(this);
    return this;
};

function send_chat(msg) {
    // console.log("debug: in send chat");
    if (!msg) msg = getMessageText();
    // console.log(app_global.user_wait,msg,app_global.error);
    // if (app_global.user_wait == false && msg!="" && app_global.error == false){
    printMessage(msg,'right');
    // res = send_message(JSON.stringify({'type': MSG_TYPES.DIALOG, 'content': msg}));
    send_dialog(msg);
    // Disable user input
    if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == false && is_chat()){
        disable_user_input(app_global.user_input_placeholder_val.wait_for_agent_answer);
    }
    else if (msg != config.connection_message && config.turn_by_turn && config.asr_activated == true){
        change_microphone_image("off");
    }
        // return res;
    // }
};



function handle_chat_message(message){
    console.log("handle_chat_message");
    if (message == config.disconnection_message){
        app_global.css_elm.setAttribute("href",app_global.css_val.error);
        disable_user_input(app_global.user_input_placeholder_val.client_disconnected);
    }
    else {
        if (message != config.confirmed_connection_message && app_global.last_dialog_at != message[FIREBASE_KEYS.DATETIME]){
            console.log("We're here");
            // var json_message = JSON.parse(message); 
            app_global.last_dialog_at = message[FIREBASE_KEYS.DATETIME];
            json_message = message;
            if (config.tts_activated) {
                var u = new SpeechSynthesisUtterance(json_message.sentence);
                // var u = new SpeechSynthesisUtterance("Hi, this is a test to check you can hear me.");
                u.onend = function (event) {
                    change_microphone_image("wait");
                };
                // u.voice = app_global.voices.filter(function(voice) { return voice.name == 'Microsoft Zira Desktop - English (United States)'; })[0];
                var voices = window.speechSynthesis.getVoices();
                u.voice = voices[49]; // Good voices: 48 - 49 - 10 - 17 - 28 - 32 - 36
                // console.log(voies.length);
                u.rate = 1;
		        window.speechSynthesis.speak(u);
            }
            if (json_message.recipe_card){
                console.log(json_message.recipe_card);
				console.log(json_message.food_recipe);
                // var img_src = json_message.recipe_card;
                var img_src = "https://firebasestorage.googleapis.com/v0/b/coraapp-eba76.appspot.com/o/images%2Fexample.jpg?alt=media";
                printMessage("<p id=\"recipe_card\" style=\"text-align:center;\"><img src=\""+img_src+"\" width=\"90%\" /></p>   <p style=\"font-size:10px;\" align=\"right\"><a target=\"_blank\" rel=\"noopener noreferrer\" href=\""+json_message.food_recipe+"\"> See recipe here </a></td>",'left'+"");      
            }
			if (json_message.movie_poster){
                console.log(json_message.movie_poster);
                printMessage("<p style=\"text-align:center;\"><img src=\""+json_message.movie_poster+"\" width=\"50%\" /></p>",'left'+"");      
            }
            printMessage(json_message.sentence,'left');  
			
            if (agent_says_bye(json_message)){
                terminate_conversation();
            }
            else if (config.turn_by_turn && config.asr_activated == false && is_chat() && json_message.wait_for_more == false){
                activate_user_input();
                setFocusToTextBox();
            }           
        }
    }
}

function handle_guided_chat_message(message){
    handle_chat_message(message);
    var intent = message["intent"];
    if (message['wait_for_more'] == false){
        if (intent == "greeting") chat_guided_hide_and_show_divs("wait_answer", "user_name_div");
        else if (intent=="request(mood)") chat_guided_hide_and_show_divs("wait_answer", "mood_div");
        else if (intent == "request(usual_dinner)") chat_guided_hide_and_show_divs("wait_answer", "usual_dinner_div");
        else if (intent == "request(why_dinner)") chat_guided_hide_and_show_divs("wait_answer", "why_usual_dinner_div");
        else if (intent == "request(filling)") chat_guided_hide_and_show_divs("wait_answer", "hungriness");
        else if (intent == "request(healthy)") chat_guided_hide_and_show_divs("wait_answer", "healthiness");
        else if (intent == "request(diet)") chat_guided_hide_and_show_divs("wait_answer", "diets_intolerances");
        else if (intent == "request(time)") chat_guided_hide_and_show_divs("wait_answer", "time");
        else if (intent == "request(food)") chat_guided_hide_and_show_divs("wait_answer", "ingredients_options");
        else if (intent == "inform(food)") {
            console.log(message['ingredients']);
            set_up_ingredients_list(message['ingredients'], set_up_onclick_ingredients_list);
            chat_guided_hide_and_show_divs("wait_answer", "r_feedback");
        }
        else if (intent == "request(another)") chat_guided_hide_and_show_divs("wait_answer", "request_more");
        else if (intent == "bye") chat_guided_hide_and_show_divs("wait_answer", "go_to_questionnaire");
    }
}

function handle_rs_eval_message(message){
    if (message["intent"] == "goto_eval_intro"){
        go_to_next_page();
    }
    else if (message["intent"] == "go_to_post_study"){
        rs_go_to_post_study();
    }
    else if (message['intent'] == "learn_pref"){
        rs_diplay_multiple_recipes(message['recipes']);
    }
    else if (message['intent'] == "eval_reco"){
        app_global.recipes_to_rate = message['recipes'];
        console.log(app_global.recipes_to_rate);
        // setTimeout(display_new_recipe, 200);
        rs_diplay_multiple_recipes(message['recipes']);

    }
    // else{
    //     display_new_recipe(message);
    // }
}

function get_next_recipe_to_rate(){
    for(var i =0; i<app_global.recipes_to_rate.length; i++){
        var recipe = app_global.recipes_to_rate[i];
        // console.log(recipe);
        var rid = recipe['id'];
        if (app_global.recipes_rate){
            if (!(rid in app_global.recipes_rate)){
                return recipe;
            }
        }
        else {
            return recipe;
        }
    } 
    return false;
}

function display_new_recipe(){  

    // console.log("in display_new_recipe");
    
    

    var recipe_data = get_next_recipe_to_rate();

    // console.log(recipe_data);

    if (recipe_data){

        function set_onclick_fct_with_recipe_id(item){
            var i = parseInt(item.getAttribute('name'));
            item.onclick = function(){
                rating_fct(recipe_data['id'],i);
                // console.log(item);
            }
            // item.onclick = rating_fct(recipe_data['id'],5,send_data_collection_callback);
        }

        var rating_stars = document.getElementsByClassName("start_rating");
        // console.log(rating_stars);
        for (const star_btn of rating_stars) {
            set_onclick_fct_with_recipe_id(star_btn);
        }

        // console.log("recipe page");
        var recipe_img_html = document.getElementById("recipe_img");
        recipe_img_html.src = recipe_data['image_url'];
        var recipe_title_html = document.getElementById("recipe_title");
        recipe_title_html.innerHTML = recipe_data["title"];
        
        var html_open_div_rating = "<div class=\"rating\">";
        var html_rating_inner = generate_html_rating(recipe_data['rating'], recipe_data['n_ratings']);
        var html_close_div_rating = "</div>";
        var html_rating = html_open_div_rating + html_rating_inner + html_close_div_rating;
        var html_div_health_tag = document.getElementById("health_tag_img");
        html_div_health_tag.src = "img/healthiness_"+recipe_data['FSAcolour']+".png";
        var recipe_rating_html = document.getElementById("recipe_rating_id");
        recipe_rating_html.innerHTML = html_rating;

        var recipe_prep_time_html = document.getElementById("prep_time");
        recipe_prep_time_html.innerHTML = recipe_data["time_prep"];
        var recipe_cook_time_html = document.getElementById("cook_time");
        recipe_cook_time_html.innerHTML = recipe_data["time_cook"];
        var recipe_total_time_html = document.getElementById("total_time");
        recipe_total_time_html.innerHTML = recipe_data["time_total"];
        var elt_html = document.getElementById("servings");
        elt_html.innerHTML = recipe_data['servings'];
        var elt_html = document.getElementById("recipe_description");
        elt_html.innerHTML = recipe_data['description'];

        var ingredients_col1 = recipe_data["ingredients"]["col1"];
        var ingredients_col2 = recipe_data["ingredients"]["col2"];
        var ingredients_col3 = recipe_data["ingredients"]["col3"];

        // console.log(ingredients_col1);

        ingredients_col1.forEach(create_ingredients_column1);
        if (ingredients_col2 != undefined) ingredients_col2.forEach(create_ingredients_column2);
        if (ingredients_col3 != undefined) ingredients_col3.forEach(create_ingredients_column3);

        var instructions_list = recipe_data["instructions"];
        instructions_list.forEach(create_instructions);

        function create_ingredients_column1(item, index){
            var col1_html = document.getElementById("ingredients_col1");
            if (index == 0){
                col1_html.innerHTML = "<br><br><span>"+item+"</span>";
            }
            else col1_html.innerHTML += "<br><br><span>"+item+"</span>";
        }
        
        function create_ingredients_column2(item, index){
            var col2_html = document.getElementById("ingredients_col2");
            if (index == 0){
                col2_html.innerHTML = "<br><br><span>"+item+"</span>";
            }
            else col2_html.innerHTML += "<br><br><span>"+item+"</span>";
        }
        
        function create_ingredients_column3(item, index){
            var col3_html = document.getElementById("ingredients_col3");
            if (index == 0){
                col3_html.innerHTML = "<br><br><span>"+item+"</span>";
            }
            else col3_html.innerHTML += "<br><br><span>"+item+"</span>";
        }
        
        function create_instructions(item, index){
            var instructions_html = document.getElementById("instructions_list");
            if (index == 0){
                instructions_html.innerHTML = "<br><br><span>"+(index+1).toString()+". "+item+"</span>";
            }
            else instructions_html.innerHTML += "<br><br><span>"+(index+1).toString()+". "+item+"</span>";
        }
        window.scrollTo(0,0);
        display_recipe_to_rate();
    }
    else{
        var tmp = dict_to_list(app_global.recipes_rate);
        // send_dialog(tmp);
        send_data_collection(tmp, FIREBASE_KEYS.RECIPE_RATINGS);
    }
}

function display_recipe_to_rate(){
    var display_div = document.getElementById("rs_eval_div");
    display_div.style = "display:block;"
}

function dict_to_list(dict){
    var arr = [];
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            arr.push( [ key, dict[key] ] );
        }
    }
    return arr;
}

function rs_diplay_multiple_recipes(recipes_list){
    recipes_list.forEach(display_single_recipe_in_grid);
    var to_hide = document.getElementById("do_not_refresh");
    var to_display = document.getElementById("questionnaire_wrap");
    to_display.style = "display:block;";
    to_hide.style = "display:none;";
}

function generate_html_emptystar(){
    return "<span class=\"emptystar\">☆</span>";
}
function generate_html_fullstar(){
    return "<span class=\"fullstar\">☆</span>";
}
function generate_html_halfstar(){
    return "<i class=\"fa fa-star-half-full\" style=\"font-size:15px;color:#F9C811\"></i>";
}

function reverseString(str) {
    var splitString = str.split(""); 
    var reverseArray = splitString.reverse(); 
    var joinArray = reverseArray.join(""); 
    return joinArray; // "olleh"
}

function generate_html_rating(rating, n_ratings){
    var rating_int = Math.floor(rating);
    var reminder = rating - rating_int;
    if (reminder >= 0.25 && reminder < 0.75) {
        var halfstar_bool = true;
        var n_emptystars = 5 - rating_int - 1;
    }
    else {
        var halfstar_bool = false;
        var n_emptystars = 5 - rating_int;
    }
    var html_open_div_rating = "<div class=\"recipe-rating\"> <div class=\"rating\">";
    var html_span_n_ratings = "<span class=\"rating-number\" id=\"rating-number\"> (" + reverseString(n_ratings.toString()) + ") </span>";
    var html_fullstars = "";
    for(var i=0; i<rating_int; i++){
        html_fullstars += generate_html_fullstar();
    }
    var html_emptystars = "";
    for(var i=0; i<n_emptystars; i++){
        html_emptystars += generate_html_emptystar();
    }
    if (halfstar_bool) var html_halfstar = generate_html_halfstar();
    else var html_halfstar = "";
    var html_stars = html_emptystars + html_halfstar + html_fullstars;
    var html_close_div_rating = "</div></div>";
    var html = html_open_div_rating + html_span_n_ratings + "<span>" + html_stars + "</span>" + html_close_div_rating;
    // console.log(html);
    return html;

}

function display_single_recipe_in_grid(rdata, n){

    var rid = rdata['id'];
    var html_open_div_recipe = "<div class=\"inner-grid-container igc-border\" id=\""+rid+"\" onclick=\"selectRecipe('rid', '"+rid+"');\">";
    var html_open_div_img = "<div class=\"recipe-image\">";
    var html_img = "<img class=\"center-cropped\" src=\""+rdata['image_url']+"\" id=\"recipe_img\" height=\"200px\">";
    var html_close_div_img = "</div>";
    var title = rdata['title'];
    if (title.length > 30) {
        title = title.slice(0, 27) + "...";
    }
    var html_div_title = "<div class=\"recipe-title\">"+title+"</div>";
    var html_open_div_rating = "<div class=\"rating\">";
    var html_rating = generate_html_rating(rdata['rating'], rdata['n_ratings']);
    var html_close_div_rating = "</div>";

    var step = get_value_from_url_var("step");
    if (step == "learn_pref"){
        var html_div_healthy = "<div class=\"recipe-healthy\"></div>";
    } else if (step == "reco"){
        var html_div_healthy = "<div class=\"recipe-healthy\"><img src=\"img/healthiness_"+rdata["FSAcolour"]+".png\" height=\"26px\"></div>";
    }
    
    var description = rdata['description'];
    var html_div_description = "<div class=\"recipe-description overflow\"> " + description + "</div>";
    var html_div_prep = "<div class=\"recipe-prep\">Prep: "+rdata['time_prep']+"</div>";
    var html_div_cook = "<div class=\"recipe-cook\">Cook: "+rdata['time_cook']+"</div>";
    var html_div_total = "<div class=\"recipe-total\">Total: "+rdata['time_total']+"</div>";
    var html_close_div_recipe = "</div>";

    var html = html_open_div_recipe + html_open_div_img + html_img + html_close_div_img + html_div_title + html_open_div_rating + html_rating + html_close_div_rating + html_div_healthy + html_div_description + html_div_prep + html_div_cook + html_div_total + html_close_div_recipe;
    var outter_grid = document.getElementById("outter-grid-container");
    // console.log(html);
    outter_grid.innerHTML += html;

    setTimeout(function(){
        right_click_open_recipe_in_new_tab(rid);
    }, 1000);
}


function chat_guided_hide_and_show_divs(to_hide, to_show){
    var div_to_hide = document.getElementById(to_hide);
    div_to_hide.style = "display:none;"
    var div_to_show = document.getElementById(to_show);
    div_to_show.style = "display:block;"
}

function handle_nochat_message(message){
    console.log("handle_nochat_message");

    if (message != config.confirmed_connection_message && app_global.last_dialog_at != message[FIREBASE_KEYS.DATETIME]){
        // var json_message = JSON.parse(message); 
        app_global.last_dialog_at = message[FIREBASE_KEYS.DATETIME];
        json_message = message;
        var div_reco = document.getElementById("recommendations");
        if (json_message.recipe_card){
            console.log(json_message.recipe_card);
            console.log(json_message.food_recipe);
            // var img_src = json_message.recipe_card;
            var img_src = "https://firebasestorage.googleapis.com/v0/b/coraapp-eba76.appspot.com/o/images%2Fexample.jpg?alt=media&token=f9c05fc6-1c97-4981-8238-96281e9dc0e4";
            var recipe_car_html = "<p id=\"recipe_card\" style=\"text-align:center;\"><img src=\""+img_src+"\" width=\"90%\" /></p>   <p style=\"font-size:10px;\" align=\"right\"><a target=\"_blank\" rel=\"noopener noreferrer\" href=\""+json_message.food_recipe+"\"> See recipe here </a></td>";      
            div_reco.innerHTML += recipe_car_html + "<br><br>";
        }
        div_reco.innerHTML +=  "What do you think about " + json_message.recipe_title + "?<br><br>";

        div_reco.innerHTML += "<center><table><tr><td><label class=\"control control-radio\">I like it<input type=\"radio\" name=\"reco_feedback" + app_global.n_reco + "\" id=\"reco_feedback" + app_global.n_reco + "_like\" value=\"like\"><div class=\"control_indicator\"></div></label></td>";
        div_reco.innerHTML += "<td><label class=\"control control-radio\">I don't like it<input type=\"radio\" name=\"reco_feedback" + app_global.n_reco + "\" id=\"reco_feedback" + app_global.n_reco + "_dislike\" value=\"dislke\"><div class=\"control_indicator\"></div></label></td></tr></table>";
        div_reco.innerHTML += "<br><br>";
        div_reco.innerHTML += "<label class=\"statement-demographics\" id=\"label_comments\">Comments: </label><input class=\"input-demographics\" type=\"text\" name=\"comments" + app_global.n_reco + "\">";
        div_reco.innerHTML += "<br><br>";

        var get_reco_button = document.getElementById("get_reco_button");
        get_reco_button.className = "page_buttons";
        
        if (agent_says_bye(json_message)){
            show_next_page_button();
        }
        // else if (config.turn_by_turn && config.asr_activated == false){
        //     activate_user_input();
        //     setFocusToTextBox();
        // }           
    }
}

function show_next_page_button(){
    var get_reco_button = document.getElementById("get_reco_button");
    var next_page_button = document.getElementById("next_page_button");
    get_reco_button.style = "display:none;"
    next_page_button.style = "display:block;"
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
        return document.getElementById("transcript").value;
    }
    else{
        var user_text_input = document.getElementById("user_text_input");
        return user_text_input.value;
    }
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

//--------                                                Errors                                        --------//
//--------------------------------------------------------------------------------------------------------------//

function server_not_connected_message(){
    console.log("time elapsed "+ app_global.disconnection_timer.timeElapsed.toString());
    console.log("Bool connection timed out: "+(app_global.disconnection_timer.timeElapsed > app_global.connection_timeout).toString());
    console.log("app_global.error: "+app_global.error.toString());
    if ((app_global.disconnection_timer.timeElapsed > app_global.connection_timeout || app_global.error) && !app_global.error_message_posted){
        // setTimeout(function(){
        console.log("Server disconnected error");
        console.log("time out?" + (app_global.disconnection_timer.timeElapsed > app_global.connection_timeout).toString());
        console.log("app_global.error?" + (app_global.error).toString());
        if (is_chat()) chat_error();
        else page_error();
        // },10);
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

//--------                                        Speak and listen mode                                 --------//
//--------------------------------------------------------------------------------------------------------------//

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

//--------                                              Send message                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function on_click_send(){
    // console.log(b.src);
    change_microphone_image("wait");
    console.log("sending msg");
    send_chat();
}


//--------                                       Cora is typing...                                      --------//
//--------------------------------------------------------------------------------------------------------------//

CORA_IS_TYPING_COLOR_CODES = ["#3DDD00", "#59E125", "#78E84D", "#8FEE6A", "#A7F389", "#BCF9A4", "#CCF5BB"]
CORA_IS_TYPING_COLOR_CODES_R = ['61', '89', '120', '143', '167', '188', '204']

function cora_is_typing(){
    set_new_color_to_cora_is_typing(0.72, 0.2);
}

function set_new_color_to_cora_is_typing(C_cmyk_color_to_set, K_cmyk_color_to_set){
    var title_div = document.getElementById('chat_title');
    var RGB = convert_cmyk_to_rgb(C_cmyk_color_to_set, 0, 1, K_cmyk_color_to_set);
    var R = RGB[0];
    var G = RGB[1];
    var B = RGB[2];
    var rgb_color_string = 'rgb(' + R.toString() + "," + G.toString() + "," + B.toString() + ')';
    var new_C = C_cmyk_color_to_set - 0.036;
    var new_K = K_cmyk_color_to_set - 0.01;
    if (new_C < 0) {
        new_C = 0.72;
        new_K = 0.2;
    }
    setTimeout(function(){ title_div.style.color = rgb_color_string; set_new_color_to_cora_is_typing(new_C, new_K);}, 250);
}

function convert_cmyk_to_rgb(C, M, Y, K){
    var R = 255 * (1 - C) * (1 - K);
    var G = 255 * (1 - M) * (1 - K);
    var B = 255 * (1 - Y) * (1 - K);
    return [R, G, B];
}

function convert_rgb_to_cmyk(R, G, B){
    var K = 1 - Math.max(R, G, B);
    var C = (1 - R + K) + (1 - K);
    var M = (1 - G + K) + (1 - K);
    var Y = (1 - B + K) + (1 - K);
    return C, M, Y, K;
}


//--------                                           Terminate chat                                     --------//
//--------------------------------------------------------------------------------------------------------------//

function terminate_conversation(){
    console.log("conversation is over");
    var questionnaire_button = document.getElementById("go_to_questionnaire");
    questionnaire_button.style.display = "block";
    var message_speech = document.getElementById("message_speech"); 
    var message_text = document.getElementById("message_text");
    message_speech.style.display = "none";
    message_text.style.display = "none";
}

//--------                                       Questionnaire pages                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function create_questionnaire(){
    if (app_global.q_id in QUESTIONS){
        for (var key in QUESTIONS[app_global.q_id]){
            // console.log(key,QUESTIONS[key]);
            create_likert_scale(key,QUESTIONS[app_global.q_id][key], label_begin="totally disagree", label_end="totally agree", n_points=7, table_freq_legend=false, center_likert=true);
        }
    }
    else q_id_error();
}

function create_pre_study_questionnaire(){
    for (var key in PRE_STUDY_QUESTIONNAIRE){
        // console.log(key,QUESTIONS[key]);
        create_likert_scale(key,PRE_STUDY_QUESTIONNAIRE[key], true, "Novelty", "Similarity");
    }
}

function create_food_diagnosis_questionnaire(){
    console.log("in create_food_diagnosis_questionnaire");
    html = "";
    for (var key in DIAGNOSIS_FOODS){
        // console.log(key,QUESTIONS[key]);
        q_text = "How frequently do you typically eat " + DIAGNOSIS_FOODS[key] + " for DINNER?";
        html += create_likert_scale(key, q_text, label_begin=null, label_end=null, n_points=7, table_freq_legend=true, center_likert=true);
        if (key=="question10") console.log(html);
    }
}

function create_likert_scale(q_id, q_text, label_begin="totally disagree", label_end="totally agree", n_points=5, table_freq_legend=false, center_likert=false){
    console.log("in create_likert_scale");
    console.log(table_freq_legend);
    questionnaire = document.getElementById("questionnaire");
    html = "\n<label class=\"statement-demographics\" id=\"label_"+q_id+"\">"+replace_agent_name(q_text)+"</label>";
    if (center_likert) html += "<center>";
    // if (table_freq_legend){
    //     html += "\n<table class=\"likert-freq-scale-table\" cellspacing=\"0\" cellpadding=\"0\"><tr><th class=\"tg-xwyw\">Never</th><th class=\"tg-wp8o\">A few<br>times a<br>year</th><th class=\"tg-wp8o\">About<br>once a<br>month</th><th class=\"tg-wp8o\">A few<br>times a<br>month</th><th class=\"tg-wp8o\">About<br>once a<br>week</th><th class=\"tg-wp8o\">A few<br>times a<br>week</th><th class=\"tg-xwyw\">Typically<br>daily</th></tr></table>";
    // }
    if (table_freq_legend){
        var freq_labels = ["Never", "A few<br>times a<br>year", "About<br>once a<br>month", "A few<br>times a<br>month", "About<br>once a<br>week", "A few<br>times a<br>week", "Typically<br>daily"];
    }
    // html += "\n<table>";
    // n_points = 7;
    for (i = 0; i < n_points; i++) {
        // console.log(i, n_points);
        if (i == 0) {
            var div_open = "<div class =\"control-group\">";
            var div_close = "";
            var table_open = "<table width=\"750px\">";
            var tr_open = "\n<tr>" ;
            var table_close = "";
            var tr_close = "";
            if (label_begin == null) {
                var td_label_begin = "";
            }
            else {
                var td_label_begin = "<td width=\"170px\"><br><label class = \"control control-radio\">" + label_begin + "</label></td>\n";
            }
            var td_label_end = "";
        }
        else if (i == n_points -1){
            var div_open = "";
            var div_close = "</div>";
            var table_close = "</table>";
            var tr_close = "\n</tr>";
            var table_open = "";
            var tr_open = "";
            if (label_end == null) {
                var td_label_end = "";
            }
            else {
                var td_label_end = "<td width=\"170px\"><br><label class = \"control control-radio\">" + label_end + "</label></td>\n";
            }
            var td_label_begin = "";
        }
        else {
            var div_open = "";
            var div_close = "";
            var table_open = "";
            var table_close = "";
            var tr_open = "";
            var tr_close = "";
            var td_label_begin = "";
            var td_label_end = "";
            
        }
        if (table_freq_legend == false) {
            var td_width = " width=\"50px\"";
            var tr_legend = "";
        }
        else if (i == 0) {
            var td_width = " width=\"150px\"  style=\"padding-left: 40px\"";
            var tr_legend = "<tr>";
            freq_labels.forEach(add_table_label);
            function add_table_label(item, index) {
                tr_legend += "<td style=\"text-align: center;\">" + item + "</td>";
            }
            tr_legend += "</tr>";
        }
        else {
            var td_width = " width=\"150px\"  style=\"padding-left: 40px\"";
            var tr_legend = "";
        }
        var td_open = "<td " + td_width + ">" ;
        var label_open = "<label class=\"control control-radio\">";
        var input_var = "<input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\">";
        var div_control_indicator = "<div class=\"control_indicator\"></div>";
        var label_close = "</label>";
        var td_close = "</td>";

        if (i == n_points-1) {
            html += div_open + table_open + tr_legend + tr_open + td_label_begin + td_open + label_open + input_var + div_control_indicator + label_close + td_close + td_label_end + tr_close + table_close + div_close + "<br><br>";
            questionnaire.innerHTML += html;
            console.log(html);
            return html;
        }
        else {
            html += div_open + table_open + tr_legend + tr_open + td_label_begin + td_open + label_open + input_var + div_control_indicator + label_close + td_close + td_label_end + tr_close + table_close + div_close;
        }

        // html += "<input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"><label>"+label_begin+"</label>\n</li>";
    
        // else if (i == n_points-1) {
        //     if (table_freq_legend) label_end = freq_labels[i];
        //     html += "\n<li><input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"><label>"+label_end+"</label>\n</li>\n</ul>";
        //     if (center_likert) html += "</center>";
        //     questionnaire.innerHTML += html;
        //     return html;
        // }
        // else {
        //     // l = "lu";
        //     // if (text_labels) l = "";
        //     // else l = i.toString();
        //     if (table_freq_legend) l = freq_labels[i];
        //     else l = "";
        //     html += "\n<li><input type=\"radio\" name=\"likert_"+q_id+"\" value=\""+q_id+"_"+i+"\"><label>"+l+"</label>\n</li>";
        // }
    }
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
            alert("There was a problem with dictation, we could not hear you.\n1 - Check that your green_microphone is on.\n2 - Go to a quiet place / speak louder.\nAlternatively, you can type what you want to say to Cora.");
            change_microphone_image("wait");
        };

    }
}

function set_up_asr_tts(asrtts_bool, callback){
    config.tts_activated = asrtts_bool;
    config.asr_activated = asrtts_bool;
    callback();
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                       AMT VALIDATION CODE                                    --------//
//--------------------------------------------------------------------------------------------------------------//

function amt_validation_code(){
    var amt_div = document.getElementById("AMT_validation_code");
    var code = "VAL"+app_global.clientID;
    amt_div.innerHTML = code;
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                    DEMOGRAPHICS QUESTIONNAIRE                                --------//
//--------------------------------------------------------------------------------------------------------------//



var slider = document.getElementById("height_cm_input");
var output = document.getElementById("height_cm_output");

function init_demogrpahics(){
    // Height
    output.innerHTML = "    cm";
    slider.oninput = function() {
        output.innerHTML = this.value + " cm";
        app_global.answers_demographics["height_unit_cm"] = this.value;
        app_global.answer_demographics_height_cm = this.value;
    }
    var feet_input = document.getElementById("height_unit_feet");
    var inches_input = document.getElementById("height_unit_in");
    feet_input.oninput = function() {
        var feet = this.value;
        convert_to_cm(feet, inches_input.value);
    }
    inches_input.oninput = function() {
        var inches = this.value;
        convert_to_cm(feet_input.value, inches);
        console.log(app_global.answers_demographics);
    }
    // Weight
    var radio_height_unit_cm = document.getElementById("height_unit_cm");
    var radio_height_unit_feet_in = document.getElementById("height_unit_feet_in");
    var div_height_feet_in = document.getElementById("div_height_feet_in");
    var div_heignt_cm = document.getElementById("div_heignt_cm");
    radio_height_unit_cm.onclick = function() {
        if (radio_height_unit_cm.checked){
            div_heignt_cm.style = "display:block;"
            div_height_feet_in.style = "display:none;"
        }
        else {
            div_heignt_cm.style = "display:none;"
            div_height_feet_in.style = "display:block;"
        }
    }
    radio_height_unit_feet_in.onclick = function() {
        if (radio_height_unit_feet_in.checked){
            div_heignt_cm.style = "display:none;"
            div_height_feet_in.style = "display:block;"
        }
        else {
            div_heignt_cm.style = "display:block;"
            div_height_feet_in.style = "display:none;"
        }
    }

    var weight_kg_input = document.getElementById("weight_kg_input");
    var weight_kg_output = document.getElementById("weight_kg_output");
    weight_kg_output.innerHTML = "    kg";
    weight_kg_input.oninput = function() {
        weight_kg_output.innerHTML = this.value + " kg";
        app_global.answers_demographics["weight_unit_kg"] = this.value;
        app_global.answer_demographics_weight_kg = this.value;
    }

    var weight_pounds_input = document.getElementById("weight_pounds_input");
    var weight_pounds_output = document.getElementById("weight_pounds_output");
    weight_pounds_output.innerHTML = "    pounds  (0 kg)";
    weight_pounds_input.oninput = function() {
        var pounds = this.value;
        var kg = Math.round(pounds*0.453592);
        weight_pounds_output.innerHTML = this.value + " pounds  (" + kg + " kg)";

        app_global.answers_demographics["weight_unit_pounds"] = this.value;
        app_global.answers_demographics["weight_unit_kg"] = kg;
        app_global.answer_demographics_weight_kg = kg;
    }

    var weight_stones_input = document.getElementById("weight_stones_input");
    var weight_stones_output = document.getElementById("weight_stones_output");
    weight_stones_output.innerHTML = "    stones 0 lb";
    weight_stones_input.oninput = function() {
        var stones_decimal = this.value;
        var stones_int = Math.floor(stones_decimal);
        var lb = Math.floor((stones_decimal - stones_int) * 14);
        var kg = Math.round(stones_decimal * 6.35029);
        var stones_lb = stones_int + " stones " + lb + " lb"
        weight_stones_output.innerHTML = stones_lb + "  (" +kg + " kg)";

        app_global.answers_demographics["weight_unit_stones"] = this.value;
        app_global.answers_demographics["weight_unit_stones_lb"] = stones_lb;
        app_global.answers_demographics["weight_unit_kg"] = kg;
        app_global.answer_demographics_weight_kg = kg;
    }

    var radio_weight_unit_kg = document.getElementById("weight_unit_kg");
    var radio_weight_unit_pounds = document.getElementById("weight_unit_pounds");
    var radio_weight_unit_stones = document.getElementById("weight_unit_stones");
    var div_weight_unit_kg = document.getElementById("div_weight_kg");
    var div_weight_unit_pounds = document.getElementById("div_weight_pounds");
    var div_weight_unit_stones = document.getElementById("div_weight_stones");

    radio_weight_unit_kg.onclick = function(){
        onclick_weight_display(radio_weight_unit_kg, div_weight_unit_kg, div_weight_unit_pounds, div_weight_unit_stones);
    }
    radio_weight_unit_pounds.onclick = function(){
        onclick_weight_display(radio_weight_unit_pounds, div_weight_unit_pounds, div_weight_unit_kg, div_weight_unit_stones);
    }
    radio_weight_unit_stones.onclick = function(){
        onclick_weight_display(radio_weight_unit_stones, div_weight_unit_stones, div_weight_unit_kg, div_weight_unit_pounds);
    }

}


function convert_to_cm(feet, inches){
    console.log("in convert_to_cm");
    console.log(feet);
    console.log(inches);
    if (feet != "" && inches != ""){
        var cm = 30.48*feet + 2.54*inches;
        app_global.answers_demographics["height_unit_cm"] = cm;
        app_global.answers_demographics["height_unit_feet_in"] = feet.toString() + " feet " + inches.toString() + " inches";
        app_global.answer_demographics_height_cm = cm;
    }
}

function onclick_weight_display(radio_id, to_display, to_hide1, to_hide2){
    console.log("in onclick_weight_display, radio_id = " + radio_id);
    if (radio_id.checked){
        to_display.style = "display:block;";
        to_hide1.style = "display:none;"
        to_hide2.style = "display:none;"
    }
}

function get_demographics_answers(){
    
    var inputs = document.getElementsByTagName("input");
    console.log(app_global);
    app_global.answers_demographics["employment"] = [];
    app_global.answers_demographics["diets"] = [];
    for (var i=0; i < inputs.length; i++){
        var input = inputs[i];
        var key = input.name;
        if (input.type == "radio"){
            if (!(key in app_global.answers_demographics)) app_global.answers_demographics[key] = undefined;
            if (input.checked) {
                app_global.answers_demographics[key] = input.value;
            }
        }
        else if (input.type == "checkbox"){
            if (input.checked){
                // console.log(input.value + " is checked!");
                app_global.answers_demographics[key].push(input.value);
            }
        }
        else if (input.type != "range"){
            app_global.answers_demographics[key] = input.value;
        }
        // check answers
        if (i == (inputs.length - 1)) {
            check_answers_demographics();
        }
    }
}

function check_answers_demographics(){
    console.log(app_global.answers_demographics);
    var alert_bool = false;
    for (var j in app_global.answers_demographics){
        var label = document.getElementById("label_"+j);
        if (app_global.answers_demographics[j] == undefined || app_global.answers_demographics[j]=="") {
            alert_bool = true;
            label.style = "color:red;font-weight:bold;"
        }
        else {
            if (label == null) console.log("Cannot change style of "+ j+" as it does not exist!");
            else label.style = "";
        }
        if (j == "weight_unit" || j == "height_unit"){
            if (app_global.answers_demographics[j] == "feet_in"){
                console.log("Check for feet and inches")
            }
            else {
                if (app_global.answers_demographics[j]!=undefined){
                    var key_to_check_for = j+"_"+app_global.answers_demographics[j];
                    var label2 = document.getElementById("label_"+key_to_check_for);
                    if (!(app_global.answers_demographics[key_to_check_for])){
                        alert_bool = true;
                        label2.style = "color:red;font-weight:bold;"
                    }
                    else {
                        if (label2 == null) console.log(j);
                        label2.style = "";
                    }
                }
            }
        }
    }
    if (alert_bool == true) {
        console.log("alert");
        window.scrollTo(0,0);
        alert("You must answer all the questions");
    }
    else send_data_collection(app_global.answers_demographics, FIREBASE_KEYS.DEMOGRPAHICS);
}

function init_nochat(){
    console.log("in init_nochat");
    var slider_hungry = document.getElementById("hungry_input");
    app_global.answers_nochat["hungry"] = undefined;
    slider_hungry.oninput = function() {
        app_global.answers_nochat["hungry"] = this.value;
    }
    var slider_healthy = document.getElementById("healthy_input");
    app_global.answers_nochat["healthy"] = undefined;
    slider_healthy.oninput = function() {
        app_global.answers_nochat["healthy"] = this.value;
    }
    var slider_time = document.getElementById("time_input");
    app_global.answers_nochat["time"] = undefined;
    slider_time.oninput = function() {
        app_global.answers_nochat["time"] = this.value;
    }
}
function get_nochat_answers(){
    
    var inputs = document.getElementsByTagName("input");
    console.log(inputs);
    console.log(app_global);
    for (var i=0; i < inputs.length; i++){
        var input = inputs[i];
        var key = input.name;
        console.log(key);
        if (input.type == "radio"){
            if (!(key in app_global.answers_nochat)) app_global.answers_nochat[key] = undefined;
            if (input.checked) {
                app_global.answers_nochat[key] = input.value;
            }
        }
        else if (input.type != "range"){
            app_global.answers_demographics[key] = input.value;
        }
        // check answers
        if (i == (inputs.length - 1)) {
            check_answers_no_chat();
        }
    }
    console.log(app_global.answers_nochat);
}

function check_answers_no_chat(){
    console.log(app_global.answers_nochat);
    var alert_bool = false;
    for (var j in app_global.answers_nochat){
        var label = document.getElementById("label_"+j);
        if (app_global.answers_nochat[j] == undefined || app_global.answers_nochat[j]=="") {
            alert_bool = true;
            label.style = "color:red;font-weight:bold;"
        }
        else {
            if (label == null) console.log("Cannot cahge style of "+ j+" as it does not exist!");
            else label.style = "";
        }
    }
    if (alert_bool == true) {
        console.log("alert");
        window.scrollTo(0,0);
        alert("You must answer all the questions");
    }
    else {

        var get_reco_button = document.getElementById("get_reco_button");
        get_reco_button.className = "page_buttons_notclickable";
        send_data_collection(app_global.answers_nochat, FIREBASE_KEYS.NOCHAT);
    }
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                    ALERT FOR SPEAK AND LISTEN                                --------//
//--------------------------------------------------------------------------------------------------------------//

function alert_speak_listen() {
    if (confirm("I have authorized this website to access my microphone and I am ready to continue.")){
        set_up_asr_tts(true, go_to_next_page);
    }
    else {
        var div_explain_msg = document.getElementById("cant_allow_access_for_microphone");
        div_explain_msg.style = "display:block;";
    }
}

function check_test_audio(callback){
    var user_input = document.getElementById("audio_test");
    user_input = user_input.value.toLowerCase();
    var index_test = user_input.indexOf("test");
    var play_audio_instructions = document.getElementById("play_audio_instructions");
    var play_audio_instructions_alert = document.getElementById("play_audio_instructions_alert");
    if (index_test >= 0){
        play_audio_instructions.style = "display:block;";
        play_audio_instructions_alert.style = "display:none;";
        callback();
    }
    else {
        if (user_input.length == 0){
            play_audio_instructions.style = "color:red;font-weight:bold;display:block;";
            play_audio_instructions_alert.style = "color:red;font-weight:bold;display:none;";
        }
        else{
            play_audio_instructions.style = "display:none;";
            play_audio_instructions_alert.style = "color:red;font-weight:bold;display:block;";
        }
    }

}

function click_button_event(){
    console.log("button clicked");
}


//--------------------------------------------------------------------------------------------------------------//
//--------                                          CHAT GUIDED                                         --------//
//--------------------------------------------------------------------------------------------------------------//

function chat_guided_setup_onclick_event(){
    var buttons = document.getElementsByTagName('button');
    directly_send_message_buttons_types = ['mood', 'healthiness', 'hungriness', 'time', "hello", "none", "r_feedback", "request_more"];
    directly_send_message_buttons_types.forEach(function(elt){
        for (var i = 0; i < buttons.length; i++){
            let b_elt = buttons[i];
            if (b_elt.id.includes(elt)){
                b_elt.addEventListener("click", function(){
                    var chat_msg = b_elt.innerText || b_elt.textContent;
                    send_chat(chat_msg);
                    chat_guided_wait_for_coras_answer();
                });
            }
        };
    });
    set_up_ingredients_selection();
    set_up_diet_intolerances_selection();
    set_up_usual_dinner_selection();
    set_up_why_usual_dinner();
    set_up_user_name_input();
}

function set_text_in_paragraph(val, p, text_before_val, text_after_val = ""){
    var inner_text = (p.innerText || p.textContent);
    console.log(inner_text);
    if (p.innerHTML == ""){
        p.innerHTML = text_before_val + val + text_after_val;
    }
    else {
        var inner_text_trimed = inner_text.trim();
        if (text_after_val != ""){
            var inner_text_removed_end = inner_text_trimed.replace(text_after_val, "");
            p.innerHTML = inner_text_removed_end + ", " + val + text_after_val;
        }
        else p.innerHTML = inner_text_trimed + ", " + val;
    }
    console.log(val);
}

function set_up_usual_dinner_selection(){
    var dropup_elements = document.getElementsByTagName('a');
    dropup_elements_ids = ["usual_dinner_options"];
    dropup_elements_ids.forEach(function(elt){
        // console.log(elt);
        for (var i = 0; i < dropup_elements.length; i++){
            let b_elt = dropup_elements[i];
            // console.log(b_elt);
            if (b_elt.id.includes(elt)){
                b_elt.addEventListener("click", function(){
                    console.log(b_elt);
                    var is_cuisine_or_dinner_char = false;
                    CUSINES.forEach(function(cuisine){
                        if (b_elt.id.includes(cuisine)){
                            var cuisine_p = document.getElementById("usual_dinner_cuisine_text");
                            var val = b_elt.innerHTML;
                            set_text_in_paragraph(val, cuisine_p, "I usually eat ", " food");
                            is_cuisine_or_dinner_char = true;
                        }
                    });
                    CHARACTERISTICS_USUAL_DINNER.forEach(function(char){
                        if (b_elt.id.includes(char)){
                            var char_p = document.getElementById("usual_dinner_characterisctics_text");
                            var val = b_elt.innerHTML;
                            set_text_in_paragraph(val, char_p, "My dinner is usually ");
                            is_cuisine_or_dinner_char = true;
                        }
                    });
                    if (!is_cuisine_or_dinner_char){
                        var ingredients_p = document.getElementById("usual_dinner_ingredients_text");
                        var val = b_elt.innerHTML;
                        set_text_in_paragraph(val, ingredients_p, "I usually eat ", "<br><br>");
                    }
                });
            }
        };
    });
    var button_validate_selection = document.getElementById("usual_dinner_options_validate_selection");
    button_validate_selection.onclick = function (){
        var char_text_div = document.getElementById("usual_dinner_characterisctics_text");
        var cuisine_text_div = document.getElementById("usual_dinner_cuisine_text");
        var ingredients_text_div = document.getElementById("usual_dinner_ingredients_text");
        // start with dinner characteristics
        var msg = (char_text_div.innerText || char_text_div.textContent);
        // add cuisines
        if (msg != "") msg += "<br>" + (cuisine_text_div.innerText || cuisine_text_div.textContent);
        else msg = (cuisine_text_div.innerText || cuisine_text_div.textContent);
        // add ingredients
        if (msg != "") msg += "<br>" + (ingredients_text_div.innerText || ingredients_text_div.textContent);
        else msg = (ingredients_text_div.innerText || ingredients_text_div.textContent);
        // text_div.style = "display:none;"
        send_chat(msg);
        chat_guided_wait_for_coras_answer();
    };
}

function set_up_user_name_input(){
    var user_name = document.getElementById("user_name");
    user_name.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            send_user_name();
        }
    });
    var validate_button = document.getElementById("validate_user_name");
    validate_button.onclick = function(){
        send_user_name();
    };
}

function send_user_name(){
    user_name = document.getElementById("user_name").value;
    if (user_name == ""){
        alert("Please enter your name");
    }
    else{
        send_chat("My name is "+user_name);
        chat_guided_wait_for_coras_answer();
    }
}

function set_up_ingredients_selection(){
    var dropup_elements = document.getElementsByTagName('a');
    dropup_elements_ids = ["ingredients_options"];
    dropup_elements_ids.forEach(function(elt){
        for (var i = 0; i < dropup_elements.length; i++){
            let b_elt = dropup_elements[i];
            if (b_elt.id.includes(elt)){
                b_elt.addEventListener("click", function(){
                    // console.log(b_elt);
                    var val = b_elt.innerHTML;
                    var ingredients_text_div = document.getElementById("selected_ingredients_text");
                    var inner_text = (ingredients_text_div.innerText || ingredients_text_div.textContent);
                    console.log(inner_text);
                    if (ingredients_text_div.innerHTML == ""){
                        ingredients_text_div.innerHTML = "I would like " + val + "<br><br>";
                    }
                    else ingredients_text_div.innerHTML =  inner_text.trim() + ", " + val + "<br><br>";
                    console.log(val);
                });
            }
        };
    });
    var button_validate_ingredients_selection = document.getElementById("ingredients_options_validate_selection");
    button_validate_ingredients_selection.onclick = function (){
        var text_div = document.getElementById("selected_ingredients_text");
        var msg = text_div.innerText || text_div.textContent;
        text_div.style = "display:none;"
        send_chat(msg);
        chat_guided_wait_for_coras_answer();
    };
}

function set_up_why_usual_dinner(){
    var dropup_elements = document.getElementsByTagName('a');
    dropup_elements_ids = ["why_usual_dinner_options"];
    dropup_elements_ids.forEach(function(elt){
        for (var i = 0; i < dropup_elements.length; i++){
            let b_elt = dropup_elements[i];
            if (b_elt.id.includes(elt)){
                b_elt.addEventListener("click", function(){
                    // console.log(b_elt);
                    var val = b_elt.innerHTML;
                    var why_usual_dinner_text_div = document.getElementById("why_usual_dinner_text");
                    var inner_text = (why_usual_dinner_text_div.innerText || why_usual_dinner_text_div.textContent);
                    console.log(inner_text);
                    if (why_usual_dinner_text_div.innerHTML == ""){
                        why_usual_dinner_text_div.innerHTML = "I like it because " + val + "<br><br>";
                    }
                    else why_usual_dinner_text_div.innerHTML =  inner_text.trim() + ", " + val + "<br><br>";
                    console.log(val);
                });
            }
        };
    });
    var button_validate_selection = document.getElementById("why_usual_dinner_options_validate_selection");
    button_validate_selection.onclick = function (){
        var text_div = document.getElementById("why_usual_dinner_text");
        var msg = text_div.innerText || text_div.textContent;
        text_div.style = "display:none;"
        send_chat(msg);
        chat_guided_wait_for_coras_answer();
    };
}

function set_up_diet_intolerances_selection(){
    console.log("set_up_diet_intolerances_selection");
    var dropup_elements = document.getElementsByTagName('a');
    dropup_elements_ids = ["diets_intolerances"];
    dropup_elements_ids.forEach(function(elt){
        for (var i = 0; i < dropup_elements.length; i++){
            let b_elt = dropup_elements[i];
            // console.log(b_elt.id);
            if (b_elt.id.includes("diet")){
                console.log("seting up diet");
                onclick_diet(b_elt);
            }
            else if(b_elt.id.includes("intolerance")){
                console.log("seting up intolerances");
                onclick_intolerance(b_elt);
            }
        };
    });
    var button_validate_ingredients_selection = document.getElementById("diets_intolerances_validate_selection");
    button_validate_ingredients_selection.onclick = function (){
        var diet_text_div = document.getElementById("diet_text");
        var intolerance_text_div = document.getElementById("intolerances_text");
        // var msg = text_div.innerText || text_div.textContent;
        var msg = (diet_text_div.innerText || diet_text_div.textContent);
        if (msg != "") msg += "<br>" + (intolerance_text_div.innerText || intolerance_text_div.textContent);
        else msg = (intolerance_text_div.innerText || intolerance_text_div.textContent);
        diet_text_div.style = "display:none;"
        intolerance_text_div.style = "display:none;"
        send_chat(msg);
        chat_guided_wait_for_coras_answer();
    };
}

function onclick_diet(b_elt){
    b_elt.addEventListener("click", function(){
        var val = b_elt.innerHTML;
        var diet_text_div = document.getElementById("diet_text");
        var br_div = document.getElementById("br_div");
        var inner_text = (diet_text_div.innerText || diet_text_div.textContent);
        console.log(inner_text);
        if (diet_text_div.innerHTML != ""){
            alert("You can only have one specific diet.")
        }
        diet_text_div.innerHTML = "I have a " + val + " diet";
        br_div.innerHTML = "<br><br>";
        console.log(val);
    });
}

function onclick_intolerance(b_elt){
    b_elt.addEventListener("click", function(){
        var val = b_elt.innerHTML;
        var intolerance_text_div = document.getElementById("intolerances_text");
        var br_div = document.getElementById("br_div");
        var inner_text = (intolerance_text_div.innerText || intolerance_text_div.textContent);
        console.log(inner_text);
        if (intolerance_text_div.innerHTML == ""){
            intolerance_text_div.innerHTML = "I am intolerant to " + val;
        }
        else intolerance_text_div.innerHTML =  inner_text.trim() + ", " + val;
        br_div.innerHTML = "<br>";
        console.log(val);
    });
}

function chat_guided_wait_for_coras_answer(){
    var divs_to_hide_ids = ["user_name_div", "mood_div", "usual_dinner_div", "why_usual_dinner_div", "healthiness", "hungriness", "time", "r_feedback", "request_more", "ingredients_options", "hello_cora_div", "diets_intolerances"];
        divs_to_hide_ids.forEach(function(div_elt_id){
            var div_elt = document.getElementById(div_elt_id);
            div_elt.style = "display:none";
    });
    var div_wait_for_answer = document.getElementById("wait_answer");
    div_wait_for_answer.style = "display:block;"
}

function set_up_ingredients_list(ingredients_list, callback){
    dropup_disliked_ingredients_btn = document.getElementById("r_feedback_no_ingredient");
    var div_dropup_content_disliked_ingredients = document.getElementById("no_ingredient_dropup-content");
    div_dropup_content_disliked_ingredients.innerHTML = "";
    if (ingredients_list){
        var i = 0;
        ingredients_list.forEach(function(elt){
            console.log(elt);
            div_dropup_content_disliked_ingredients.innerHTML += "<a href=\"#\" id=\"disliked_ingredient_"+i+"\">"+elt+"</a>";
            // a(href="#" id=btn_id+"_"+elt)=elt
            i += 1;
        });
        callback();
    }
}

function set_up_onclick_ingredients_list(){
    var dropup_elements = document.getElementsByTagName('a');
    for (var i = 0; i < dropup_elements.length; i++){
        let b_elt = dropup_elements[i];
        // console.log(b_elt.id);
        if (b_elt.id.includes("disliked_ingredient_")){
            console.log("seting up diet");
            onclick_disliked_ingredient(b_elt);
        }
    };
}

function onclick_disliked_ingredient(b_elt){
    b_elt.addEventListener("click", function(){
        var val = b_elt.innerHTML;
        var msg = "No, I don't like " + val;
        send_chat(msg);
        chat_guided_wait_for_coras_answer();
    });
}

//--------------------------------------------------------------------------------------------------------------//
//--------                                           EVAL RECO SYSTEM                                   --------//
//--------------------------------------------------------------------------------------------------------------//


function rating_fct(rid, rating){
    var div_to_hide = document.getElementById("rs_eval_div");
    div_to_hide.style = "display:none";

    if (!app_global.recipes_rate){
        app_global.recipes_rate = {};
        app_global.recipes_rate[rid] = rating;
    }
    else{
        app_global.recipes_rate[rid] = rating
    }
    // console.log(app_global.recipes_rate);
    setTimeout(display_new_recipe, 1000); 
}

function selectRecipe(rid, domID){
    var grid_cell = document.getElementById(domID);
    // select
    if (grid_cell.classList.contains('igc-border')) {
        grid_cell.classList.remove('igc-border');
        grid_cell.classList.add('igc-clicked-border');
        app_global.rs_user_pref.push(domID);
    }
    // deselect
    else if (grid_cell.classList.contains('igc-clicked-border')) {
        grid_cell.classList.remove('igc-clicked-border');
        grid_cell.classList.add('igc-border');
        const index = app_global.rs_user_pref.indexOf(domID);
        if (index > -1) {
            app_global.rs_user_pref.splice(index, 1);
        }
    }
}

function save_user_pref(callback){
    console.log(app_global.rs_user_pref);
    var n_selected = app_global.rs_user_pref.length;
    if (n_selected >= 5){
        // send_dialog(app_global.rs_right_clicks);
        send_dialog(app_global.rs_user_pref);
        callback();
    }
    else {//if (n_selected < 5){
        console.log("alert");
        window.scrollTo(0,0);
        alert("Please select exactly 5 recipes (you selected "+ n_selected.toString()+ ").");
    }
    // else {
    //     console.log("alert");
    //     window.scrollTo(0,0);
    //     alert("Please select exactly 5 recipes (you selected "+ n_selected.toString()+ ").");
    // }
}

function display_satisfaction_questionnaire(){
    
    app_global.rs_user_pref.forEach(function(val, index){
        var div_to_show = document.getElementById("satisfaction_questionnaire");
        var div_to_hide = document.getElementById("questionnaire_wrap");
        var div_to_append_html = document.getElementById("outter-grid-container-chosen");
        var id = val;
        var div_code = document.getElementById(id);
        console.log(div_code);
        var html_open_div_recipe = "<div class=\"inner-grid-container-unclickable igc-border-unclickable\" id=\""+id+"_chosen\">";
        var html = html_open_div_recipe + div_code.innerHTML + "</div";
        div_to_append_html.innerHTML += html;

        if (index == 0){
            var qtext1 = "How satisfied are your with your choice?"
            var qtext2 = "How easy was it for you to make this choice?"
            create_likert_scale("satisfaction", qtext1, label_begin="Totally dissatisfied", label_end="Totally satisfied", n_points=7, table_freq_legend=false, center_likert=true);
            create_likert_scale("easiness", qtext2, label_begin="Extremely difficult", label_end="Extremely easy", n_points=7, table_freq_legend=false, center_likert=true);

        }

        if (index == 4){
            window.scrollTo(0,0);
            div_to_hide.style = "display:none;";
            div_to_show.style = "display:block";
            // go_to_next_page();
        }
    });
}

function get_value_radio(radio_id){
    var radios = document.getElementsByName(radio_id);
    for (var i = 0, length = radios.length; i < length; i++){
        if (radios[i].checked){
            var splited_text = radios[i].value.split("_")
            var a = splited_text[splited_text.length-1]
            // answers[key] = a;
            console.log(a);
            return a;
        }
    }
}

function check_val(v, label_id){
    if (v == undefined || v == ""){
        alert_bool = true;
        var label = document.getElementById("label_"+label_id);
        label.style = "color:red;font-weight:bold;";
        return false;
    } else {
        app_global.answer_rs_satisfaction[label_id] = v;
        return true;
    }
}

function get_answers_satisfaction_questionnaire(callback){
    var alert_bool = false;
    var v = get_value_radio('likert_satisfaction');
    var v2 = get_value_radio('likert_easiness');
    var v3 = document.getElementById("free_text_choice_influence").value;
    if (check_val(v, "satisfaction") && check_val(v2, "easiness") && check_val(v3, "influence")){
        send_data_collection(app_global.answer_rs_satisfaction, FIREBASE_KEYS.RS_SATISFACTION);
    }
    else {
        alert("Please answer all questions");
    }
}

// function check_answers_satisfaction_questionnaire(){
//     var alert_bool = false;
//     if (app_global.answer_rs_satisfaction.satisfaction == undefined || app_global.answer_rs_satisfaction.satisfaction==""){
//         alert_bool = true;
//         var label = document.getElementById("label_satisfaction");
//         label.style = "color:red;font-weight:bold;";
//     }    
// }

function get_rs_food_questionnaire_answers(){
    var inputs = document.getElementsByName("whats_important");
    for (var i=0; i < inputs.length; i++){
        var input = inputs[i];
        if (input.checked){
            console.log(input.value + " is checked!");
            app_global.answer_rs_post_study.whats_important.push(input.value);
        }
    }
    var free_comment_input = document.getElementById("free_text_whats_important");
    app_global.answer_rs_post_study.free_comment = free_comment_input.value;
    check_answers_rs_food_questionnaire();
}

function check_answers_rs_food_questionnaire(){
    if (app_global.answer_rs_post_study.whats_important.length == 0){
        console.log("alert");
        window.scrollTo(0,0);
        alert("Please select at least one answer");
    }
    else {
        // console.log(app_global.answer_rs_post_study.whats_important);
        send_data_collection(app_global.answer_rs_post_study, FIREBASE_KEYS.RS_POSTSTUDYANSWERS);
    }
}

function openInNewTab(url) {
    // var win = window.open(url, '_blank');
    // preventDefault();
    // win.focus();
    right_click_open_recipe_in_new_tab("recipe1");
  }


// var recipe1_div = document.getElementById("recipe1");
// if (recipe1_div.addEventListener) {
//     console.log("if");
//     console.log(recipe1_div);
//     recipe1_div.addEventListener('contextmenu', function(e) {
//         console.log("if2");
//         alert("You've tried to open context menu"); //here you draw your own menu
//         e.preventDefault();
//     }, false);
// } else {
//     console.log("else");
//     recipe1_div.attachEvent('oncontextmenu', function() {
//         console.log("else2");
//         alert("You've tried to open context menu");
//         window.event.returnValue = false;
//     });
// }

function right_click_open_recipe_in_new_tab(rid){
    var recipe1_div = document.getElementById(rid);
    if (recipe1_div.addEventListener) {
        console.log(recipe1_div);
        recipe1_div.addEventListener('contextmenu', function(e) {
            // console.log("open link in new window");
            // alert("You've tried to open context menu"); //here you draw your own menu
            var url = "https://www.allrecipes.com/recipe/" + rid;
            app_global.rs_right_clicks.push(rid);
            window.open(url, '_blank');
            e.preventDefault();
        }, false);
    } else {
        console.log("else");
        recipe1_div.attachEvent('oncontextmenu', function() {
            alert("You've tried to open context menu");
            window.event.returnValue = false;
        });
    }
    // }, 500);
}