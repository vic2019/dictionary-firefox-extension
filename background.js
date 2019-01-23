"use strict";

// function handleError(err) {
//   console.log(`Error: ${err}`);
// }

function lookUpWord(word) {
  const KEY = '';
  const requestUrl = `https://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${KEY}`;
  console.log(requestUrl);

  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) return false;

  httpRequest.onreadystatechange = handleResponse;
  httpRequest.open('GET', requestUrl);
  httpRequest.send();
}

function handleResponse() {
  if (this.readyState === XMLHttpRequest.DONE) {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText);
      console.log(response);

      // console.log(response.hwi.hw);
      // console.log(response.shortdef[0]);

    } else {
      console.log(this.status);
    }
  } else {
    console.log(this.readyState.toString());
  }
  
}






browser.runtime.onMessage.addListener(lookUpWord);

  
  
  
  
  
  
  
  
  
  