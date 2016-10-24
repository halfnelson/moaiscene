import { observable } from 'mobx';
import { SerializedSceneCommand, SceneCommand, SerializeableSceneCommand } from './sceneCommands'
import { SceneTree, SceneObject, PropertyValueScalar, SceneObjectReference } from './sceneObject'
import { PropertySetCommand, ConstructCommand, DeleteCommand } from './sceneCommands'
import { SceneEngine } from './SceneEngines'

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
    public engine: SceneEngine;
    private initializeScripts: Array<string> = [];
    @observable sceneTree: SceneTree = new SceneTree();
    @observable changeLog: Array<SceneCommand> = [];

    protected constructor() {
    }

    public static  InitWithEngine(engine: SceneEngine): Scene {
        var s = new Scene();
        s.engine = engine;
        return s;
    }

    private flattenedChangeLog(log: Array<SceneCommand>): Array<SceneCommand> {
        
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
            engine: this.engine.name,
            initializeScripts: this.initializeScripts,
            sceneCommands: scl
        }
    }

    loadInitializeScripts(scripts: Array<string>) {
        this.initializeScripts.concat(scripts);
    }
    
    objectByName(name: string): SceneObject {
        return this.sceneTree.objectByName(name);
    }

    private deserializeCommand(c: SerializedSceneCommand):SceneCommand {
        var resolve = n => { 
            var res = this.objectByName(n)
            if (!res) console.log(this.sceneTree)
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

    public async load(data: SerializedScene): Promise<void> {
        this.loadInitializeScripts(data.initializeScripts);
        var results = data.sceneCommands.map(async c=> await this.executeCommand(this.deserializeCommand(c)));
        await Promise.all(results);
    }

    protected async executePropertySetCommand(command: PropertySetCommand):Promise<void> {
        await this.engine.executePropertySetCommand(command, this.sceneTree);
    }

    protected async executeConstructCommand(command: ConstructCommand):Promise<void> {
        await this.engine.executeConstructCommand(command, this.sceneTree);
    }   

    protected async executeDeleteCommand(command: DeleteCommand):Promise<void> {
        await this.engine.executeDeleteCommand(command, this.sceneTree);
    }

    async executeCommand(command: SceneCommand):Promise<void> { 
        this.changeLog.push(command);
        switch (command.kind) {
            case 'propertySet': await this.executePropertySetCommand(command); break;
            case 'construct': await this.executeConstructCommand(command); break;
            case 'delete': await this.executeDeleteCommand(command); break;
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
