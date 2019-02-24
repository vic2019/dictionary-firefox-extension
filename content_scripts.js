"user strict";

document.addEventListener("dblclick", showPopup);
document.addEventListener("click", removePopup);


function showPopup() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  sendRequest(selection);
  
}


function sendRequest(selection) {
  
  const word = selection.toString().trim();
  const KEY = '';
  const requestUrl = `https://www.dictionaryapi.com/api/v1/references/learners/xml/${word}?key=${KEY}`;

  const wordInfo = getWordInfo(selection)
  const popupNode = createPopup(wordInfo);
  document.body.append(popupNode);
  
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) notFound(popupNode);
  
  httpRequest.onload = function() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
    const content = buildDOM(xmlDoc.getElementsByTagName('entry_list')[0]);
    
    addFlexbox(content);
    updateContent(content, popupNode);
    // createBookmarkButton(selection);
    
    
  }
  
  httpRequest.open('GET', requestUrl);
  httpRequest.send();
  
}


function buildDOM(xmlNode) {
  const selfElem = document.createElement('span');
  selfElem.className = xmlNode.tagName;
  
  if (!xmlNode.hasChildNodes()) return selfElem;
  
  for (let child of xmlNode.childNodes) {
    if (child.nodeType === 3) {
      selfElem.append(child.nodeValue);
    } else if ( child.nodeType === 1) {
      selfElem.append(buildDOM(child));
    }
  }
  
  return selfElem;  
  
}


function updateContent(content, popupNode) {
  popupNode.innerHTML = '';
  popupNode.style.textAlign = 'left';
  popupNode.style.lineHeight = 1.1;
  popupNode.style.fontSize = '100%';
  popupNode.append(content);
  
  Array.from(popupNode.getElementsByClassName('sound')).forEach( sound => {
    const audioElem = getAudio(sound.firstChild);
    sound.before(audioElem);
    
    const playButton = document.createElement('img');
    playButton.src = browser.extension.getURL("images/play_button.png");
    playButton.style.maxWidth = '13px';
    playButton.style.verticalAlign = 'text-top';
    playButton.onclick = () => audioElem.play();
    audioElem.before(playButton);
  });
  
  // const bookmarkButton = document.createElement('img');
  // bookmarkButton.src = browser.extension.getURL("images/logo.png");
  // bookmarkButton.style.float = 'right';
  // bookmarkButton.style.position = 'sticky';
  // bookmarkButton.style.top = '0px';
  // bookmarkButton.style.width = '40px';

  // const headword = xmlDoc.firstChild.firstChild.id.match(/[-\w\s]*/)[0];
  // bookmarkButton.onclick = bookmarkToggle(headword, bookmarkButton);
  // popupNode.prepend(bookmarkButton);
  
  // Not sure why 'fl' must be renamed for it to display properly. Namespace conflict?
  Array.from(content.getElementsByClassName('fl')).forEach(flElem => {
    flElem.className = "flabel";
  });

}


function addFlexbox(content) {
  let sns = Array.from(content.getElementsByClassName('sn'));

  sns.forEach( snElem => {
    if (snElem.innerHTML.trim().split(' ').length === 1) return;
    
    for (let sn of snElem.innerHTML.trim().split(' ')) {
      const newSnElem = document.createElement('span');
      newSnElem.className = 'sn';
      newSnElem.innerHTML = sn;
      snElem.before(newSnElem);
    }
  
    snElem.remove();
    sns = Array.from(content.getElementsByClassName('sn'));
  });

  function isSubsense(snElem) {
    return isNaN(parseInt(snElem.innerHTML));
  }
  
  function reformat(snElem) {
    const snBoxElem = document.createElement('span');
    snBoxElem.className = 'sn-box';
    const snContentElem = document.createElement('span');
    snContentElem.className = 'sn-content';
    
    let currentElem = snElem.nextElementSibling;
    while (currentElem) {
      if (currentElem.className === 'sn') break;
      
      let placeHolder = currentElem.nextElementSibling;
      snContentElem.append(currentElem);
      currentElem = placeHolder;
    }
    
    snElem.before(snBoxElem);
    snBoxElem.append(snElem, snContentElem);
  }
  
  sns.filter(snElem => isSubsense(snElem)).forEach(snElem => reformat(snElem));
  sns.filter(snElem => !isSubsense(snElem)).forEach(snElem => reformat(snElem));

}


function bookmarkToggle(headword, bookmarkButton) {
  return () => {
    browser.runtime.sendMessage(headword);
  }
}


function getAudio(audio) {
  const fileName = audio.innerHTML;
  let subDir = fileName.slice(0, 1);

  if (fileName.slice(0, 3) === 'bix') {
    subDir = 'bix';
  } else if (fileName.slice(0, 2) === 'gg') {
    subDir = 'gg';
  } else if (fileName.slice(0, 1).match(/\d/)) {
    subDir = 'number';
  }

  const src =`https://media.merriam-webster.com/soundc11/${subDir}/${fileName}`;
  const audioElem = document.createElement('audio');
  audioElem.className = fileName;
  audioElem.src = src;
  audioElem.display = 'none'; 

  return audioElem;

}


function createPopup(wordInfo) {  
  const popupNode = document.createElement('div');
  popupNode.className = 'wordiePopup';

  // Create link to stylesheet
  const stylesheetUrl = browser.extension.getURL("stylesheet.css");
  const linkElem = document.createElement('link');
  linkElem.setAttribute('rel', 'stylesheet');
  linkElem.setAttribute('href', stylesheetUrl);
  document.head.append(linkElem);

  popupNode.style.background = '#eef0ff';
  popupNode.style.border = '3px solid #D71920';
  popupNode.style.borderRadius = '9px';
  popupNode.style.margin = '0px';
  popupNode.style.padding = '10px 16px';
  popupNode.style.height = '390px';
  popupNode.style.width = '370px';
  popupNode.style.boxShadow = '3px 4px 5px rgba(0, 0, 0, .3)';
  popupNode.style.fontFamily = 'Arial, Helvetica, sans-serif';
  popupNode.style.overflow = 'scroll';
  popupNode.style.textAlign = 'center';
  popupNode.style.fontSize = '120%';
  popupNode.style.lineHeight = 22;
  popupNode.innerHTML = `Looking up the word "${wordInfo.word}"...`;

  document.body.append(popupNode);

  // Set popup position
  const offsetHeight = 414;
  const offsetWidth = 406;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientWidth = document.documentElement.clientWidth;
  
  let top = wordInfo.top - offsetHeight - 8;
  let left = wordInfo.left + 
  (wordInfo.right - wordInfo.left - offsetWidth ) / 2;
  
  if (top < pageYOffset) {
      top = wordInfo.bottom + 8;
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
  return popupNode;

}


function getWordInfo(selection) {
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const top = selectionCoords.top + pageYOffset;
  const bottom = top + selectionCoords.height;
  const left = selectionCoords.left + pageXOffset;
  const right = left + selectionCoords.width;
  const word = selection.toString().trim().split(' ')[0];

  return {
    word: word,
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