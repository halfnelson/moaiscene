import {  SerializedSceneObjectPropertyValue, SceneObject, SceneObjectPropertyValue, SceneObjectReference, PropertyValueScalar } from './sceneObject'


interface SerializedPropertySetCommand {
    kind: "propertySet";
    propertyName: string;
    object: string;
    newValue: SerializedSceneObjectPropertyValue;
}

interface SerializedConstructCommand  {
    kind: "construct";
    type: string;
    parent?: string;
    name: string;
    args: Array<SerializedSceneObjectPropertyValue>;
    
}

interface SerializedDeleteCommand {
    kind:  "delete";
    object: string;
}

export type SerializedSceneCommand = SerializedPropertySetCommand | SerializedDeleteCommand | SerializedConstructCommand 

function deserializeValue(val: SerializedSceneObjectPropertyValue, resolver: ObjectResolver ): SceneObjectPropertyValue {
        if (val.kind == 'scalar') {
            return  new PropertyValueScalar(val.value)
        } else {
            return  new SceneObjectReference(resolver(val.value))
        }
}

type ObjectResolver = (name: string) => SceneObject;

export type SceneCommand = PropertySetCommand | DeleteCommand | ConstructCommand 

export interface SerializeableSceneCommand {
    serialize(): SerializedSceneCommand
}

export interface InversableSceneCommand {
    inverse(): Array<SceneCommand>
}


export class PropertySetCommand implements SerializeableSceneCommand, InversableSceneCommand{
    kind: "propertySet" = "propertySet"; 
    propertyName: string;
    object: SceneObject;
    oldValue: SceneObjectPropertyValue;
    newValue: SceneObjectPropertyValue;
    public serialize(): SerializedPropertySetCommand {
        return {
            kind: this.kind,
            propertyName: this.propertyName,
            object: this.object.getFullName(),
            newValue: this.newValue && this.newValue.serialize(),
        }
    }

    public inverse(): Array<SceneCommand> {
        var c = new PropertySetCommand();
        c.propertyName = this.propertyName;
        c.object = this.object;
        c.oldValue = this.newValue;
        c.newValue = this.oldValue;
        return [c]; 
    }

    static deserialize(c: SerializedPropertySetCommand,  resolve: ObjectResolver ): PropertySetCommand {
            var newc = new PropertySetCommand();
            newc.object = resolve(c.object)
            newc.propertyName = c.propertyName;
            newc.newValue = deserializeValue(c.newValue, resolve);
            return newc;       
    }    
}


export class ConstructCommand implements SerializeableSceneCommand, InversableSceneCommand  {
    kind: "construct" = "construct";
    object: SceneObject;
    args: Array<SceneObjectPropertyValue> = [];
    public serialize(): SerializedConstructCommand {
        return {
            kind: this.kind,
            type: this.object.type,
            parent: (this.object.parent && this.object.parent.value.getFullName()) ,
            name: this.object.name,
            args: this.args.map(a=>a.serialize())
        }
    }

    public inverse(): Array<SceneCommand> {
        var c = new DeleteCommand();
        c.object = this.object;
        return [c];
    }

   static deserialize(c: SerializedConstructCommand,  resolve: ObjectResolver ): ConstructCommand {
            var newcons = new ConstructCommand();
            newcons.object = new SceneObject();
            if (c.parent) {
                newcons.object.parent = new SceneObjectReference(resolve(c.parent));
            }
            newcons.object.name = c.name;
            newcons.args = c.args.map(a=> deserializeValue(a, resolve))
            newcons.object.type = c.type;
            return newcons;       
    }    
}

export class DeleteCommand implements SerializeableSceneCommand {
    kind:  "delete" = "delete";
    object: SceneObject;
    undoCommands: Array<SceneCommand> = []; //(not serialized) commands needed to undelete
    public serialize(): SerializedDeleteCommand {
        return {
            kind: this.kind,
            object: this.object.getFullName()
        }
    }

    static deserialize(c: SerializedDeleteCommand,  resolve: ObjectResolver ): DeleteCommand {
            var newc = new DeleteCommand();
            newc.object = resolve(c.object)
            return newc;       
    }
    
    public inverse(): Array<SceneCommand> {
        return this.undoCommands;
    }


}

