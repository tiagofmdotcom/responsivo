function setHeader(event: any) {
    const removeHeaders = [
        "content-security-policy",
        "x-frame-options",
        "x-xss-protection",
        "x-content-type-options",
        "referrer-policy"
    ];
    return new Promise((resolve) => {
        const byRemoveHeaders = (x:any) => !removeHeaders.includes(x.name.toLowerCase())
        resolve({ responseHeaders: event.responseHeaders.filter(byRemoveHeaders) });
    })
}

browser.browserAction.onClicked.addListener(function (tab) {
    browser.webRequest.onHeadersReceived.removeListener(setHeader);
    browser.webRequest.onHeadersReceived.addListener(
        setHeader,
        { urls: [tab.url], types: ["sub_frame"]},
        ["blocking", "responseHeaders"]
    );

    browser.tabs.executeScript(tab.id, { file: 'app.js' });
});