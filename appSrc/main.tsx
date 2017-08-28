import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { SceneExplorer } from './lib/components/sceneExplorer';
import { ScenePreview } from './lib/components/scenePreview';
import { ScenePalette } from './lib/components/scenePalette';
import { SceneObjectProperties } from './lib/components/sceneObjectProperties';
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

import { DockPanel } from 'phosphor-dockpanel';
import { SplitPanel } from 'phosphor-splitpanel';
import { Message } from 'phosphor-messaging';
import { ResizeMessage, Widget } from 'phosphor-widget';

import { SceneEditor } from './lib/sceneEditor';
import './lib/engines/base/baseEngine';
import './lib/engines/moai/moaiEngine';

//declare var window: Window;
require('./less/styles.less');

var srcPath = "k:\\dev\\moai-projects\\test175\\src\\";

ipcRenderer.on('open-project', function () {
    /*var selected = dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (selected && selected.length > 0) {
        srcPath = selected[0];
        ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));
    }*/
});

class ReactWidget<T extends React.ComponentClass> extends Widget {
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

async function loadMockScene(editor: SceneEditor) {
    await editor.loadNewScene("moai");
    
}


function main() {

    var app = {};
    window['app'] = app;

    var sceneEditor = new SceneEditor();
    app['sceneEditor'] = sceneEditor;


    //Setup app panels
    var rootpanel = new SplitPanel();
    rootpanel.id="app";
    
    rootpanel.orientation = SplitPanel.Horizontal;
    rootpanel.spacing = 5;

    var leftpanel = new DockPanel();
    leftpanel.id = "areaLeft";
    var centrepanel = new DockPanel();
    centrepanel.id = "areaCentre";
    var rightpanel = new DockPanel();
    rightpanel.id = "areaRight";

    rootpanel.addChild(leftpanel);
    rootpanel.addChild(centrepanel);
    rootpanel.addChild(rightpanel);

    SplitPanel.setStretch(leftpanel,0);
    SplitPanel.setStretch(centrepanel,1);
    SplitPanel.setStretch(rightpanel,0);
    
    rootpanel.setSizes([1,3,1]);


    //load our Editor panels
   
    var sceneExplorer = new ReactWidget(SceneExplorer, { sceneEditor: sceneEditor });
    sceneExplorer.title.text="Scene";

    var scenePreview = new ReactWidget(ScenePreview, { sceneEditor: sceneEditor });
    scenePreview.title.text="Preview";

    var scenePalette = new ReactWidget(ScenePalette, { sceneEditor: sceneEditor });
    scenePalette.title.text="Components";
   
    var sceneObjectProperties = new ReactWidget(SceneObjectProperties, { sceneEditor: sceneEditor,  });
    sceneObjectProperties.title.text="Properties";

    leftpanel.insertLeft(sceneExplorer);
    centrepanel.insertLeft(scenePreview);
    rightpanel.insertLeft(scenePalette);
    rightpanel.insertBottom(sceneObjectProperties)

    rootpanel.attach(document.body);
    
    window.onresize = () => { rootpanel.update() };

    loadMockScene(sceneEditor).then(function() {
        sceneEditor.createObject(null,"test", "Square",[]);
        var parent = sceneEditor.objectByName("test");
        sceneEditor.createObject(parent, "child1", "Circle", []);
        sceneEditor.createObject(parent, "child2", "Circle", []);
        parent = sceneEditor.objectByName("test.child1");
        sceneEditor.createObject(parent, "child11", "Square", []);
    });
 
}

window.onload = main;
//ReactDOM.render(<MoaiHost sourcePath={srcPath} key={srcPath} />, document.getElementById('root'));
window['keys'] = {};
window.onkeyup = function(e) {window['keys'][e.key]=false;}
window.onkeydown = function(e) {
    window['keys'][e.key]=true;
}

console.log('web assembly', window['WebAssembly']);