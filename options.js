const notice = document.getElementById('notice');
document.querySelector('#setKey').addEventListener('click', saveKey);
document.querySelector('#default').addEventListener('click', event => {
  browser.storage.local.set({key: undefined});
  notice.style.color = '#00cc00';
  notice.innerHTML = 'Demo key saved!';
  event.preventDefault();
});

function saveKey(event) {
  const key = document.getElementById('api-key').value.trim();

  if (!key) {
    notice.style.color = '#ff0000';
    notice.innerHTML = 'Please enter a valid key.';
    event.preventDefault();
    return;
  }

  notice.style.color = '#00cc00';
  notice.innerHTML = 'Key saved!';
  browser.storage.local.set({
    key: key
  });
  event.preventDefault();

}