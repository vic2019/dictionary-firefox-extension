function createPopup(event) {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  const sendInfo = browser.runtime.sendMessage(
    selection.toString().trim());
  // sendInfo.then(updatePopup)
  // .catch();

  showLoadingPage(selection);
}

function showLoadingPage(selection) {
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  
  const popupDiv = document.createElement('div');
  popupDiv.className = 'wordiePopup';
  
  popupDiv.innerHTML = "<p>Searching...</p>"
  popupDiv.style.background = '#7fcfcf';
  popupDiv.style.position = 'sticky';
  popupDiv.style.zIndex = 100;
  document.body.append(popupDiv);
  
  let top = selectionCoords.top - popupDiv.offsetHeight - 4;
  if (top < 0) {
    top = selectionCoords.bottom + 4;
  }

  
  let left = selectionCoords.right + 4;
  if (left + popupDiv.offsetWidth > document.documentElement.clientWidth) {
    left = document.documentElement.clientWidth - popupDiv.offsetWidth - 2;
  }

  popupDiv.style.left = left + 'px';
  popupDiv.style.top = top + 'px';
}


document.addEventListener("dblclick", createPopup);


// "user strict";

// function handleResponse(res) {
//   return;
// }

// function handleError(err) {
//   console.log(`Error: ${err}`);
// }

// function sendSelection() {
//   const selectedText = document.getSelection();
//   if (selectedText.isCollapsed) return null;
  
//   const sending = 
//       browser.runtime.sendMessage(selectedText.toString().trim());
//   sending.then(handleResponse, handleError);
// }


// content
// 	altMouseup
// 	createPopup
//    sendInfo
// 		showLoading
// 	  updatePopup
//  
// 	
// 	removePopup (click)
// 	saveEntry