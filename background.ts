function setHeader(event: any) {
    const removeHeaders = [
        "content-security-policy",
        "x-frame-options",
        "x-xss-protection",
        "x-content-type-options",
        "referrer-policy"
    ];
    return new Promise((resolve) => {
        const byRemoveHeaders = (x: any) => !removeHeaders.includes(x.name.toLowerCase())
        resolve({ responseHeaders: event.responseHeaders.filter(byRemoveHeaders) });
    })
}

browser.browserAction.onClicked.addListener(function (tab) {
    browser.webRequest.onHeadersReceived.removeListener(setHeader);
    if (!tab.url) {
        return;
    }
    const tabURL = new URL(tab.url);
    browser.webRequest.onHeadersReceived.addListener(
        setHeader,
        { urls: [`${tabURL.protocol}//${tabURL.host}/*`], types: ["sub_frame"], tabId: tab.id },
        ["blocking", "responseHeaders"]
    );

    browser.tabs.executeScript(tab.id, { file: 'app.js' });
});