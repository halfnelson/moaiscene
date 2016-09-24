import { jsValueToLua } from './lib/luahelpers'

import * as  Scene from './lib/scene'


//create a viewport
var viewport = new Scene.SceneObject();
viewport.name = "Viewport1";
viewport.type = "MOAIViewport";

viewport.properties["Size"] = new Scene.PropertyValueScalar(
    [ 
        "$=MOAIEnvironment.horizontalResolution",
        "$=MOAIEnvironment.verticalResolution",
    ]
);

viewport.properties["Scale"] = new Scene.PropertyValueScalar(
    [ 
        "$=MOAIEnvironment.horizontalResolution*2",
        "$=MOAIEnvironment.verticalResolution*2"
    ]
);


//create a layer
var layer = new Scene.SceneObject();
layer.name = "Layer1";
layer.type = "MOAILayer";
layer.properties["Viewport"] = new Scene.SceneObjectReference(viewport);

//holder for decks
var decks = new Scene.SceneObject();
decks.type = "Table";
decks.name = "Decks";

//create a deck
var deck = new Scene.SceneObject();
deck.type = "MOAIGfxQuad2D";
deck.name = "Deck1";
deck.parent = new Scene.SceneObjectReference(decks);
deck.properties["Texture"] = new Scene.PropertyValueScalar("moai.png");
deck.properties["Rect"], new Scene.PropertyValueScalar([-64, -64, 64, 64]);

//create a prop
var prop = new Scene.SceneObject();
prop.name = "Prop1";
prop.type = "MOAIProp2D";
prop.parent = new Scene.SceneObjectReference(layer);
prop.properties["Deck"] = new Scene.SceneObjectReference(deck);
prop.properties["Layer"] = new Scene.SceneObjectReference(layer);

//create a test scene
var scene = new Scene.Scene();
scene.objects.push(viewport, layer, decks, deck, prop);

var sceneJson = JSON.stringify(scene,null,2);
console.log(sceneJson);