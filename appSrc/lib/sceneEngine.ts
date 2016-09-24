import { SceneObject, SceneObjectPropertyValue, PropertyValueScalar } from './sceneObject'


export interface SceneEngineObjectPropertyType {
    editorType: string
}

export interface SceneEngineObjectType {
    name: string;
    properties: { [index: string]: SceneEngineObjectPropertyType };
}

export interface SceneEngine {
    id: string;
    initialize(): void;
    types: { [index: string]: SceneEngineObjectType }
    create(parent: SceneObject, name: string, type: string, args: Array<SceneObjectPropertyValue>): Array<SceneObject>;
    destroy(obj: SceneObject);
    setValue(obj: SceneObject, propertyname: string, value: SceneObjectPropertyValue);
    exportAsCode(scene: Scene);
}

