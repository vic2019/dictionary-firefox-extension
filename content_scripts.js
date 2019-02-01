"user strict";

function createPopup(event) {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  lookUpWord(selection.toString().trim());
 
  const popupDiv = setPopup(selection);


}

function lookUpWord(word) {
 
  const KEY = '';
  const requestUrl = `https://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${KEY}`;
  
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) return false;
  
  httpRequest.onreadystatechange = handleResponse;
  httpRequest.open('GET', "http://learnersdictionary.com/definition/ok");
  httpRequest.send();
  
}

function handleResponse(err) {
  if (this.readyState !== XMLHttpRequest.DONE) return;
  if (this.status !== 200) {
    return;
  }
  
  alert(this.status);
  
  // const responseJSON = JSON.parse(this.responseText);   
  // const defElem = parseDef(responseJSON[0]['def'], 'def');
    

}

function setPopup(selection) {
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