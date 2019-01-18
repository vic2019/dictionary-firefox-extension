"user strict";

function handleResponse(res) {
  return;
}

function handleError(err) {
  console.log(`Error: ${err}`);
}

function sendSelection() {
  const selectedText = document.getSelection();
  if (selectedText.isCollapsed) return null;
  
  const sending = 
      browser.runtime.sendMessage(selectedText.toString().trim());
  sending.then(handleResponse, handleError);
}

addEventListener("mouseup", sendSelection);