import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { SceneObjectPropertyValue, SceneObject, Scene, SceneObjectProperties } from './scene';

interface EditorType {
    name: string;
    constructorToLua(init: SceneObject ): string;
    propertyToLua(objectname: string, propertyname: string, property: SceneObjectPropertyValue): string;
    propertiesToLua(objectname: string, properties: SceneObjectProperties): string;
}

function escapeLuaString(str: string) {
    return str.replace("\\","\\\\").replace("\"","\\\"");
}

function jsArrayToLua(val: Array<any>): string {
    var properties = val.map(v => jsValueToLua(v)).join(",\n");
    return "{ "+ properties + " }"
}

function jsObjectToLua(val: Object): string {
    var properties = Object.getOwnPropertyNames(val).map(name => {
        return name + " = " + jsValueToLua(val[name]) 
    }).join(",\n");
    return "{ "+ properties + " }"
}

export function jsValueToLua(val: any): string {
    if (typeof val == "string") {
        return '"'+escapeLuaString(val)+'"'
    } 
    
    if (typeof val == "undefined") return "Nil"

    if (typeof val == "boolean") return val ? "true" : "false"

    if (typeof val == "number") return val.toString()

    if (val === null || val === undefined) {
        return "Nil"
    }

    if (typeof val == "object") return  Array.isArray(val) ? jsArrayToLua(val) :  jsObjectToLua(val) 

    throw new Error(`Could not convert JS type to lua: ${typeof val}`);
}

export function propertyValueToLua(val: SceneObjectPropertyValue): string {
    if (val.kind == "ref") {
        return val.getName();
    }
    return jsValueToLua(val.value);
}


class BaseObjectEditor implements EditorType {
    name: 'base';
    
    constructorToLua(init: SceneObject): string {
        return "test"
    }
    
    propertyToLua(objectname: string, propertyname: string, property: SceneObjectPropertyValue):string {
        return `${objectname}.${propertyname} = `+jsValueToLua(property.value)
    }
    
    propertiesToLua(objectname: string, properties: SceneObjectProperties): string {
        var luastr = ""
        properties.forEach((val, name) => luastr = luastr + this.propertyToLua(objectname,name, val)+"\n" );
        return luastr;
    }

}

/* editor Commands */
interface Command {
    kind: string 
}


class PropertySetCommand implements Command {
    kind: "propertySet" = "propertySet";
    propertyName: string;
    object: SceneObject;
    oldValue: any;
    newValue: any;
}

class ConstructCommand implements Command {
    kind: "construct" = "construct";
    type: string;
    parent: SceneObject;
    name: string;
}


 




class SceneEditor {
    public types: { [key: string]: EditorType };
    public undostack: Array<Command>;
}