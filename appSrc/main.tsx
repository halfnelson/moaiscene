import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { MoaiHost } from './lib/moaihost';
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

declare var window: Window;
require('./less/styles.less');

var srcPath = "k:\\dev\\moai-projects\\test175\\src\\";

ipcRenderer.on('open-project', function () {
    var selected = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (selected && selected.length > 0) {
        srcPath = selected[0];
        ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));
    }
});


ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));