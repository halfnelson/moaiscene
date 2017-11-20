import DevTools from "mobx-react-devtools";

import { SceneExplorer } from "./lib/components/sceneExplorer";
import { ScenePreview } from "./lib/components/scenePreview";
import { ScenePalette } from "./lib/components/scenePalette";
import { SceneObjectProperties } from "./lib/components/sceneObjectProperties";
import { SceneEditor } from "./lib/sceneEditor";

import { DockPanel } from "phosphor-dockpanel";
import { SplitPanel } from "phosphor-splitpanel";
import { ReactWidget } from "./lib/reactWidget";
import { PropertySetCommand } from "./lib/sceneCommands";
import { PropertyValueScalar, SceneObjectReference } from "./lib/sceneObject";


//declare var window: Window;
require("./less/styles.less");


function main() {
    const {webFrame} = require('electron')
    webFrame.registerURLSchemeAsPrivileged('file')
    
    var app = {};
    window["app"] = app;

    var sceneEditor = new SceneEditor();
    app["sceneEditor"] = sceneEditor;

    //Setup app panels
    var rootpanel = new SplitPanel();
    rootpanel.id = "app";

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

    SplitPanel.setStretch(leftpanel, 0);
    SplitPanel.setStretch(centrepanel, 1);
    SplitPanel.setStretch(rightpanel, 0);

    rootpanel.setSizes([1, 3, 1]);

    //load our Editor panels

    var sceneExplorer = new ReactWidget(SceneExplorer, {
        sceneEditor: sceneEditor
    });
    sceneExplorer.title.text = "Scene";

    var scenePreview = new ReactWidget(ScenePreview, {
        sceneEditor: sceneEditor
    });
    scenePreview.title.text = "Preview";

    var scenePalette = new ReactWidget(ScenePalette, {
        sceneEditor: sceneEditor
    });
    scenePalette.title.text = "Components";

    var sceneObjectProperties = new ReactWidget(SceneObjectProperties, {
        sceneEditor: sceneEditor
    });
    sceneObjectProperties.title.text = "Properties";

    leftpanel.insertLeft(sceneExplorer);
    centrepanel.insertLeft(scenePreview);
    rightpanel.insertLeft(scenePalette);
    rightpanel.insertBottom(sceneObjectProperties);

    rootpanel.attach(document.body);

    window.onresize = () => {
        rootpanel.update();
    };

    async function loadMockScene(editor: SceneEditor) {
        await editor.loadNewScene("moai");
    }

    loadMockScene(sceneEditor).then(function () {
        sceneEditor.createObject(null,"layer1","MOAIPartitionViewLayer",[]);
        var layer = sceneEditor.objectByName("layer1");
        if (!layer) {
            console.error("Couldn't find layer");
        }

        sceneEditor.createObject(null, "prop1", "MOAIGraphicsProp", []);
        var prop = sceneEditor.objectByName("prop1");
        if (!prop) {
            console.error("Couldn't find prop");
        }

        sceneEditor.createObject(null, "gfxQuad", "MOAISpriteDeck2D", []);
        var deck = sceneEditor.objectByName("gfxQuad");
        if (!deck) {
            console.error("Couldn't find deck");
        }


        sceneEditor.clearSelection();
        sceneEditor.addToSelection(deck);

        sceneEditor.setPropertyOnSelected("Texture", new PropertyValueScalar("moai.png"));
        sceneEditor.setPropertyOnSelected("Rect", new PropertyValueScalar([-64, -64, 64, 64]));
        
        sceneEditor.clearSelection();
        sceneEditor.addToSelection(prop);

        sceneEditor.setPropertyOnSelected("Deck", new SceneObjectReference(deck));
        sceneEditor.setPropertyOnSelected("Partition", new SceneObjectReference(layer));

        sceneEditor.clearSelection();
        


       // sceneEditor.createObject(null, "test", "Square", []);
       // var parent = sceneEditor.objectByName("test");
       // sceneEditor.createObject(parent, "child1", "Circle", []);
       // sceneEditor.createObject(parent, "child2", "Circle", []);
       // parent = sceneEditor.objectByName("test.child1");
        //sceneEditor.createObject(parent, "child11", "Square", []);
    });
}

window.onload = main;

window["keys"] = {};
window.onkeyup = function (e) {
    window["keys"][e.key] = false;
};
window.onkeydown = function (e) {
    window["keys"][e.key] = true;
};
