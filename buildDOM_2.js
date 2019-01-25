function processNode(parentElem, self) {
  const selfElem = document.createElement('div');
  const selfIterable = Array.isArray(self);

  if (selfIterable) {
    for (let item of self) {
      if (typeof item === 'string') {
        const node = document.createElement('span');
        node.innerHTML = item; 
        selfElem.append(node);
        continue;
      }

      if (Array.isArray(item)) {
        processNode(selfElem, item);
        continue;
      }

      const keys = Object.keys(item);
      for (let key of keys) {
        if (typeof item[key] === 'string') {
          const node = document.createElement('span');
          node.className = key;
          node.innerHTML = item[key];
          selfElem.append(node);
          continue;
        }
        const node = document.createElement('div');
        node.className = key;
        selfElem.append(node);
        processNode(selfElem.node, item[key]);
        continue;
      }

    }
      
  }

  // Process self when self is object

  parentElem.append(selfElem);
    
}

const obj = [
  'sense',
  {
  a: 'aaaaaa',
  b: [
    'a string',
    ['merp', 'merp 2'],
  ],
  c: {c:'cccccc'}
  }
]

const parentElem = document.createElement('div');
processNode(parentElem, obj);

// alert(parentElem.firstElementchild);