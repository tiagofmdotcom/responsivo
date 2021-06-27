/**
 * remove security headers allowing
 * site to be displayed in iframe
 * @param event 
 * @returns 
 */
function removeSecurityHeaders(event: any) {
    const removeHeaders = [
        "content-security-policy",
        "x-frame-options",
    ];
    return new Promise((resolve) => {
        const byRemoveHeaders = (x: any) => !removeHeaders.includes(x.name.toLowerCase())
        resolve({ responseHeaders: event.responseHeaders.filter(byRemoveHeaders) });
    })
}

browser.browserAction.onClicked.addListener(function (tab) {
    browser.webRequest.onHeadersReceived.removeListener(removeSecurityHeaders);
    if (!tab.url) {
        return;
    }
    const tabURL = new URL(tab.url);
    browser.webRequest.onHeadersReceived.addListener(
        removeSecurityHeaders,
        { urls: [`${tabURL.protocol}//${tabURL.host}/*`], types: ["sub_frame"], tabId: tab.id },
        ["blocking", "responseHeaders"]
    );

    browser.tabs.executeScript(tab.id, { file: 'app.js' });
});