import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Device } from './Device';

document.documentElement.innerHTML = '<body><div id="responsivo" /></body>';
document.getElementsByTagName('body')[0].setAttribute('style', 'margin:0');

function isNormalInteger(str: string) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

const initialDeviceWidths = '480, 768, 1024';

const root = () => {
    useEffect(() => {
        browser.storage.local.get('responsivo:viewWidths').then(value => {
            if (value['responsivo:viewWidths']) {
                setDeviceWidths(value['responsivo:viewWidths'])
            }
        });
    }, []);

    const [deviceWidths, setDeviceWidths] = useState(initialDeviceWidths);

    const onChangeDeviceWidths = (event: any) => {
        const value = event.target.value;
        browser.storage.local.set({
            'responsivo:viewWidths': value
        })
        setDeviceWidths(value);
    };

    const [currentLocation, setCurrentLocation] = useState(location.toString());

    /**
     * listen to location changes
     */
    useEffect(() => {
        const listener = () => {
            setCurrentLocation(location.toString());
        }
        window.addEventListener('popstate', listener);
        return () => window.removeEventListener('popstate', listener);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input type="text" style={{ width: '50ch' }} value={deviceWidths} onChange={onChangeDeviceWidths} />
            </div>

            <div style={{ display: 'flex' }}>
                {deviceWidths
                    .split(',')
                    .map(x => x.trim())
                    .filter(isNormalInteger)
                    .map(x => parseInt(x))
                    .map(width => <Device key={width} width={width} location={currentLocation} />)}
            </div>
        </div>);
};

ReactDOM.render(React.createElement(root), document.querySelector('#responsivo'));
