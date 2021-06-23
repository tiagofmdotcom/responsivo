import React, { useEffect, useRef } from 'react';

enum EventType {
    DeviceScroll = 'resposivo:device:scroll'
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

export const Device = ({ width }: { width: number; }): JSX.Element => {
    const iFrameRef = useRef<HTMLIFrameElement>();

    useEffect(() => {
        const contentWindow = iFrameRef.current.contentWindow;
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
        return () => contentWindow.removeEventListener('scroll', listenerOnScroll);
    }, []);

    useEffect(() => {
        const listenerOnScrollEvent = (event: DeviceScrollEvent) => {
            lastReceivedScrollEvent = {
                now: Date.now(),
                event
            };

            // ignore event from self
            if (event.data.width === width) {
                return;
            }

            scrollToPosition(iFrameRef, event);
        };
        document.addEventListener(EventType.DeviceScroll, listenerOnScrollEvent as any);
        return () => document.removeEventListener(EventType.DeviceScroll, listenerOnScrollEvent as any);
    }, []);

    return <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
            {width}
        </div>
        <iframe loading="lazy" ref={iFrameRef} frameBorder={0} width={width} style={{ height: '100%' }} src={location.toString()} />

    </div>;
};

function scrollToPosition(iFrameRef: React.MutableRefObject<HTMLIFrameElement>, event: DeviceScrollEvent) {
    const contentWindow = iFrameRef.current.contentWindow;
    const newPosition = Math.floor((contentWindow.document.documentElement.scrollHeight - contentWindow.innerHeight) * event.data.scrollPosition);
    contentWindow.scrollTo(0, newPosition);
}

