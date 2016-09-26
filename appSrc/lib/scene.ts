
import { SerializedSceneCommand, SceneCommand, SerializeableSceneCommand } from './sceneCommands'
import { SceneObject, PropertyValueScalar, SceneObjectReference } from './sceneObject'
import { PropertySetCommand, ConstructCommand, DeleteCommand } from './sceneCommands'

/*
*  Serialized Scene
*/


export interface SerializedScene {
    engine: string;
    initializeScripts: Array<string>;
    sceneCommands: Array<SerializedSceneCommand>;
}


/*
*   Scene
*/

type SceneCommandListener = (command: SceneCommand) => void;

export class Scene {
    public engineName: string = "base";
    private initializeScripts: Array<string> = [];
    objects: Array<SceneObject> = [];
    changeLog: Array<SceneCommand> = [];

    private flattenedChangeLog(log: Array<SceneCommand>): Array<SceneCommand> {
        //TODO: actually flatten this thing :)
        var out: Array<SceneCommand> = []
        var deleted: Array<SceneObject> = []
        var set: Array<string> = []
        
        for (var i = log.length - 1; i >= 0; i--) {
            var c = log[i];



            //already deleted?
            if (deleted.indexOf(c.object) > -1) {
                //then ignore property sets
                if (c.kind == "propertySet") continue;
                //if we constructed the object, make sure our delete is not in the output
                if (c.kind == "construct") {
                    //remove our delete from the output
                    out = out.filter(o=> !(o.kind == 'delete' && o.object == c.object))
                    continue; 
                }
            }
            
            //handle set commands
            if (c.kind == "propertySet") {
                var n = c.object.getFullName()+"."+c.propertyName;
                //set already?
                if (set.indexOf(n) > -1) continue;
                //track it for later
                set.push(n);
            }

            //handle delete
            if (c.kind == "delete") {
                //track for later
                deleted.push(c.object);
            }
            //add to our flattened list
            out.unshift(c);
        } 
        
        
        return out;
    }
    
    save(): SerializedScene { 
        var cl = this.flattenedChangeLog(this.changeLog);
        var scl = cl.map(cmd=>cmd.serialize());
        return {
            engine: this.engineName,
            initializeScripts: this.initializeScripts,
            sceneCommands: scl
        }
    }

    loadInitializeScripts(scripts: Array<string>) {
        this.initializeScripts.concat(scripts);
    }
    
    objectByName(name: string): SceneObject {
        return this.objects.find(v=>v.getFullName() == name);
    }

    private deserializeCommand(c: SerializedSceneCommand):SceneCommand {
        var resolve = n => { 
            var res = this.objectByName(n)
            if (!res) console.log(this.objects)
            if (!res) throw new Error(`Could not find ${n} during deserialize`);

            return res;
        }
 
        switch (c.kind) {
            case 'propertySet':
                return PropertySetCommand.deserialize(c, resolve);
            case 'construct':
                return ConstructCommand.deserialize(c, resolve);
            case 'delete':
                return DeleteCommand.deserialize(c, resolve);
        }
    }

    load(data: SerializedScene) {
        this.loadInitializeScripts(data.initializeScripts);
        data.sceneCommands.forEach(c => this.executeCommand(this.deserializeCommand(c)));
    }

    protected executePropertySetCommand(command: PropertySetCommand) {
        command.object.properties[command.propertyName] = command.newValue;
    }

    protected executeConstructCommand(command: ConstructCommand) {
        this.objects.push(command.object);
    }   

    protected executeDeleteCommand(command: DeleteCommand) {
        this.objects = this.objects.filter(o => o != command.object)
    }

    executeCommand(command: SceneCommand) { 
        this.changeLog.push(command);
        switch (command.kind) {
            case 'propertySet': this.executePropertySetCommand(command); break;
            case 'construct': this.executeConstructCommand(command); break;
            case 'delete': this.executeDeleteCommand(command); break;
        } 
    }

    clearChangeLog() {
        this.changeLog = [];
    }

    dump(): string {
        return JSON.stringify(this.save(),null,2)
    }

    exportAsCode(): string { 
        throw new Error("not implemented");
    }

    commandsForObject(obj: SceneObject) {
        var cl = this.changeLog.filter(c=>c.object == obj);
        return this.flattenedChangeLog(cl);
    }
}
