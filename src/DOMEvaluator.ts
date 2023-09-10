import { execute } from './html/browserDriver';

const button = new DOMParser().parseFromString(
    '<button>Click to open side panel</button>',
    'text/html'
).body.firstElementChild!;

console.log('Yes, it opened');

button.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
document.body.append(button);

async function messagesFromReactApp(
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) {
    console.log(`Received message from React app: ${JSON.stringify(msg)}`);
    if (msg.type == 'execute') {
        await execute();
    }
}

chrome.runtime.onMessage.addListener(messagesFromReactApp);

export function fun() { }


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting === "hello")
            sendResponse({ farewell: "goodbye" });
    }
);

window.onload = function () {
    console.log("All resources finished loading!");
};
