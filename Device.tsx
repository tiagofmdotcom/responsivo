import React, { useEffect, useRef } from 'react';

const addEventListeners = (iFrame: HTMLIFrameElement) => {
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
        iFrame.scrolling = 'no';
        iFrame.src = location;
        divRef.current.appendChild(iFrame);
        addEventListeners(iFrame);

        // TODO listen to domContentChange of iframe contentWindow
        // or similar instead of setInterval
        const intervalHandle = setInterval(() => {
            try {
                const borderColor = iFrame.contentWindow.document.body.scrollWidth > parseInt(iFrame.width) ? 'red' : 'black';
                const style = `height: ${iFrame.contentWindow.document.body.scrollHeight}px; border: 1px solid ${borderColor};`;
                iFrame.setAttribute('style', style);
            } catch {
                clearInterval(intervalHandle);
            }
        }, 2000);
    });

    return <div ref={divRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
            {width}
        </div>
    </div>;
};
