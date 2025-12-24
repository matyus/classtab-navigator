console.log('background.js')

import { tunings } from './tunings.js'

async function setDefaultTunings() {
  const storedTunings = (await chrome.storage.local.get('tunings')).tunings || {}

  if (Object.keys(storedTunings).length === 0) {
    await chrome.storage.local.set({ tunings })
   console.log('Installed default tunings')
  }
}

function toggleApp() {
  const app = document.getElementById('x-app')

  if (app.hidden) {
    chrome.storage.local.set({ enabled: true }, () => app.removeAttribute('hidden'))
  } else {
    chrome.storage.local.set({ enabled: false }, () => app.setAttribute('hidden', 'hidden'))
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
})

chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  if (request.type === 'set_default_tunings') {
    await chrome.storage.local.set({ tunings })
  }

  sendResponse({ success: true })

  return true
})

chrome.runtime.onInstalled.addListener(setDefaultTunings)

// initializer
setDefaultTunings()