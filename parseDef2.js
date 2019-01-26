function parseDef(self, className) {

  if (typeof self !== 'object' || self === null) {
    const selfElem = document.createElement('span');
    selfElem.className = className;
    selfElem.innerHTML = self;
    return selfElem;
  }
  
  const selfElem = document.createElement('div');
  selfElem.className = className;

  if (Array.isArray(self)) {
    let childClassName = '';
    let startIndex = 0;

    if (typeof self[0] === 'string' && self.length > 1) {
      if (typeof self[1] === 'object') {
        childClassName = self[0];
        startIndex = 1;
      }
    }

    for (let item of self.slice(startIndex)) {
      selfElem.append(parseDef(item, childClassName));
    }
    
    return selfElem; 
  }

  const keys = Object.keys(self);
  for (let key of keys) {
    selfElem.append(parseDef(self[key], key));
  }

  return selfElem;
  
}