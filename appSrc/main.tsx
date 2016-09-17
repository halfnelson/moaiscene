import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { MoaiHost } from './lib/moaihost';
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

import { DockPanel } from 'phosphor-dockpanel';
import { Message } from 'phosphor-messaging';
import { ResizeMessage, Widget } from 'phosphor-widget';



//declare var window: Window;
require('./less/styles.less');

var srcPath = "k:\\dev\\moai-projects\\test175\\src\\";

ipcRenderer.on('open-project', function () {
    var selected = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (selected && selected.length > 0) {
        srcPath = selected[0];
        ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));
    }
});

class ReactWidget<T extends typeof React.Component> extends Widget {
    component: T;
    width: number;
    height: number;
    props: any;
    constructor(component: T, props: any) {
        super();
        this.props = props;
        this.component = component;
        console.log("got constructed")
    }

    protected onResize(msg: ResizeMessage): void {
        this.width = msg.width;
        this.height = msg.height;
        console.log("got resize")
        this.update();
    }

    protected onUpdateRequest(msg: Message): void {
        console.log("gotupdate");
        ReactDOM.render(<this.component {...this.props} layoutWidth={this.width} layoutHeight={this.height}></this.component>, this.node)
        this.fit();
    }
}


function createContent(title: string): Widget {
  var widget = new Widget();
  widget.addClass('content');
  widget.addClass(title.toLowerCase());

  widget.title.text = title;
  widget.title.closable = true;

  return widget;
}

function main() {
    var panel = new DockPanel();
    panel.id="app";

    var moaiHost = new ReactWidget(MoaiHost, { sourcePath: srcPath, key: srcPath });

    panel.insertLeft(moaiHost);
    moaiHost.title.text="Scene";
    
    var r1 = createContent('Red');


    panel.attach(document.body);
    window.onresize = () => { panel.update() };
}

window.onload = main;
//ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));
window['keys'] = {};
window.onkeyup = function(e) {window['keys'][e.key]=false;}
window.onkeydown = function(e) {
    window['keys'][e.key]=true;
}