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

const storage = {
    _userAgent: '',
    get userAgent() {
        return this._userAgent;
    },
    set userAgent(value) {
        this._userAgent = value;
    }
}

function setupRemoveSecurityHeaders(tabURL: URL, tab: browser.tabs.Tab) {
    browser.webRequest.onHeadersReceived.removeListener(removeSecurityHeaders);

    browser.webRequest.onHeadersReceived.addListener(
        removeSecurityHeaders,
        { urls: [`${tabURL.protocol}//${tabURL.host}/*`], types: ["sub_frame"], tabId: tab.id },
        ["blocking", "responseHeaders"]
    );
}

type WebRequestOnBeforeSendHeadersEvent = any;
function rewriteUserAgentHeader(event: WebRequestOnBeforeSendHeadersEvent) {
    for (var header of event.requestHeaders) {
        if (header.name.toLowerCase() === "user-agent") {
            header.value = storage.userAgent;
        }
    }
    return { requestHeaders: event.requestHeaders };
}

function setupUserAgentSpoofing(tabURL: URL, tab: browser.tabs.Tab, storage: any) {
    browser.webRequest.onBeforeSendHeaders.removeListener(rewriteUserAgentHeader);

    browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
        { urls: [`${tabURL.protocol}//${tabURL.host}/*`], types: ["sub_frame"], tabId: tab.id },
        ["blocking", "requestHeaders"]);

    browser.runtime.onMessage.addListener((request) => {
        switch (request.action) {
            case 'responsivo:setUserAgent':

                storage.userAgent = request.data;
        }
    });
}

browser.browserAction.onClicked.addListener(function (tab) {
    if (!tab.url) {
        return;
    }

    const tabURL = new URL(tab.url);

    setupRemoveSecurityHeaders(tabURL, tab);
    setupUserAgentSpoofing(tabURL, tab, storage);

    browser.tabs.executeScript(tab.id, { file: 'app.js' });
});
