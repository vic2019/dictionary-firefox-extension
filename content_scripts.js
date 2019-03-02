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
  if (!httpRequest) {
    notFoundPage(selection, popupNode);
    return;
  }
  
  httpRequest.onload = function() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
    const entryListNode = xmlDoc.getElementsByTagName('entry_list')[0];

    if (!entryListNode) {
      notFoundPage(selection, popupNode);
      return;
    }
    
    const content = buildDOM(entryListNode);
    
    if (content.firstElementChild.className === 'suggestion') {
      const heading = document.createElement('p');
      heading.innerHTML = 'Did you mean to search for\u2014'
      content.prepend(heading);
    }

    addFlexbox(content);
    updateContent(content, popupNode);
    addButtons(selection, popupNode);
    popupNode.append(linkGoogle(selection)); 
    addLinks(popupNode);
  }

  httpRequest.timeout = 6000;
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
  
  // Add play buttons
  Array.from(popupNode.getElementsByClassName('sound')).forEach( sound => {
    const audioElem = getAudio(sound.firstChild);
    sound.before(audioElem);
    
    const playButton = document.createElement('img');
    playButton.className = 'playButton';
    playButton.src = browser.extension.getURL("images/play_button.png");
    playButton.style.maxWidth = '13px';
    playButton.onclick = () => audioElem.play();
    audioElem.before(playButton);
  });

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


function addButtons(selection, popupNode) {
  const rect = popupNode.getBoundingClientRect();
  const word = selection.toString().trim().split(' ')[0];
  
  // Add logo
  const logoUrl = `http://learnersdictionary.com/definition/${selection.toString()}`;
  const logo = document.createElement('img');
  logo.className = 'wordiePopup logo';
  logo.src = browser.extension.getURL("images/logo.png");
  logo.style = 'position: absolute; z-index: 16777270; max-width: 40px;';
  logo.style.top = rect.top + pageYOffset + 5 + 'px';
  logo.style.left = rect.right + pageXOffset - 81 + 'px';
  logo.onclick = () => {
    browser.runtime.sendMessage({
      url: logoUrl,
      action: 'openTab'
    })
  };
  
  popupNode.after(logo);
  
  
  // Add bookmark button
  const bookmarkUrl = `http://learnersdictionary.com/definition/${word.toLowerCase()}`;
  const bookmarkButton = document.createElement('img');
  bookmarkButton.className = 'wordiePopup bookmarkButton';
  bookmarkButton.alt = 'Save';
  bookmarkButton.style = 'position: absolute; z-index: 16777270; max-width: 22px;';
  bookmarkButton.style.top = rect.bottom + pageYOffset - 30 + 'px';
  bookmarkButton.style.left = rect.right + pageXOffset - 32 + 'px';
  bookmarkButton.onclick = () => {
    updateBookmark(word, bookmarkUrl, 'toggle', bookmarkButton);
  };
  
  updateBookmark(word, bookmarkUrl, 'update', bookmarkButton);
  popupNode.after(bookmarkButton);
  
}


function updateBookmark(word, url, action, bookmarkButton) {
  const messageBackground = browser.runtime.sendMessage({
    word: word,
    url: url,
    action: action,
  });
  messageBackground.then( bookmarked => {
    updateIcon(bookmarked, bookmarkButton);
  }); 
  
}



function updateIcon(bookmarked, bookmarkButton) {
  switch (bookmarked) {
    case true:
    bookmarkButton.src =browser.extension.getURL("images/star-filled-19.png");
    break;
    case false:
    bookmarkButton.src =browser.extension.getURL("images/star-empty-19.png");
    break;
    default:
    bookmarkButton.src =browser.extension.getURL("images/star-empty-19.png");
    break;
  }

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
  popupNode.style.boxShadow = '3px 4px 5px #b2b2b2';
  popupNode.style.fontFamily = 'Arial, Helvetica, sans-serif';
  popupNode.style.overflow = 'scroll';

  popupNode.style.textAlign = 'center';
  popupNode.style.fontSize = '120%';
  popupNode.style.lineHeight = 22;
  popupNode.innerHTML = `Looking up the word "${wordInfo.word}"...`;

  // Set popup position
  const offsetHeight = 416;
  const offsetWidth = 408;
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


function notFoundPage(selection, popupNode) {
  popupNode.innerHTML = `No results found. `;
  popupNode.append(linkGoogle(selection));
}


function linkGoogle(selection) {
  const word = selection.toString().trim().split(' ').join('+');
  const googleUrl = `https://www.google.com/search?q=${word}+definition`;
  const googleLink = document.createElement('span');
  googleLink.className = 'openInTab';
  googleLink.innerHTML = 'Search on Google?';
  googleLink.onclick = () => {
    browser.runtime.sendMessage({
      url: googleUrl,
      action: 'openTab'
    })
  };

  return googleLink;
  
}


function addLinks(popupNode) {
  const linkElems = popupNode.querySelectorAll('.wordiPopup .dxt, .ct, .suggestion');
  
  for (let elem of linkElems) {
    let word = elem.innerHTML.trim().split(' ')[0];
    let url = `http://learnersdictionary.com/definition/${word}`
    elem.className += ' openInTab';
    elem.onclick = () => {
      browser.runtime.sendMessage({
        url: url,
        action: 'openTab'
      })
    };
  }
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