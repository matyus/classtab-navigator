console.log('background.js')

function toggleApp() {
  const app = document.getElementById('x-app')


  if (app.hidden) {
    app.removeAttribute('hidden')
    chrome.storage.local.set({ enabled: true });
  } else {
    app.setAttribute('hidden', 'hidden')
    chrome.storage.local.set({ enabled: false });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleApp
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});
