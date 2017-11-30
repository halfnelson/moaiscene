import { SceneObjectPropertyValue } from "../../sceneObject";
import { SceneComponentPropertyEditorSettings } from "../../sceneComponent";
import { jsValueToLua } from "../../luahelpers";
import { DefaultScalarPropertyEditor } from "../../components/sceneObjectProperties";


export type LuaSetter = (targetname: string, propertyname: string, value: SceneObjectPropertyValue) => string;
export type LuaConstructor = (parentName: string, name: string, type: string, args: Array<SceneObjectPropertyValue>) => string;

interface PropSchema {
    set: LuaSetter,
    editor: SceneComponentPropertyEditorSettings
}

interface PropSet { [index: string]: PropSchema } 

interface ComponentSchema {
    construct: LuaConstructor
    props: PropSet;
}
export interface ComponentList {
    [index: string]: ComponentSchema;
}

function scalarValuesAsArg(scalar: any) {
    if (scalar instanceof Array) {
        return scalar.map(v=> jsValueToLua(v)).join(", ");
    } else {
        return jsValueToLua(scalar);
    }
}

function dotNew(parentName: string, name:string, type: string, args: Array<SceneObjectPropertyValue>) {
    var fullname = parentName+".children."+name;
    return `
        ${fullname} = ${type}.new()
        ${fullname}.parent = ${parentName}
        ${fullname}.name = "${name}"
        ${fullname}.children = {}
    `
}

function scalarPropertySetterAsLua(targetName: string , propertyName: string, value:SceneObjectPropertyValue): string {
    return `${targetName}:set${propertyName}( ${scalarValuesAsArg(value.value)} )`
}

function referencePropertySetterAsLua(targetname: string , propertyname: string, value:SceneObjectPropertyValue): string {
    if (value.kind == "ref") {
        return `${targetname}:set${propertyname}( ${value.value.getFullName()} )`
    }
}
 
var basicEditor = {
    editorClass: DefaultScalarPropertyEditor
}

function prop(setLua: LuaSetter, editor: SceneComponentPropertyEditorSettings) {
    return  {
        editor: editor,
        set: setLua
    }
}

function reference(editor: SceneComponentPropertyEditorSettings) {
    return prop(referencePropertySetterAsLua, editor);
}
function scalar(editor: SceneComponentPropertyEditorSettings) {
    return prop(scalarPropertySetterAsLua, editor);
}

function component(construct: LuaConstructor, props: PropSet ): ComponentSchema {
    return {
        construct: construct,
        props: props
    }
}

function engineComponent(props: PropSet) {
    return component(dotNew, props);
}


export var components: ComponentList = {
    MOAIPartitionViewLayer: engineComponent({
        Viewport: reference(basicEditor),
        Camera: reference(basicEditor)
    }),
    
    MOAISpriteDeck2D: engineComponent({
        Texture: scalar(basicEditor),
        Rect: scalar(basicEditor),
    }),

    MOAIGraphicsProp: engineComponent({
        Deck: reference(basicEditor),
        Partition: reference(basicEditor)
    })
}