"use strict";

// function onCreated(windowInfo) {
//   console.log(`Created window: ${windowInfo.id}`);
// }

// function onError(error) {
//   console.log(`Error: ${error}`);
// }

browser.commands.onCommand.addListener((command) => {
  if (command === "popup-window") {
    const createWindow = browser.windows.create({
      url: "./popup_window.html",
      type: "popup",
      height:500,
      width: 500,
    });

    // createWindow.then(onCreated, onError);
  }

});