"use strict";

let dictFolder;
const currentBookmarkList = [];
browser.runtime.onMessage.addListener(router);browser.bookmarks.onRemoved.addListener(handleRemoved);


function handleRemoved(id, removeInfo) {
  if (removeInfo.node.type === 'folder') dictFolder = undefined;
}


function router(message) {

  switch (message.action) {
    case 'update':
      return new Promise( resolve => {
        resolve(bookmarkStatus(message));
      });
      break;
    case 'toggle':
      return new Promise( resolve => {
        resolve(bookmarkToggle(message));
      });
      break;
    default:
  }
  
}


function bookmarkStatus(message) {
  const folderTitle = "Merriam-Webster's Learner's Dictionary - Saved Entries";
  if (!dictFolder) {
    const checkFolder = browser.bookmarks.search({title: folderTitle});
    
    return checkFolder.then( result => {
      if (result.length > 0) {
        for (let item of result) {
          if (item.type === 'folder') {
            dictFolder = item;
            return item;
          }
        }
      }
      
      const createFolder = browser.bookmarks.create({
        title: folderTitle,
        type: 'folder'
      });
      createFolder.then( folder => {
        dictFolder = folder;
      });     
    }).then( checkBookmark );    
  } else {    
    return new Promise( resolve => {
      resolve(checkBookmark(dictFolder));
    });
  }
  
  function checkBookmark(folder) {
    if (!folder) return false;
    
    const searchBookmark = browser.bookmarks.search({url: message.url});
    return searchBookmark.then( bookmarks => {
      if (bookmarks.length > 0) {
        for (let item of bookmarks) {
          if (item.parentId === folder.id) return item.id;
        }    
      }

      return false;
    });  
  }

}


function bookmarkToggle(message) {
  const getId = bookmarkStatus(message);
  return getId.then( id => {
    if (!id) {
      return browser.bookmarks.create({
        title: message.word,
        url: message.url,
        type: 'bookmark'
      }).then( bookmark => {
        browser.bookmarks.move(bookmark.id, {parentId: dictFolder.id});
        return bookmark.id;
      });    

    } else {
      return browser.bookmarks.remove(id).then( () => false );
    }
  });

}
