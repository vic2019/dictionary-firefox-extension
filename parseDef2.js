function parseDef(self, className) {

  if (typeof self !== 'object' && self !== null) {
    const selfElem = document.createElement('span');
    selfElem.className = className;
    selfElem.innerHTML = self;
    return selfElem;
  }

  if (Array.isArray(self)) {
    const selfElem = document.createElement('div');
    selfElem.className = className;
    let childClassName = '';

    if (typeof self[0] === 'string' && self.length > 1) {
      if (typeof self[1] === 'object') {
        childClassName = self[1];
      }
    }

    for (let item of self) {
      selfElem.append(parseDef(item, childClassName));
    }
    
    return selfElem; 
  }

  
}