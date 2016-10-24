


export interface SceneComponentProperty {
    name: string;
    type: "scalar" | "ref";
    editorName?: string;
    editorOptions?: { [index: string]: any }
}


export interface SceneComponent {
    name: string;
    properties: Array<SceneComponentProperty>; 
}