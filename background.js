"use strict";

function handleError(err) {
  console.log(`Error: ${err}`);
}

browser.commands.onCommand.addListener((command) => {
  if (command === "popup-window") {  
    browser.windows.create({
      url: "public/popup_window.html",
      type: "popup",
      height:300,
      width: 300, 
    })   
    .catch(handleError);
  } 
});
  
  
  
  
  
  
  
  
  
  