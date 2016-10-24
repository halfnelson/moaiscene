import { observable } from 'mobx';
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
    value: any;
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

export type SceneObjectPropertyValues = { [index: string]: SceneObjectPropertyValue } 

export class SceneObject  {
    public name: string; 
    public parent: SceneObject = null;
    
    //determines instance and editor values
    public type: string; 
  
    @observable public properties: SceneObjectPropertyValues = {};
    
    public getFullName(): string {
        return this.getParentPrefix() + this.name;
    }

    public getParentPrefix(): string {
        if (!this.parent) return "";
        return this.parent.getFullName() + ".";    
    }

    public serialize():any {
        return {
            name: this.name,
            parent: this.parent && this.parent.getFullName(),
            type: this.type,
            properties:  Object.keys(this.properties).reduce((out,key)=> { out[key] = this.properties[key].serialize(); return out } ,{}) 
        }
    }
}

export class SceneTree {
    @observable private objects: Array<SceneObject> = [];
    
    public childrenOf(so: SceneObject): Array<SceneObject> {
        return this.objects.filter(x=>x.parent == so)
    }

    public objectByName(name: string): SceneObject {
        return this.objects.find(v=>v.getFullName() == name);
    }

    public append(so: SceneObject) {
        this.objects.push(so);
    }

    public remove(so: SceneObject) {
        this.objects = this.objects.filter(o=>o != so);
    }


}
