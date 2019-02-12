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
  // How to handle error?
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');

  //Need to check whether the word is available first
  const content = parseXmlObject(xmlDoc.getElementsByTagName('entry_list')[0]);
  updatePopup(content);
}


function parseXmlObject(xmlNode) {
  const selfElem = document.createElement('div');
  selfElem.className = xmlNode.tagName;

  if (!xmlNode.hasChildNodes()) return selfElem;

  for (let child of xmlNode.childNodes) {
    if (child.nodeType === 3) {
      selfElem.append(child.nodeValue);
    } else if ( child.nodeType === 1) {
      selfElem.append(parseXmlObject(child));
    }
  }

  return selfElem;  
}


function updatePopup(content) {
  const popupDivs = document.body.getElementsByClassName('wordiePopup');
  const popupDiv = popupDivs[popupDivs.length - 1];
  popupDiv.innerHTML = '';
  popupDiv.style.textAlign = 'left';
  popupDiv.style.lineHeight = 1.2;
  popupDiv.append(content);     
  
  const stylesheet = {
    hw: {
      fontWeight: 'bold'
    },
    it: {
      fontStyle: 'italic'
    }
  }
  
  for (let className of Object.keys(stylesheet)) {
    for (let property of Object.keys(stylesheet[className])) {
      Array.from(popupDiv.getElementsByClassName(className)).forEach(
        elem => elem.style[property] = stylesheet[className][property]
      );
    }
  } 
}


function showPopup(selection) {
  // Set anchor 
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const anchorCoords = getAnchorCoords(selectionCoords);
  
  // Create popup
  const popupDiv = document.createElement('div');

  popupDiv.className = 'wordiePopup';
  popupDiv.style.background = '#d9f2e6';
  popupDiv.style.border = "2px solid #8cd9b3";
  popupDiv.style.borderRadius = "9px";
  popupDiv.style.margin = "0px";
  popupDiv.style.padding = "12px 16px";
  popupDiv.style.height = '380px';
  popupDiv.style.width = '350px';
  popupDiv.style.boxShadow = "3px 5px 6px rgba(0, 0, 0, .1)";
  popupDiv.style.textAlign = 'center';
  popupDiv.style.lineHeight = 25;
  popupDiv.style.fontFamily = 'Arial, Helvetica, sans-serif';
  popupDiv.style.overflow = 'scroll';
  popupDiv.innerHTML = 'Searching...'

  // Set popup position
  const offsetHeight = 408;
  const offsetWidth = 386;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientWidth = document.documentElement.clientWidth;
  
  let top = anchorCoords.top - offsetHeight - 8;
  let left = anchorCoords.left + 
  (anchorCoords.right - anchorCoords.left - offsetWidth ) / 2;
  
  // alert(`top: ${top}, offsetWidth: ${offsetWidth}, pageYOffset: ${pageYOffset}, scrollHeight: ${scrollHeight}, anchor bottom: ${anchorCoords.bottom}`);
  
  if (top < pageYOffset && 
    anchorCoords.bottom + offsetHeight + 8 < scrollHeight) {
      top = anchorCoords.bottom + 8;
    }
    
    if (left < pageXOffset + 4) {
      left = pageXOffset + 4;
    }
    
    if (left > clientWidth - offsetWidth - 4) {
    left = clientWidth - offsetWidth - 4;
  }
  
  popupDiv.style.top = top + 'px';
  popupDiv.style.left = left + 'px';
  popupDiv.style.position = 'absolute';
  popupDiv.style.zIndex = 1000;
  document.body.append(popupDiv);
  
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