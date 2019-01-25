function parseDef(def) {
  const defElem = document.createElement('div');
  defElem.className = 'def'; 
  
  for (let sseq of def) {
    defElem.append(parseSseq(sseq['sseq']));
  }

  return defElem;
}

function parseSseq(sseq) {
  const sseqElem = document.createElement('div');
  for (let sense of sseq) {
    sseqElem.append(parseSense(sense));
  }
  
  return sseqElem;
}