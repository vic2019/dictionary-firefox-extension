"user strict";

function createPopup() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  const popupDiv = showPopup(selection);
  
  const word = selection.toString().trim();
  sendRequest(word);
  
}

function sendRequest(word) {
  const KEY = '';
  const requestUrl = `https://www.dictionaryapi.com/api/v1/references/learners/xml/${word}?key=${KEY}`;
  
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) updatePopup(false);
  
  httpRequest.onreadystatechange = handleResponse;
  httpRequest.open('GET', requestUrl);
  httpRequest.send();
  
}

function handleResponse() {
  if (this.readyState !== 4 || this.status !== 200) return;
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');

  console.log(xmlDoc.toString());  
}

function updatePopup(content) {
  alert(content);
}

function showPopup(selection) {
  // Set anchor 
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const anchorCoords = getAnchorCoords(selectionCoords);
  
  // Create popup
  const popupDiv = document.createElement('div');

  popupDiv.className = 'wordiePopup';
  popupDiv.style.padding = "20px 30px";
  popupDiv.style.border = "2px solid #8cd9b3";
  popupDiv.style.borderRadius = "9px";
  popupDiv.style.textAlign = "center";
  popupDiv.style.background = '#d9f2e6';
  popupDiv.style.boxShadow = "3px 5px 6px rgba(0, 0, 0, .1)";
  popupDiv.style.height = '370px';
  popupDiv.style.width = '330px';
  document.body.append(popupDiv);
  
  // Set popup position
  let top = anchorCoords.top - popupDiv.offsetHeight - 15;
  let left = anchorCoords.left + 
  (anchorCoords.right - anchorCoords.left - popupDiv.offsetWidth ) / 2;
  
  if (top < pageYOffset) {
    top = anchorCoords.bottom + 15;
  }
  
  if (left < pageXOffset + 10) {
    left = pageXOffset + 10;
  }

  if (left > document.documentElement.clientWidth - 
    popupDiv.offsetWidth - 10) {
    left = document.documentElement.clientWidth - 
    popupDiv.offsetWidth - 10;
  }

  popupDiv.style.top = top + 'px';
  popupDiv.style.left = left + 'px';
  popupDiv.style.position = 'absolute';
  popupDiv.style.zIndex = 1000;

  
  return popupDiv;
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

function removePopup(event) {
  if (!event.target.classList.contains('wordiePopup')) {
    document.querySelectorAll('.wordiePopup').forEach((elem) => {
      elem.remove();
    });
  }
}



document.addEventListener("dblclick", createPopup);
document.addEventListener("click", removePopup);



// ~content
// 	~createPopup
//    ~sendInfo
// 		~createDiv
// 	  updatePopup
//  
// 	~removePopup (click)
// 	saveEntry