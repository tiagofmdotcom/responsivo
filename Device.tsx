import React, { useEffect, useRef } from 'react';

enum EventType {
    DeviceScroll = 'resposivo:device:scroll',
}

class DeviceScrollEvent extends Event {
    data: {
        scrollPosition: number,
        width: number,
    }
}

let lastReceivedScrollEvent: {
    now: number,
    event?: DeviceScrollEvent
} = {
    now: 0,
};

const addEventListeners = (iFrame: HTMLIFrameElement, width: number) => {
    /**
     * setup listener for scroll events
     * send event DeviceScroll to siblings
     */
    const contentWindow = iFrame.contentWindow;
    const listenerOnScroll = () => {
        const scrollEvent = new DeviceScrollEvent(EventType.DeviceScroll);
        scrollEvent.data = {
            scrollPosition: (contentWindow.scrollY / (contentWindow.document.documentElement.scrollHeight - contentWindow.innerHeight)),
            width: width,
        }
        if (lastReceivedScrollEvent?.event?.data?.width === width || (Date.now() - lastReceivedScrollEvent.now > 250)) {
            document.dispatchEvent(scrollEvent);
        }
    };
    contentWindow.addEventListener('scroll', listenerOnScroll);

    /**
     * listen to scroll events of siblings
     */
    const listenerOnScrollEvent = (event: DeviceScrollEvent) => {
        lastReceivedScrollEvent = {
            now: Date.now(),
            event
        };

        // ignore event from self
        if (event.data.width === width) {
            return;
        }

        scrollToPosition(iFrame, event);
    };
    document.addEventListener(EventType.DeviceScroll, listenerOnScrollEvent as any);

    /**
     * try detecting location changes of iframe contentwindow
     * TODO: figure out why setTimeout seems to be necessary
     */
    iFrame.contentWindow.window.addEventListener('unload', () => setTimeout(() => {
        if (iFrame.contentWindow.location.toString() === window.location.toString()) {
            return;
        }
        window.history.pushState({}, null, iFrame.contentWindow.location.toString());
        window.dispatchEvent(new Event('popstate'));
    }, 10));
}

function resizeIFrameToFitContentHeight() {
    const iFrame = this as HTMLIFrameElement;

    // TODO listen to domContentChange of iframe contentWindow
    // or similar instead of setInterval
    const intervalHandle = setInterval(() => {
        try {

            const scrollHeightTolerance = 100;
            const borderColor = iFrame.contentWindow.document.body.scrollWidth > parseInt(iFrame.width) ? 'red' : 'black';
            const style = `height: ${iFrame.contentWindow.document.body.scrollHeight + scrollHeightTolerance}px; border: 1px solid ${borderColor};`;
            iFrame.setAttribute('style', style);
        } catch {
            clearInterval(intervalHandle);
        }
    }, 2000);
}

export const Device = ({ width, location }: { width: number, location: string }): JSX.Element => {
    const divRef = useRef<HTMLDivElement>();

    /**
     * recreating iframes on every rerender because 
     * of inconsitent behaviour of event listeners
     * when following the react way
     */
    useEffect(() => {
        divRef.current.children.namedItem('iframe')?.remove();
        const iFrame = document.createElement('iframe');
        iFrame.name = 'iframe';
        iFrame.setAttribute('loading', 'lazy');
        iFrame.width = width.toString();
        iFrame.height = '500';
        iFrame.addEventListener('load', resizeIFrameToFitContentHeight);
        iFrame.scrolling = 'no';
        iFrame.src = location;
        divRef.current.appendChild(iFrame);
        addEventListeners(iFrame, width);
    });

    return <div ref={divRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
            {width}
        </div>
    </div>;
};

function scrollToPosition(iFrame: HTMLIFrameElement, event: DeviceScrollEvent) {
    const contentWindow = iFrame.contentWindow;
    const newPosition = Math.floor((contentWindow.document.documentElement.scrollHeight - contentWindow.innerHeight) * event.data.scrollPosition);
    contentWindow.scrollTo(0, newPosition);
}
