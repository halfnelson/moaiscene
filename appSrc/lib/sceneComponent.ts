import { IReactComponent } from "mobx-react";
import { EditorProps } from "./sceneEngines";
import { SceneObjectPropertyValue, SceneObject } from "./sceneObject";



export interface SceneComponentPropertyEditorSettings {
    editorClass: React.ComponentClass<EditorProps>;
    editorOptions?: { [index: string]: any };
}

export interface SceneComponentProperty {
    name: string;
    editor: SceneComponentPropertyEditorSettings;
}


export interface SceneComponent {
    name: string;
    properties: Array<SceneComponentProperty>; 
}