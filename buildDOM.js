function buildDOM(response) {
  // Check if the word was found
  if (typeof response[0] === 'string') return;
  const content = document.createElement('div');

  // Filter out irrelevant entries
  for (let entry of response) {
    if (entry.hwi.hw !== 'abuse') continue;

    content.heading = getHeading(entry);
  

    content.body = getBody(entry);
  } 
}

function getHeading(entry) {
  const heading = document.createElement('div');
  
  heading.appendChild(addElem('div', 'headword', entry.hwi.hw));
  heading.appendChild(addElem('div', 'audio', entry.hwi.prs[0].sound.audio));
  heading.appendChild(addElem('div', 'fl', entry.fl));
  heading.appendChild(addElem('div', 'gram', entry.gram));
  
  return heading;
}
  // Process hwi (hw, prs), fl, gram
  
  // Process def -> sseq. Go through ea, ch sense. Get sn, dt, vis, t
  
  // Process uros as "more examples". Process all the vis -> t.

function getBody(entry) {

}

function addElem(tagName, className, innerHTML) {
  const elem = document.createElement(tagName);
  elem.class = className;
  elem.innerHTML = innerHTML;
  return elem;
}


buildDOM(response);

