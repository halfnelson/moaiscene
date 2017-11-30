import { observable, map, ObservableMap } from 'mobx';
import { SceneObjectProperties } from './components/sceneObjectProperties';
export interface SerializedPropertyValueScalar  {
    kind: 'scalar';
    value: any;
}

export interface SerializedSceneObjectReference  {
    kind: 'ref';
    value: string;
}

export type SerializedSceneObjectPropertyValue = SerializedPropertyValueScalar | SerializedSceneObjectReference;



export class PropertyValueScalar  {
    constructor(value?: any) {
        this.value = value ;
    }
    kind: 'scalar' = 'scalar';
    @observable value: any;
    serialize():SerializedPropertyValueScalar {
        return {
            kind: 'scalar',
            value: this.value,
        }
    }
}

export class SceneObjectReference  {
    kind: 'ref' = 'ref';
    value: SceneObject;
    constructor(value?: SceneObject) {
        this.value = value;
    }
    getName():string  {
       return this.value.getFullName();
    }
    serialize(): SerializedSceneObjectReference {
        return {
            kind: 'ref',
            value: this.getName()
        }
    }
}

export type SceneObjectPropertyValue = PropertyValueScalar | SceneObjectReference;

export type SceneObjectPropertyValues = ObservableMap<SceneObjectPropertyValue> 

export const SceneRootName: string = "SceneRoot"

export class SceneObject  {
    public name: string; 
    public parent: SceneObject = null;
    
    //determines instance and editor values
    public type: string; 
  
    @observable public properties: SceneObjectPropertyValues = map<SceneObjectPropertyValue>();
    
    

    public getFullName(): string {
        return this.getParentPrefix() + this.name;
    }

    public getParentPrefix(): string {
        if (!this.parent) return SceneRootName+".children.";
        return this.parent.getFullName() + ".children.";    
    }

    public serialize():any {
        return {
            name: this.name,
            parent: this.parent && this.parent.getFullName(),
            type: this.type,
            properties: Array.from(this.properties.keys()).reduce((out,key)=> { out[key] = this.properties.get(key).serialize(); return out } ,{}) 
        }
    }
}

export class SceneTree {
    @observable private objects: Array<SceneObject> = [];
    public Root: SceneObject;

    constructor() {
        var root = new SceneObject()
        root.name = "scene";
        root.parent = null;
        root.properties = new ObservableMap<SceneObjectPropertyValue>();
        root.type = "SceneObject";
    }
    
    public childrenOf(so: SceneObject): Array<SceneObject> {
        return this.objects.filter(x=>x.parent == so)
    }

    public objectByName(name: string): SceneObject {
        return this.objects.find(v=>v.getFullName() == name ||v.getFullName() == SceneRootName+".children."+name);
    }

    public append(so: SceneObject) {
        if (!so.parent) {
            so.parent = this.Root;
        }
        this.objects.push(so);
    }

    public remove(so: SceneObject) {
        this.objects = this.objects.filter(o=>o != so);
    }


}
