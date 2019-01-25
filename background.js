"use strict";

// function handleError(err) {
//   console.log(err);
// }

function lookUpWord(word) {
  const KEY = '';
  const requestUrl = `http://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${KEY}`;
  // console.log(requestUrl);

  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) return false;

  httpRequest.onreadystatechange = handleResponse;
  httpRequest.open('GET', requestUrl);
  httpRequest.send();
}

function handleResponse() {
  if (this.readyState !== XMLHttpRequest.DONE) return;
  if (this.status !== 200) {
    console.log(this.status);
    return;
  }
  
  const response = JSON.parse(this.responseText);
  // console.log(typeof response);
      
  buildDOM(response);

}

browser.runtime.onMessage.addListener(lookUpWord);


function buildDOM(response) {
  // Check if the word was found
  if (typeof response[0] === 'string') return;

  const content = document.createElement('div');

  // Filter out irrelevant entries
  for (let entry of response) {
    if (entry.hwi.hw !== word) continue;
    
    content.heading = getHeading(entry);
    content.body = getBody(entry);
  } 
}

function getHeading(entry) {
  alert('heading');

}
  // Process hwi (hw, prs), fl, gram
  
  // Process def -> sseq. Go through ea, ch sense. Get sn, dt, vis, t
  
  // Process uros as "more examples". Process all the vis -> t.

function getBody(entry) {
  alert('body');
}




