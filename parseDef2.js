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