"use strict";

let extFolder = undefined;
browser.runtime.onMessage.addListener(router);browser.bookmarks.onRemoved.addListener(handleRemoved);


browser.menus.removeAll().then( () => {
  browser.menus.create({
    id: "Merriam-Webster dictionary extension",
    title: "Look Up in Dictionary",
    contexts: ["selection"]
  });
});


// Allows user to launch dictionary with context menu button
browser.menus.onClicked.addListener( (info, tab) => {
  if (info.menuItemId == "Merriam-Webster dictionary extension") {
    browser.tabs.sendMessage(tab.id, {});
  }
});


function router(message) {
  switch (message.action) {
    case 'update':
    case 'toggle':
      return handleBookmarkAction(message);
    case 'openTab':
      return openTab(message);
  }
}


function handleRemoved(id, removeInfo) {
  // When a bookmark is removed, check if the removed bookmark is the extension's folder. If so, reset extFolder.

  if (removeInfo.node.type !== 'folder') return;
  
  browser.storage.local.get('extFolder').then(retrieved => {
    if (retrieved.extFolder && (retrieved.extFolder.id === id) ) {
      extFolder = undefined;
      browser.storage.local.remove('extFolder');
    }
  });
}


function handleBookmarkAction(message) {
  // When a popup is created for the first time during a session, set extFolder to the extension folder (or create a folder if none exists). Then, check whether the bookmark exists inside the extension folder. 

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


function openTab(message) {
    browser.tabs.create({active: false, url: message.url});
}