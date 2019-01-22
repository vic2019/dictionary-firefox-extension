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
  
  popupDiv.innerHTML = "<p> blah <br> <br> blah blah</p>"
  popupDiv.style.background = '#7fcfcf';
  popupDiv.style.position = 'fixed';
  document.body.append(popupDiv);
  
  let top = selectionCoords.top - popupDiv.offsetHeight - 4;
  if (top < 0) {
    top = selectionCoords.bottom + 4;
  }
  alert(`select.top: ${selectionCoords.top},\npopup.offsetHeight: ${popupDiv.offsetHeight},\ntop: ${top}`);
  
  let left = selectionCoords.right + 4;
  if (left + popupDiv.offsetWidth > document.documentElement.clientWidth) {
    left = document.documentElement.clientWidth - popupDiv.offsetWidth - 2;
  }
  // alert(typeof popupDiv.offsetHeight);
  // alert(typeof selectionCoords.top);
  popupDiv.style.left = left + 'px';
  popupDiv.style.top = top + 'px';
}


addEventListener("dblclick", createPopup);
addEventListener("mouseup", altSelect);

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