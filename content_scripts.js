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
  const popupDivs = document.body.getElementsByClassName('wordiePopup');
  const popupDiv = popupDivs[popupDivs.length - 1];
  popupDiv.innerHTML = '';
  popupDiv.style.textAlign = 'left';
  popupDiv.style.lineHeight = 1.2;
  popupDiv.append(content);
  
  const css = {
    entry: `
    display: block;
    padding-bottom: 1%;
    `,
    hw: `
    padding-top: 1%;
    padding-bottom: 2%;
    font-size: 130%; 
    font-weight: bold;
    display: inline-block;
    `,
    vr: `
    display: none;
    `,
    sound: `
    display: none;
    `,
    pr: `
    display: none;
    `,
    fl: `
    color: #787878;
    font-weight: bold;
    font-style: italic;
    `,
    lb: `
    color: #787878;
    `,
    hsl: `
    color: #787878;
    display: inline;
    `,
    ssl: `
    color: #787878;
    font-style: italic;
    `,
    sl: `
    color: #787878;
    font-style: italic;
    `,
    sin: `
    display: block;
    `,
    sn: `
    font-weight: bold;
    padding-right: 1%;
    float: left;
    `,
    sgram: `
    color: #787878;
    text-transform: uppercase;
    font-size: 75%;
    font-weight: bold;
    `,
    slb: `
    color: #787878;
    `,
    in: `
    color: #787878;
    display: block;
    `,
    il: `
    display: inline-block;
    padding-bottom: 1%;
    color: #787878;
    font-style: italic;
    `,
    cx: `
    padding-bottom: 1%;
    display: block;
    `,
    ct: `
    font-style: italic;
    `,
    def: `
    padding-top: 1%;
    padding-bottom: 1%;
    display: block;
    `,
    dt: `
    clear: right;
    padding-top: 1%;
    padding-bottom: 1%;
    `,
    vt: `
    color: #787878;
    padding-top: 1%;
    padding-bottom: 1%;
    text-transform: uppercase;
    font-size: 75%;
    font-weight: bold;  
    display: block;
    `,
    wsgram: `
    color: #787878;
    padding-top: 1%;
    text-transform: uppercase;
    font-size: 75%;
    font-weight: bold;
    display: block;
    `,
    gram: `
    color: #787878;
    text-transform: uppercase;
    font-size: 75%;
    font-weight: bold;
    padding-top: 1%;
    padding-bottom: 1%;
    display: block;
    `,
    vi: `
    display:list-item;
    list-style: square inside;
    padding-left: 9%;
    padding-top: 1%;
    padding-bottom: 1%;
    `,
    it: `
    font-style: italic;
    `,
    un: `
    `,
    snote: `
    display:list-item;
    list-style: circle inside;
    `,
    phrase: `
    font-style: italic;
    `,
    usage: `
    display:list-item;
    list-style: circle inside;
    `,
    ure: `
    display: inline-block;
    padding-bottom: 1%;
    font-weight: bold;
    `,
    dre: `
    display: inline-block;
    padding-top: 1%;
    padding-bottom: 1%;
    font-weight: bold;
    `,
    usageref: `
    display: none;
    `,
    altpr: `
    display: none;
    `,
    snotebox: `
    display: none;
    `,
    art: `
    display: none;
    `,
    dxnl: `
    display: none;
    `,
    dx: `
    display: none;
    `,
    dxt: `
    font-style: italic;
    `
  }
  
  for (let className of Object.keys(css)) {
    Array.from(popupDiv.getElementsByClassName(className)).forEach(
      elem => elem.style = css[className]
    ); 
  }
  
  Array.from(popupDiv.getElementsByClassName('sound')).forEach( sound => {
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
  bookmarkButton.src = browser.extension.getURL("images/star-empty-19.png");
  bookmarkButton.style.float = 'right';
  bookmarkButton.style.position = 'sticky';
  bookmarkButton.style.top = '0px';
  const headword = xmlDoc.firstChild.firstChild.id.match(/[-\w\s]*/)[0];
  bookmarkButton.onclick = bookmarkToggle(headword, bookmarkButton);
  popupDiv.prepend(bookmarkButton);
  
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
  const popupDiv = document.createElement('div');

  popupDiv.className = 'wordiePopup';
  popupDiv.style.background = '#d9f2e6';
  popupDiv.style.border = "2px solid #8cd9b3";
  popupDiv.style.borderRadius = "9px";
  popupDiv.style.margin = "0px";
  popupDiv.style.padding = "10px 16px";
  popupDiv.style.height = '380px';
  popupDiv.style.width = '360px';
  popupDiv.style.boxShadow = "3px 5px 6px rgba(0, 0, 0, .1)";
  popupDiv.style.textAlign = 'center';
  popupDiv.style.lineHeight = 25;
  popupDiv.style.fontFamily = 'Arial, Helvetica, sans-serif';
  popupDiv.style.overflow = 'scroll';
  popupDiv.innerHTML = 'Searching...'

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
  
  popupDiv.style.top = top + 'px';
  popupDiv.style.left = left + 'px';
  popupDiv.style.position = 'absolute';
  popupDiv.style.zIndex = 16777270;
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
  const popupDivs = document.querySelectorAll('.wordiePopup');
  for (popupDiv of popupDivs) {
    if(popupDiv.contains(event.target)) return;
  }

  document.querySelectorAll('.wordiePopup').forEach((elem) => {
    elem.remove();
  });

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