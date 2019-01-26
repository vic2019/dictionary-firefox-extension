function parseDef(def) {
  const defElem = document.createElement('div');
  defElem.className = 'def'; 
  
  for (let sseq of def) {
    defElem.append(parseSseq(sseq.sseq));
  }

  return defElem;
}

function parseSseq(sseq) {
  const sseqElem = document.createElement('div');
  sseqElem.className = 'sseq';

  for (let sense of sseq) {
    sseqElem.append(parseSense(sense));
  }
  
  return sseqElem;
}

function parseSense(sense) {
  const senseElem = document.createElement('div');
  
  senseElem.className = 'sense';
  
  for (let subsense of sense) {
    senseElem.append(parseSubsense(subsense));
  }
  
  return senseElem;
}

function parseSubsense(subsense) {
  const subsenseElem = document.createElement('div');
  const className = subsense[0];
  if (typeof className !== 'string') {
    throw new Error('ClassName for subsenseElem not found');
  }
  subsenseElem.className = className;

  const keys = Object.keys(subsense[1]);
  for (let key of keys) {
    subsenseElem.append(parseItem(subsense[1][key], key));
  }
 
  return subsenseElem;
}

function parseItem(item, itemKey) {
  if (typeof item === 'string') {
    const itemElem = document.createElement('span');
    itemElem.className = itemKey;
    itemElem.innerHTML = `<p>${item}</p>`;
    return itemElem;
  }
  
  const itemElem = document.createElement('div');
  itemElem.className = itemKey;

  if (Array.isArray(item)) {
    for (let subItem of item.slice(1)) {
      itemElem.append(parseItem(subItem, subItem[0])); 
    }
    return itemElem;
  }
  
  if (typeof item !== 'object') return;
  const keys = Object.keys(item);
  for (let key of keys) {
    itemElem.append(parseItem(item[key], key));
  }
  return itemElem;

}