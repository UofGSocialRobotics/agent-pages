

var options_list = [
    ["something_new", "something new"], 
    ["detailed_instructions", "a recipe with detailed instructions"],  
    ["picture", "a recipe with a beautiful picture of the dish"],  
    ["video", "a recipe that has a tutorial video attached"], 
    ["input_recipes", "to provide the system with a few recipes I like so that it finds something similar"], 
    ["input_ingredients", "to provide the system with ingredients I want to cook"], 
    ["input_dishname", "to provide the system with the name of the dish I want to cook (for example lasagna)"], 
    ["input_time", "to provide the system with how much time I have"], 
    ["input_cuisine", "to provide the system with a type of cuisine (for example Italian)"], 
    ["input_n_servings", "to provide the system with the number of servings so that quantities of ingredients are automatically calculated"], 
    ["input_NO_ingredients", "to provide the system with ingredients I don't have or don't want in the recipe"], 
    ["input_diet", "to provide the system with a specific diet (for example vegan)"], 
    ["input_calories_nutriments", "to provide the system with a minimum or maximum number for calories or nutrients (for example salt) in the dish"], 
    ["input_healthy", "to specify how healthy I want to meal to be (for example not at all, slightly, very)"], 
    ["input_price", "to provide the system with a maximum price for all the ingredients"], 
    ["input_chef", "to specify the name of a chef whose recipes I would prefer"],
    ["ratings", "to have some control over the recipes' ratings, for example by ordering recipes by their ratings"],
    ["reviews", "to be able to check the reviews of the recipes"],
    ['difficulty', 'to provide the system with a level of difficulty']
]


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

shuffle(options_list);


var div_form = document.getElementById("questionnaire");
var innerHTML = "<label class=\"statement-demographics\" id=\"label_whats_important\"><i><b>When I look for a recipe on the web], I would prefer...</b></i></label><br><br>";

for (var i = 0; i < options_list.length; i++){
    var v = options_list[i][0];
    var t = options_list[i][1];
    innerHTML += "<div class=\"control-group\"><label class=\"control control-checkbox\">" + t + "<input type=\"checkbox\" name=\"whats_important\" value="+v+"></input><div class=\"control_indicator\"></div></label>";

    if (i == (options_list.length - 1)){
        innerHTML += "<br><br><br><span class=\"statement-demographics\">Is there anything else not listed above that is important to you when looking for a recipe?</span><br><br><textarea cols=\"100\" rows=\"5\" id=\"free_text_whats_important\" placeholder=\"Tell us here\"></textarea></form>";
    }
}

div_form.innerHTML = innerHTML;

console.log("randomizing options order of display");