import { Scene } from './scene';
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from './sceneCommands'
import { SceneComponent } from './sceneComponent'
import { SceneTree, SceneObject, SceneObjectPropertyValue } from './sceneObject'
import { SceneEditor } from './sceneEditor'
import * as React from 'react';
import * as ReactDOM from 'react-dom';


export interface EditorProps {
    options: { [index: string]: any;   }
    propertyName: string;
    propertyValue: SceneObjectPropertyValue;
    sceneEditor: SceneEditor;
}

export type EditorList = { [index: string]: React.StatelessComponent<EditorProps> }

export interface SceneEngine {
    name: string;
    executePropertySetCommand(command: PropertySetCommand, sceneTree: SceneTree): Promise<void>;
    executeConstructCommand(command: ConstructCommand, sceneTree: SceneTree): Promise<void>;
    executeDeleteCommand(command: DeleteCommand, sceneTree: SceneTree): Promise<void>;
    previewComponent: typeof React.Component;
    getComponents(): Array<SceneComponent>;
    getEditors(): EditorList;
}

class EngineManager { 

    private engines: {[index: string]: () => Promise<SceneEngine> } = {}

    registerEngine(name: string, engine: () => Promise<SceneEngine>) {
        this.engines[name] = engine;
    }

    engineByName(name: string): Promise<SceneEngine> {
        return this.engines[name]()
    }

}
export var SceneEngines: EngineManager = new EngineManager();
