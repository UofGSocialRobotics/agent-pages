window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    document.getElementById("header").style.fontSize = "30px";
    // document.getElementById("header").innerHTML = "CORA: the COnversational Relational Agent"
    document.getElementById("header").innerHTML = "<img src=\"img/cora_light_bg.png\" height=\"100px\" align=\"left\" style=\"padding-left:20%;\"><div id=\"header_text_small\">CORA: the COnversational Relational Agent</div>";
  } else {
    document.getElementById("header").style.fontSize = "90px";
    document.getElementById("header").innerHTML = "<img src=\"img/cora_light_bg.png\" height=\"300px\" align=\"left\" style=\"padding-left:50px;\"><div id=\"header_text\">CORA: the COnversational <br>Relational Agent</div>";
  }
}