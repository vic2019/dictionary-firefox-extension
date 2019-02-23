"user strict";


function createPopup() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  const popupNode = showPopup(selection);
  
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
  updatePopup(xmlDoc);
  
}


function parseXmlObject(xmlNode) {
  const selfElem = document.createElement('span');
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


function updatePopup(xmlDoc) {
  const content = parseXmlObject(xmlDoc.getElementsByTagName('entry_list')[0]);

  arrangeSN(content);

  const popupNodes = document.body.getElementsByClassName('wordiePopup');
  const popupNode = popupNodes[popupNodes.length - 1];
  popupNode.innerHTML = '';
  popupNode.style.textAlign = 'left';
  popupNode.style.lineHeight = 1.15;
  popupNode.append(content);
  
  const stylesheetUrl = browser.extension.getURL("stylesheet.css");
  const linkElem = document.createElement('link');
  linkElem.setAttribute('rel', 'stylesheet');
  linkElem.setAttribute('href', stylesheetUrl);
  document.getElementsByTagName('head')[0].appendChild(linkElem);
  
  Array.from(popupNode.getElementsByClassName('sound')).forEach( sound => {
    const audio = sound.firstChild;
    const audioElem = getAudio(audio);
    sound.after(audioElem);
    
    const playButton = document.createElement('img');
    playButton.src = browser.extension.getURL("images/play_button.png");
    playButton.onclick = () => audioElem.play();
    // playButton.style.paddingLeft = '1%';
    audioElem.after(playButton);
  });
  
  const bookmarkButton = document.createElement('img');
  bookmarkButton.src = browser.extension.getURL("images/logo.png");
  bookmarkButton.style.float = 'right';
  bookmarkButton.style.position = 'sticky';
  bookmarkButton.style.top = '0px';
  bookmarkButton.style.width = '40px';

  const headword = xmlDoc.firstChild.firstChild.id.match(/[-\w\s]*/)[0];
  bookmarkButton.onclick = bookmarkToggle(headword, bookmarkButton);
  popupNode.prepend(bookmarkButton);
  
}


function arrangeSN(content) {
  const sns = content.getElementsByClassName('sn');

  for (let snElem of sns) {
    if (snElem.innerHTML.trim().split(' ').length === 1) continue;

    for (let sn of snElem.innerHTML.trim().split(' ')) {
      const newSnElem = document.createElement('span');
      newSnElem.className = 'sn';
      newSnElem.innerHTML = sn;
      snElem.before(newSnElem);
    }

    snElem.remove();
  }


  const subsenses = Array.from(sns).filter(item => {
    return isNaN(parseInt(item.innerHTML));
  });

  for (let snElem of subsenses) {
    const snBoxElem = document.createElement('span');
    snBoxElem.className = 'snBox';
    snElem.before(snBoxElem);
    
    const snContentElem = document.createElement('span');
    snContentElem.className = 'snContent';
    
    let currentElem = snElem.nextElementSibling;
    while (currentElem) {
      if (currentElem.className === 'sn') break;
      
      let placeHolder = currentElem.nextElementSibling;
      snContentElem.append(currentElem);
      currentElem = placeHolder;
    }
    
    snBoxElem.append(snElem);
    snBoxElem.append(snContentElem);
  }
  
  for (let snElem of sns) {
    if (isNaN(parseInt(snElem.innerHTML))) continue;

    const snBoxElem = document.createElement('span');
    snBoxElem.className = 'snBox';
    snElem.before(snBoxElem);
    
    const snContentElem = document.createElement('span');
    snContentElem.className = 'snContent';
    
    let currentElem = snElem.nextElementSibling;
    while (currentElem) {
      if (currentElem.className === 'sn') break;
      
      let placeHolder = currentElem.nextElementSibling;
      snContentElem.append(currentElem);
      currentElem = placeHolder;
    }
    
    snBoxElem.append(snElem);
    snBoxElem.append(snContentElem);
  }

}


function bookmarkToggle(headword, bookmarkButton) {
  return () => {
    browser.runtime.sendMessage(headword);
  }
}


function getAudio(audio) {
  const fileName = audio.innerHTML;
  let subdir = fileName.slice(0, 1);

  if (fileName.slice(0, 3) === 'bix') {
    subdir = 'bix';
  } else if (fileName.slice(0, 2) === 'gg') {
    subdir = 'gg';
  } else if (fileName.slice(0, 1).match(/\d/)) {
    subdir = 'number';
  }

  const src = `https://media.merriam-webster.com/soundc11/${subdir}/${fileName}`;
  const audioElem = document.createElement('audio');
  audioElem.className = fileName;
  audioElem.src = src;
  audioElem.display = 'none'; 

  return audioElem;

}




function showPopup(selection) {
  // Set anchor 
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const anchorCoords = getAnchorCoords(selectionCoords);
  
  // Create popup
  const popupNode = document.createElement('span');

  popupNode.className = 'wordiePopup';
  popupNode.style.background = '#eef0ff';
  popupNode.style.border = "3px solid #D71920";
  popupNode.style.borderRadius = "9px";
  popupNode.style.margin = "0px";
  popupNode.style.padding = "10px 16px";
  popupNode.style.height = '380px';
  popupNode.style.width = '360px';
  popupNode.style.boxShadow = "3px 5px 6px rgba(0, 0, 0, .1)";
  popupNode.style.textAlign = 'center';
  popupNode.style.lineHeight = 25;
  popupNode.style.fontFamily = 'Arial, Helvetica, sans-serif';
  popupNode.style.overflow = 'scroll';
  popupNode.innerHTML = 'Searching...'

  // Set popup position
  const offsetHeight = 404;
  const offsetWidth = 396;
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
  
  popupNode.style.top = top + 'px';
  popupNode.style.left = left + 'px';
  popupNode.style.position = 'absolute';
  popupNode.style.zIndex = 16777270;
  document.body.append(popupNode);

  return popupNode;

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
  const popupNodes = document.querySelectorAll('.wordiePopup');
  for (popupNode of popupNodes) {
    if(popupNode.contains(event.target)) return;
  }

  document.querySelectorAll('.wordiePopup').forEach((elem) => {
    elem.remove();
  });

}


document.addEventListener("dblclick", createPopup);
document.addEventListener("click", removePopup);