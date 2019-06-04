# Merriam-Webster's Learner's Dictionary

A third-party browser add-on for the [Merriam-Webster's Learner's Dictionary with Audio](http://learnersdictionary.com/).

Available for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/learners-dictionary/?fbclid=IwAR0_iIPbCs3GpyKHD2zB_5i4SS2cy7Q1Vd3KRBCLNdTUEzhxT2svQaOhnO4) and [Chrome](https://chrome.google.com/webstore/detail/merriam-websters-learners/bibagmeonfmaeiicmgbngjdjahaaejll?fbclid=IwAR1Pm53_MniuTB6brD96absetkupDlHT_8CyZPsV0Qb3jR-yXR9mLUTy9A8). Follow the links to install.

Or, clone the repository and install as a temporary add-on following the instruction [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox).

## Description

This extension allows users to look up any word on the web in a dictionary and bookmark their search results.

It fetches dictionary entries from Merriam-Webster's public API, recursively maps the XML data to HTML nodes, and injects formatted result into the document as a shadow DOM element to prevent CSS leakage.

It also creates a folder for bookmarked searches, and scans the folder to avoid duplicates.

----
*Update 05-28-2009* - The Chrome version is fully functional but has not been updated to include the newest features.
