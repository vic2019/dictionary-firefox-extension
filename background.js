"use strict";



function handleError(err) {
  console.log(err);
}

function lookUpWord(word, sender, sendResponse) {
 
  const KEY = '';
  const requestUrl = `http://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${KEY}`;
  
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) return false;
  
  httpRequest.onreadystatechange = handleResponse(sender);
  httpRequest.open('GET', requestUrl);
  httpRequest.send();

}

function handleResponse(sender) {
  return (sender) => {
    if (this.readyState !== XMLHttpRequest.DONE) return;
    if (this.status !== 200) {
      console.log(this.status);
      return;
    }
    
    browser.tabs.sendMessage(sender, this.responseText);
    const responseJSON = JSON.parse(this.responseText);
    
    const defElem = parseDef(responseJSON[0]['def'], 'def');
    
  }
}

function parseDef(self, className) {
  
  if (typeof self !== 'object' || self === null) {
    const selfElem = document.createElement('span');
    selfElem.className = className;
    selfElem.innerHTML = self;
    return selfElem;
  }
  
  if (Array.isArray(self)) {
    const selfElem = document.createElement('span');
    selfElem.className = className;
    let childClassName = '';
    let startIndex = 0;
    
    if (typeof self[0] === 'string' && self.length > 1) {
      if (typeof self[1] === 'object' || self[0] === 'text') {
        childClassName = self[0];
        startIndex = 1;
      }
    }
    
    for (let item of self.slice(startIndex)) {
      selfElem.append(parseDef(item, childClassName));
    }
    
    return selfElem; 
  }
  
  const selfElem = document.createElement('div');
  selfElem.className = className;
  const keys = Object.keys(self);
  for (let key of keys) {
    selfElem.append(parseDef(self[key], key));
  }
  
  return selfElem;
  
}


browser.runtime.onMessage.addListener(lookUpWord);

