import { Scene } from '../../scene';
import { SceneEngine, SceneEngines } from '../../sceneEngines'
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from '../../sceneCommands'
import { SceneObject, SceneTree } from '../../sceneObject'

class BaseEngine implements SceneEngine {
    name: string = "base";
    sg: any;

    private getObject(o: SceneObject): any {
        if (o.parent) {
            return this.getObject(o.parent)[o.name];
        } else {
            return this.sg[o.name];
        }
    }

    async executePropertySetCommand(command: PropertySetCommand, sceneTree: SceneTree): Promise<void> {
      
        var obj = this.getObject(command.object);

        //special change parent
        if (command.propertyName == "parent" && command.newValue.kind == "ref") {
            var newParent = command.newValue.value ? this.getObject(command.newValue.value): null;
            var oldParent = command.object.parent ? this.getObject(command.object.parent) : null;
            
            if (newParent) {
                newParent[command.object.name] = obj;
                command.object.parent = command.newValue.value;
            } else {
                this.sg[command.object.name] = obj; 
                command.object.parent = null;
            }
            if (oldParent) {
                delete oldParent[command.object.name];
            } else {
                delete this.sg[command.object.name];
            }

            return Promise.resolve();
        }

        //change name
        if (command.propertyName == "name" && command.newValue.kind == "scalar") {
            var parent = command.object.parent ? this.getObject(command.object.parent) : this.sg;
            parent[command.newValue.value] = obj;
            if (command.newValue.value != command.object.name) {
                delete parent[command.object.name];
            }
            command.object.name = command.newValue.value;
            return Promise.resolve();
        }
        
        //set prop
        command.object.properties[command.propertyName] = command.newValue;

        if (command.newValue.kind == "scalar") {
           obj[command.propertyName] = command.newValue.value;
        } else {
           obj[command.propertyName] = this.getObject(command.newValue.value)
        }
    }


    async executeConstructCommand(command: ConstructCommand, sceneTree: SceneTree): Promise<void> {
        sceneTree.append(command.object);
        var parent = command.object.parent ? this.getObject(command.object.parent) : this.sg;
        parent[command.object.name] = { type: command.object.type }
    }

    async executeDeleteCommand(command: DeleteCommand, sceneTree: SceneTree): Promise<void> {
        sceneTree.remove(command.object);
        var parent = command.object.parent ? this.getObject(command.object.parent) : this.sg;
        delete parent[command.object.name]; 
    }
    
    async newScene(): Promise<void> {
        this.sg = {};
        return Promise.resolve();
    }
} 

SceneEngines.registerEngine(new BaseEngine());