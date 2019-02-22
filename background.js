"use strict";

function bookmarkToggle(headword) {
  const url = `http://learnersdictionary.com/definition/${headword}`;
  const folderTitle = "Saved Entries from Merriam-Webster's Learner's Dictionary";
  
  
  const checkFolder = browser.bookmarks.search({title: folderTitle});
  checkFolder.then( result => {
    if (result.length > 0) {
      for (let item of result) {
        if (item.type === 'folder') {
          browser.bookmarks.move(item.id, {index: 0});
          return item;
        };
      }
    }
    
    const createFolder = browser.bookmarks.create({
      title: folderTitle,
      type: 'folder'
    });
  })
  .then( folder => {
    if (!folder) return;
    
    const searchBookmark = browser.bookmarks.search({url: url});
    searchBookmark.then( bookmarks => {
      if (bookmarks.length > 0) {
        for (let item of bookmarks) {
          if (item.parentId === folder.id) return;
        }
      };

      browser.bookmarks.create({
        title: headword,
        url: url,
        type: 'bookmark'
      })
      .then( bookmark => {
        browser.bookmarks.move(bookmark.id, {parentId: folder.id});
      });
    });
    
  });

}


browser.runtime.onMessage.addListener(bookmarkToggle);

