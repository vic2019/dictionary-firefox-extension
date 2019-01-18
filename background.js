"use strict";

function handleError(err) {
  console.log(`Error: ${err}`);
}

function handleMessage(msg) {
  selectedText = msg;
}

let selectedText = null;

browser.runtime.onMessage.addListener(handleMessage);
browser.commands.onCommand.addListener((command) => {
  if (command === "popup-window" && selectedText) {

    console.log(selectedText);

    browser.windows.create({
      url: "public/popup_window.html",
      type: "popup",
      height: 300,
      width: 300, 
    })
    .catch(handleError);
  } 
});
  
  
  
  
  
  
  
  
  
  