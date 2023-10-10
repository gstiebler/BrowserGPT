
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open side panel',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

async function openSidePanelForTab(tabId) {
  await chrome.sidePanel.open({ tabId });
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'index.html',
    enabled: true
  });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (message.type === 'open_side_panel') {
      openSidePanelForTab(sender.tab.id);
    }
  })();
});
