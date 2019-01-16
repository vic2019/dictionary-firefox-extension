"user strict";

function handleResponse(res) {
  return;
}

function handleError(err) {
  console.log(`Error: ${err}`);
}

function sendSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;
  
  const sending = browser.runtime.sendMessage(selectedText);
  sending.then(handleResponse, handleError);
}

window.addEventListener("mouseup", sendSelection);