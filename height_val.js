var slider = document.getElementById("height_cm_input");
var output = document.getElementById("height_cm_output");
output.innerHTML = "    cm";

slider.oninput = function() {
  output.innerHTML = this.value + " cm";
}