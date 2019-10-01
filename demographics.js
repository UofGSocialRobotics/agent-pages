
var app_global = {
    answers_demographics : {},
    answer_demographics_weight_kg : undefined,
    answer_demographics_height_cm : undefined
};
console.log(app_global.answers_demographics);

var slider = document.getElementById("height_cm_input");
var output = document.getElementById("height_cm_output");
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
    convert_to_cm(feet_input.input, inches);
    console.log(app_global.answers_demographics);
}
function convert_to_cm(feet, inches){
    console.log("in convert_to_cm");
    console.log(feet, inches);
    if (feet != undefined && inches != undefined){
        var cm = 30.48*feet + 2.54*inches;
        app_global.answers_demographics["height_unit_cm"] = cm;
        app_global.answers_demographics["height_unit_feet_in"] = feet.toString() + " feet " + inches.toString() + " inches";
        app_global.answer_demographics_height_cm = cm;
    }
}

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
            if (label == null) console.log("Cannot cahge style of "+ j+" as it does not exist!");
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
}