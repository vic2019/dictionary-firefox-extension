"user strict";

function sendSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText)  {
    console.log(selectedText);
  }
}

document.addEventListener("mouseup", sendSelection);


