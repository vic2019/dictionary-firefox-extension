document.querySelector('form').addEventListener('submit', saveKey);

function saveKey(event) {
  const key = document.getElementById('api-key').value.trim();

  if (!key) {
    alert('Please enter a valid key.');
    return;
  }

  browser.storage.local.set({
    key: key
  });
  event.preventDefault();

}