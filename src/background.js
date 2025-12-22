console.log('background.js')

import { tunings } from './guitar_tunings.js'

(function() {
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

  async function init() {
    const storedTunings = await chrome.storage.local.get('tunings').tunings || {}
    console.log({ storedTunings })
    
    if (Object.keys(storedTunings).length === 0) {
      const tuningsObject = tunings.reduce((acc, item) => {
        acc[item.file_path] = item.tuning
        return acc
      }, {})
      
      await chrome.storage.local.set({ tunings: tuningsObject }, () => console.log('Initialized tunings in storage'))
    } 
  }

  init()
})()