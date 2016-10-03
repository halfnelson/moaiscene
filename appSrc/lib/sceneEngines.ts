import { Scene } from './scene';
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from './sceneCommands'
import { SceneTree } from './sceneObject'

export interface SceneEngine {
    name: string;
    newScene(): Promise<void>;
    executePropertySetCommand(command: PropertySetCommand, sceneTree: SceneTree): Promise<void>;
    executeConstructCommand(command: ConstructCommand, sceneTree: SceneTree): Promise<void>;
    executeDeleteCommand(command: DeleteCommand, sceneTree: SceneTree): Promise<void>;
}

class EngineManager { 

    private engines: {[index: string]: SceneEngine } = {}
    registerEngine(engine: SceneEngine) {
        this.engines[engine.name] = engine;
    }

    engineByName(name: string) {
        return this.engines[name];
    }
}
export var SceneEngines: EngineManager = new EngineManager();
