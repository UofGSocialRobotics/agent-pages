var radio_chrome = document.getElementById("browser_chrome");
var radio_not_chrome = document.getElementById("browser_not_chrome");
var div_instructions_chrome = document.getElementById("instructions_chrome");
var div_instructions_not_chrome = document.getElementById("instructions_not_chrome");
radio_chrome.onclick = function() {
    if (radio_chrome.checked){
        div_instructions_chrome.style = "display:block;"
        div_instructions_not_chrome.style = "display:none;"
    }
    else {
        div_instructions_chrome.style = "display:none;"
        div_instructions_not_chrome.style = "display:block;"
        var span_current_page = document.getElementById("current_address");
        span_current_page.innerHTML = window.location.href;
    }
}
radio_not_chrome.onclick = function() {
    if (radio_not_chrome.checked){
        div_instructions_chrome.style = "display:none;"
        div_instructions_not_chrome.style = "display:block;"
        var span_current_page = document.getElementById("current_address");
        span_current_page.innerHTML = window.location.href;
    }
    else {
        div_instructions_chrome.style = "display:block;"
        div_instructions_not_chrome.style = "display:none;"
    }
}

// var span_current_page = document.getElementById("current_address");
// span_current_page.innerHTML = window.location.href;

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position="fixed";  //avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
      alert("Address copied to clipboard.");
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert("Cannot copy automativally.\nSelect address, right click and select Copy.");
    }
  
    document.body.removeChild(textArea);
}
function copyTextToClipboard() {
    text = window.location.href;
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
        alert("Address copied to clipboard.");
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
        alert("Cannot copy automativally.\nSelect address, right click and select Copy.");
    });
}
  