"use strict";

let extFolder = undefined;
browser.runtime.onMessage.addListener(handleMessage);browser.bookmarks.onRemoved.addListener(handleRemoved);


function handleRemoved(id) {
  browser.storage.local.get('extFolder').then(retrieved => {
    if (retrieved.extFolder && (retrieved.extFolder.id === id) ) {
      extFolder = undefined;
      browser.storage.local.remove('extFolder');
    }
  });
}


function handleMessage(message) {
  if (extFolder) {
    return getBookmark(extFolder).then(performAction);
  } else {
    return getFolder().then(getBookmark).then(performAction);
  }

  function getFolder() {
    return browser.storage.local.get('extFolder').then( retrieved => {
      if (retrieved.extFolder) {
        extFolder = retrieved.extFolder;
        return retrieved.extFolder;

      } else {
        const folderTitle = "Merriam-Webster's Learner's Dictionary - Saved Entries";
      
        return browser.bookmarks.create({
          title: folderTitle,
          type: 'folder'
        }).then( folder => {
          extFolder = folder;
          browser.storage.local.set({extFolder: folder});
          });
          return folder;
        });
      }
    });
  }
  
  function getBookmark(folder) {
    return browser.bookmarks.search({url: message.url}).then( bookmarks => {
      if (bookmarks.length > 0) {
        for (let item of bookmarks) {
          if (item.parentId === folder.id) return item.id;
        }    
      }
      return false;
    }); 
  }
    
  function performAction(id) {
    switch (message.action) {
      case 'update':
        return Boolean(id);
      case 'toggle':
        return bookmarkToggle(id);
      default:
        return false;
    }
  }

  function bookmarkToggle(id) {
      if (!id) {
        browser.bookmarks.create({
          title: message.word,
          url: message.url,
          type: 'bookmark'
        }).then( bookmark => {
          browser.bookmarks.move(bookmark.id, {parentId: extFolder.id});
        });   
        return true;

      } else {
        browser.bookmarks.remove(id);
        return false;
      }
  }

}


