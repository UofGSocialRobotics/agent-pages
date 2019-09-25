var slider = document.getElementById("height_cm_input");
var output = document.getElementById("height_cm_output");
output.innerHTML = "    cm";
slider.oninput = function() {
  output.innerHTML = this.value + " cm";
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
}

var weight_pounds_input = document.getElementById("weight_pounds_input");
var weight_pounds_output = document.getElementById("weight_pounds_output");
weight_pounds_output.innerHTML = "    pounds  (0 kg)";
weight_pounds_input.oninput = function() {
  var pounds = this.value;
  var kg = Math.round(pounds*0.453592);
  weight_pounds_output.innerHTML = this.value + " pounds  (" + kg + " kg)";
}

var weight_stones_input = document.getElementById("weight_stones_input");
var weight_stones_output = document.getElementById("weight_stones_output");
weight_stones_output.innerHTML = "    stones 0 lb";
weight_stones_input.oninput = function() {
  var stones_decimal = this.value;
  var stones_int = Math.floor(stones_decimal);
  var lb = Math.floor((stones_decimal - stones_int) * 14);
  var kg = Math.round(stones_decimal * 6.35029);
  weight_stones_output.innerHTML = stones_int + " stones " + lb + " lb  (" +kg + " kg)";
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