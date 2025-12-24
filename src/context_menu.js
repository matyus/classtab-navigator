console.log('context_menu.js')

function createContextMenu() {
  chrome.contextMenus.create({
    id: 'label-menu',
    title: 'Label a tab',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'none',
    parentId: 'label-menu',
    title: 'None',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'red', 
    parentId: 'label-menu',
    title: 'Red',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'green',
    parentId: 'label-menu',
    title: 'Green',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'blue',
    parentId: 'label-menu',
    title: 'Blue',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'yellow',
    parentId: 'label-menu',
    title: 'Yellow',
    contexts: ['link']
  })
  chrome.contextMenus.create({
    id: 'purple',
    parentId: 'label-menu',
    title: 'Purple',
    contexts: ['link']
  })
}

chrome.runtime.onInstalled.addListener(() => createContextMenu())
chrome.runtime.onStartup.addListener(() => createContextMenu())

chrome.contextMenus.onClicked.addListener(async ({ parentMenuItemId, linkUrl, menuItemId }, tab) => {
  if (parentMenuItemId !== 'label-menu') return

  const labels = (await chrome.storage.local.get('labels')).labels || {}

  if (/http(.+)classtab.org(.+).txt/.test(linkUrl)) {
    const path = linkUrl.replace('https://www.classtab.org/', '')

    labels[path] = menuItemId

    await chrome.storage.local.set({ labels })

    chrome.tabs.sendMessage(tab.id, { type: 'set_label', path, label: labels[path] })
  }
})