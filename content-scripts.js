"user strict";

browser.runtime.onMessage.addListener( () => {
  sendRequest();
});

document.addEventListener("click", removePopup);
document.addEventListener("dblclick", sendRequest);

browser.storage.local.get('mode').then( result => {
  if (result.mode === 'context') {
    document.removeEventListener('dblclick', sendRequest);
  }
});


let KEY;
browser.storage.local.get('key').then( result => {
  KEY = result.key;
});


// Update the API key or whether to allow launch from double-clicks
browser.storage.onChanged.addListener( changes => {
  const key = changes.key;
  const mode = changes.mode;
  if (key) {
    if (key.oldValue !== key.newValue) KEY = key.newValue;
  } else {
    if (mode) {
      if (mode.newValue === 'context') {
        document.removeEventListener('dblclick', sendRequest);
      } else {
        document.addEventListener("dblclick", sendRequest);
      }
    }
  }  
});


function sendRequest() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;
  
  const wordInfo = getWordInfo(selection)
  const popupNode = createPopup(wordInfo);
  const shadowHost = document.createElement('span');
  shadowHost.className = 'dictionaryShadowHost';
  const shadowRoot = shadowHost.attachShadow({mode:'open'});
  shadowRoot.append(popupNode);
  shadowRoot.append(getStylesheet());
  document.body.append(shadowHost);

  const word = selection.toString().trim();
  if (word.length > 100) {
    notFoundPage(selection, popupNode);
    return;
  }

  let url;

  // Use a proxy if no key is given
  if (KEY === undefined) { 
    url = `https://3rx9tdzpxi.execute-api.us-west-1.amazonaws.com/default/getDictionary/?word=${word}`;
  } else {
    url = `https://www.dictionaryapi.com/api/v1/references/learners/xml/${word}?key=${KEY}`;
  }

  const encodedUrl = encodeURI(url);

  const httpRequest = new XMLHttpRequest(); 
  httpRequest.onload = handleResponse;
  httpRequest.open('GET', encodedUrl);
  httpRequest.send();
  
  
  function handleResponse() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
    const entryListNode = xmlDoc.getElementsByTagName('entry_list')[0];

    // If response is a string of error message..
    if (!entryListNode) {
      notFoundPage(selection, popupNode);
      return;
    }
    
    const content = buildDOM(entryListNode);
    
    // If response is a list of suggestions..
    if (content.firstElementChild.className === 'suggestion') {
      const heading = document.createElement('p');
      heading.innerHTML = 'Did you mean\u2014'
      content.prepend(heading);
      content.append(document.createElement('br'));
    }

    updateContent(selection, content, popupNode);
  }
  
}


function getStylesheet() {
  const url = browser.runtime.getURL("stylesheet.css");
  const linkElem = document.createElement('link');
  linkElem.setAttribute('rel', 'stylesheet');
  linkElem.setAttribute('href', url);
  
  return linkElem;

}


function createPopup(wordInfo) {  
  const popupNode = document.createElement('div');
  popupNode.className = 'popupNode';
  popupNode.innerHTML = `<p style='font-size:140%; text-align:center;'>Looking up "${wordInfo.word}"...</p>`;


  // Set popup position
  const offsetHeight = 416;
  const offsetWidth = 408;
  
  // const scrollHeight = document.documentElement.scrollHeight;
  // const scrollWidth = document.documentElement.scrollWidth;
  const clientWidth = document.documentElement.clientWidth;
  
  let top = wordInfo.top - offsetHeight - 8;
  let left = wordInfo.left + 
  (wordInfo.right - wordInfo.left - offsetWidth ) / 2;
  
  if (top < pageYOffset) {
      top = wordInfo.bottom + 8;
  }
  
  if (left > pageXOffset + clientWidth - offsetWidth - 3) {
    left = pageXOffset + clientWidth - offsetWidth - 3;
  }
  
  if (left < pageXOffset + 3) {
    left = pageXOffset + 3;
  }

  popupNode.style.top = top + 'px';
  popupNode.style.left = left + 'px';
  popupNode.style.position = 'absolute';
  popupNode.style.zIndex = 16777270;

  return popupNode;

}


function buildDOM(xmlNode) {
  // Recursively create html tree based on the response xml doc
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


function updateContent(selection, content, popupNode) {
  formatSns(content); // Adding .sn-box and .sn-content for styling purposes
  popupNode.innerHTML = '';
  popupNode.append(content);
  
  addViToggle(content); // Adding the show/hide feature for example sentences
  addButtons(selection, popupNode);
  popupNode.append(linkGoogle(selection)); 
  addLinks(popupNode);
  
}


function formatSns(content) {
  let sns = content.querySelectorAll('.sn');
  
  // Splitting one 'sn' into two 'sn's if the sn contains multiple values separated by space 
  for (let snElem of sns) {
    const snParts = snElem.innerHTML.trim().split(' ');
    if (snParts.length === 1) continue;
    
    for (let sn of snParts) {
      const newSnElem = document.createElement('span');
      newSnElem.className = 'sn';
      newSnElem.innerHTML = sn;
      snElem.before(newSnElem);
    }
    
    snElem.remove();
  }


  // Changes the organization from this:
  //     -sn
  //     -sn
  //     -stuff
  //
  // To this:
  //     -sn-box 
  //         -sn 
  //         -sn-content
  //             -stuff
  
  sns = Array.from(content.getElementsByClassName('sn'));
  sns.filter(snElem => isSubsense(snElem)).forEach(snElem => reformat(snElem));
  sns.filter(snElem => !isSubsense(snElem)).forEach(snElem => reformat(snElem));
  

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
  
}


function addViToggle(content) {
  const vis = content.getElementsByClassName('vi');
  
  let index = 0;
  for (let vi of vis) {
    const ps = vi.previousElementSibling;
    const pps = ps? ps.previousElementSibling: null;
    const ppps = pps? pps.previousElementSibling: null;
    
    if (ps && pps && ppps && ps.className.includes('vi') &&
    pps.className.includes('vi') &&
    ppps.className.includes('vi')) {
      vi.className += ` hiddenExample${index}`;
      vi.style.display = 'none'; // Show only the first three examples ('vi')
      
      if (vi.nextElementSibling === null || 
        !vi.nextElementSibling.className.includes('vi')) {
          const viToggle = document.createElement('span');
          viToggle.className = 'exampleButton';
          viToggle.innerHTML = '[+] more examples';
          let hidden = false;
          const selector = `hiddenExample${index}`;
          const toHide = content.getElementsByClassName(selector);
          
          viToggle.onclick = () => {
            for (let item of toHide) {
              item.style.display = hidden? 'none': 'list-item';
            }
            
            viToggle.innerHTML = hidden? '[+] more examples': '[-] hide examples';
            hidden = hidden? false: true;
          };
          
          vi.after(viToggle);
          index += 1;
      }
    }
  }
  
}
  

function addButtons(selection, popupNode) {
  // Add play buttons
  Array.from(popupNode.getElementsByClassName('sound')).forEach( sound => {
    const audioElem = getAudio(sound.firstChild);
    sound.before(audioElem);
    
    const playButton = document.createElement('img');
    playButton.className = 'playButton';
    playButton.title = 'Hear the pronunciation!';
    playButton.src = browser.runtime.getURL("images/play_button.png");
    playButton.style.maxWidth = '12px';
    playButton.onclick = () => audioElem.play();
    audioElem.before(playButton);
  });

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
  
  
  // Add logo and link to Merriam-Webster site
  const rect = popupNode.getBoundingClientRect();
  const word = selection.toString().trim();

  const dictLogoUrl = `http://learnersdictionary.com/definition/${selection.toString()}`;
  const dictLogo = document.createElement('img');
  dictLogo.className = 'dictLogo';
  dictLogo.title = 'See this entry at the Merriam-Webster website!';
  dictLogo.src = browser.runtime.getURL("images/logo.png");
  dictLogo.style = 'position: absolute; z-index: 16777270; width: 50px;';
  dictLogo.style.top = rect.top + pageYOffset + 9 + 'px';
  dictLogo.style.left = rect.right + pageXOffset - 63 + 'px';
  
  dictLogo.onclick = () => {
    browser.runtime.sendMessage({
      url: dictLogoUrl,
      action: 'openTab'
    })
  };
  
  popupNode.after(dictLogo);
  
  
  // Add bookmark button
  const bookmarkUrl = encodeURI(`http://learnersdictionary.com/definition/${word.toLowerCase()}`);
  const bookmarkButton = document.createElement('img');
  bookmarkButton.className = 'bookmarkButton';
  bookmarkButton.title = 'Bookmark this entry!';
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
  if (bookmarked) {
    bookmarkButton.src =browser.runtime.getURL("images/star-filled-19.png");
  } else {
    bookmarkButton.src =browser.runtime.getURL("images/star-empty-19.png");
  }

}


function linkGoogle(selection) {
  const word = selection.toString().trim().split(' ').join('+');
  const googleUrl = `https://www.google.com/search?q=${word}+definition`;
  const googleLink = document.createElement('span');
  googleLink.className = 'openInTab';
  googleLink.innerHTML = 'Search Google?';
  googleLink.onclick = () => {
    browser.runtime.sendMessage({
      url: googleUrl,
      action: 'openTab'
    })
  };

  return googleLink;
  
}


function addLinks(popupNode) {
  const linkElems = popupNode.querySelectorAll('.dxt, .sx, .ct, .suggestion');
  
  for (let elem of linkElems) {
    let word = elem.innerHTML.match(/[/-\w\s\d]*/)[0];
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


function notFoundPage(selection, popupNode) {
  popupNode.style.fontSize = '125%';
  popupNode.style.textAlign = 'center';
  popupNode.innerHTML = "<Br><p>No results found (or invalid API key).</p>";
  popupNode.append(linkGoogle(selection));
  
}


function getWordInfo(selection) {
  const selectionCoords = selection.getRangeAt(0).getBoundingClientRect();
  const top = selectionCoords.top + pageYOffset;
  const bottom = top + selectionCoords.height;
  const left = selectionCoords.left + pageXOffset;
  const right = left + selectionCoords.width;
  const word = selection.toString().trim();

  return {
    word: word,
    top: top,
    bottom: bottom,
    left: left,
    right: right,
  };

}


function removePopup(event) {
  let shadowHosts = document.getElementsByClassName('dictionaryShadowHost');
  for (shadowHost of shadowHosts) {  
    if(shadowHost.contains(event.target)) return;
  }
  
  shadowHosts = document.querySelectorAll('.dictionaryShadowHost');
  for (shadowHost of shadowHosts) {
    shadowHost.remove();
  }

}