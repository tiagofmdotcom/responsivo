import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Device } from './Device';

document.documentElement.innerHTML = '<body><div id="responsivo" /></body>';
document.getElementsByTagName('body')[0].setAttribute('style', 'margin:0');

function isNormalInteger(str: string) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

const root = () => {
    const initialValue = '480, 768, 1024';

    useEffect(() => {
        browser.storage.local.get('responsivo:viewWidths').then(value => {
            if (value['responsivo:viewWidths']) {
                setDeviceWidths(value['responsivo:viewWidths'])
            }
        });
    }, []);

    const [deviceWidths, setDeviceWidths] = useState(initialValue);

    const onChangeDeviceWidths = (event: any) => {
        const value = event.target.value;
        browser.storage.local.set({
            'responsivo:viewWidths': value
        })
        setDeviceWidths(value);
    };

    return (
        <div style={{ height: '98vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input type="text" style={{ width: '50ch' }} value={deviceWidths} onChange={onChangeDeviceWidths} />
            </div>

            <div style={{ display: 'flex', flexGrow: 1 }}>
                {deviceWidths
                    .split(',')
                    .map(x => x.trim())
                    .filter(isNormalInteger)
                    .map(x => parseInt(x))
                    .map(width => <Device key={width} width={width} />)}
            </div>
        </div>);
};

ReactDOM.render(React.createElement(root), document.querySelector('#responsivo'));
