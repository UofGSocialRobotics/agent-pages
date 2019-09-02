function startDownload() {
  let imageURL = "http://webknox.com/recipeCardImages/recipeCard-1567008088398.png?";
 
  downloadedImg = new Image;
  downloadedImg.crossOrigin = "Anonymous";
  downloadedImg.addEventListener("load", imageReceived, false);
  downloadedImg.src = imageURL;
}

startDownload();

function imageReceived() {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");

  canvas.width = downloadedImg.width;
  canvas.height = downloadedImg.height;
 
  context.drawImage(downloadedImg, 0, 0);
  imageBox.appendChild(canvas);
 
  try {
    localStorage.setItem("saved-image-example", canvas.toDataURL("image/png"));
  }
  catch(err) {
    console.log("Error: " + err);
  }  
}