import { SceneEngine, SceneEngineObjectType } from './sceneEngine'
import { SceneObject, SceneObjectPropertyValue } from './sceneObject'

function basicProperty(name:string) {
    return {
        setValueAsCode(obj: SceneObject, propertyname: string, value: SceneObjectPropertyValue): string {
            return obj.getFullName() + "."+propertyname + ' = ' + JSON.stringify(value.serialize().value); 
        }
    }
}

function basicConstructor(typename: string) {
    return function(parent: SceneObject, name: string, args: Array<SceneObjectPropertyValue>) {
        return parent.getFullName() + "."+name + ' = new ' +typename+"()"; 
    } 
}

export class BasicSceneEngine implements SceneEngine {
    id: string = 'BASIC';
    initialize() {};
    types: { [index: string]: SceneEngineObjectType } = {
        box: {
            name: 'box',
            properties: {
                width: basicProperty("width"),
                height: basicProperty("height")
            },
            createAsCode: basicConstructor("Box"),
            destroyAsCode: function(obj:SceneObject):string { return "" }
        },
        circle: {
            name: 'circle',
            properties: {
                radius: basicProperty("radius")
            },
            createAsCode: basicConstructor("Circle"),
            destroyAsCode: function(obj:SceneObject):string { return "" }
        }
    };
    create(parent: SceneObject, name: string, type: string, args: Array<SceneObjectPropertyValue>): Array<SceneObject> {
        var typeProps = this.types[type].properties;
        var o = new SceneObject();
        o.parent = new SceneObjectReference(parent);
        o.name = name;
        o.type = type;
        Object.keys(typeProps).forEach(k => o.properties[k] = new PropertyValueScalar())
        return [o]
    }
    destroy(obj: SceneObject) {}
    setValue(obj: SceneObject, propertyname: string, value: SceneObjectPropertyValue): SceneObjectPropertyValue {
        return value;
    }
}