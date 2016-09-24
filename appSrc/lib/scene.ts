
import { SerializedSceneCommand, SceneCommand } from './sceneCommands'
import { SceneObject, PropertyValueScalar, SceneObjectReference } from './sceneObject'
import { SceneEngine } from './sceneEngine'
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
    public engineName: string;
    private initializeScripts: Array<string> = [];
    objects: Array<SceneObject>;
    changeLog: Array<SceneCommand>;

    private flattenedChangeLog() {
        //TODO: actually flatten this thing :)
        return this.changeLog;
    }
    
    save(): SerializedScene { 
        var cl = this.flattenedChangeLog();
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
        var resolve = n => this.objectByName(n)
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
        data.sceneCommands.map(c => this.deserializeCommand(c)).forEach(c=>this.executeCommand(c));
    }

    executeCommand(command: SceneCommand) { throw Error("Not Implemented") }

    exportAsCode(): string { throw Error("Not Implemented") }
}
