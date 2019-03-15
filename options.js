document.querySelector('#setKey').addEventListener('click', saveKey);
document.querySelector('#default').addEventListener('click', () => {
  browser.storage.local.set({key: undefined});
  window.alert('Demo key saved!');
});

function saveKey(event) {
  const key = document.getElementById('api-key').value.trim();

  if (!key) {
    window.alert('Please enter a valid key.');
    return;
  }

  browser.storage.local.set({
    key: key
  });
  // event.preventDefault();

}