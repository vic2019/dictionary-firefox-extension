"user strict";

function createPopup(event) {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  const sendInfo = browser.runtime.sendMessage(
    selection.toString().trim());
  // sendInfo.then(updatePopup)
  // .catch();

  showPopup(selection);
}

function showPopup(selection) {
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const anchorCoords = getAnchorCoords(selectionCoords);
  
  const popupDiv = document.createElement('div');
  popupDiv.className = 'wordiePopup';
  // popupDiv.style.width = '300px';
  popupDiv.style.top = anchorCoords.top + 'px';
  popupDiv.style.left = anchorCoords.left + 'px';
  popupDiv.style.position = 'absolute';
  popupDiv.style.zIndex = 1000;
  popupDiv.style.hidden = false;
  popupDiv.innerHTML = "<p>Searching...</p>"
  popupDiv.style.background = '#7fcfcf';
  document.body.append(popupDiv);

}
    
function getAnchorCoords(selectionCoords) {
  const top = selectionCoords.top + pageYOffset;
  const bottom = top + selectionCoords.height;
  const left = selectionCoords.left + pageXOffset;
  const right = left + selectionCoords.width;

  return {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
  };
}

document.addEventListener("dblclick", createPopup);

// content
// 	createPopup
//    sendInfo
// 		createDiv
// 	  updatePopup
//  
// 	removePopup (click)
// 	saveEntry