
const button = new DOMParser().parseFromString(
'<button>Click to open side panel</button>',
'text/html'
).body.firstElementChild!;

button.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
document.body.append(button);

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
// If the received message has the expected format...
if (msg.text === 'report_back') {
    // Call the specified callback, passing
    // the web-page's DOM content as argument
    sendResponse(document.body);
}
});
  
export function fun() {}
