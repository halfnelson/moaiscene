
interface Serializable {
    toJSON(): any; 
}

class PropertyValueScalar implements Serializable  {
    kind: 'scalar' = 'scalar';
    value: any;
    toJSON():any {
        return {
            kind: 'scalar',
            value: this.value,
        }
    }
}

class SceneObjectReference implements Serializable {
    kind: 'ref' = 'ref';
    value: SceneObject;
    getName():string  {
       return this.value.getFullName();
    }
    toJSON():any {
        return {
            kind: 'ref',
            value: this.getName()
        }
    }
}

export type SceneObjectPropertyValue = PropertyValueScalar | SceneObjectReference;

export type SceneObjectProperties = Map<string,SceneObjectPropertyValue> 

export class SceneObject implements Serializable {
    public name: string; 
    public parent: SceneObjectReference;
    
    //determines instance and editor values
    public type: string; 
    public constructorArgs: Array<SceneObjectPropertyValue> = [];
    public properties: SceneObjectProperties = new Map<string, SceneObjectPropertyValue>();
    
    public getFullName(): string {
        return this.getParentPrefix() + name;
    }

    public getParentPrefix(): string {
        if (!this.parent) return "";
        return this.parent.value.getFullName() + ".";    
    }

    public toJSON():any {
        return {
            name: this.name,
            parent: this.parent && this.parent.toJSON() || null,
            type: this.type,
            constructorArgs: this.constructorArgs.map(a => a.toJSON()),
            properties:  new Map(Array.from(this.properties).map<[string, SceneObjectPropertyValue]>(v => [v[0], v[1].toJSON()])) 
        }
    }
}

export class Scene {
    public sceneEnv: Array<String> = [];
    public objects: Array<SceneObject> = [];
    public objectByName(name: string) {
         this.objects.find(o => o.getFullName() == name );
    }
}


/*
eg
 editorPreload.lua
 flower = require('lib/flower.lua')

 sample.scene
 {
    SceneEnv: ['editorPreload.lua'],
    Objects: [
        {
            name: 'props',
            type: 'Table'    
        },
        { 
            name: 'testprop',
            parent: 'props'
            type: 'MOAIProp'
            properties: {
                            'Loc': {
                                type: 'scalar',
                                value: [ 25, 25 ]
                            }
                         }
        },
        {
            name: 'decks.testdeck',
            type: 'MOAIGfxQuadDeck2D'
        },
        {
            name: 'textures.testtexture',
            type: 'MOAITexture'
        }

    ],


 }
*/