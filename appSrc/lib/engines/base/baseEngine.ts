import { Scene } from '../../scene';
import { SceneEngine, SceneEngines } from '../../sceneEngines'
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from '../../sceneCommands'
import { SceneTree } from '../../sceneObject'

class BaseEngine implements SceneEngine {
    name: string = "base";
    async executePropertySetCommand(command: PropertySetCommand, sceneTree: SceneTree): Promise<void> {
        command.object.properties[command.propertyName] = command.newValue;
    }
    async executeConstructCommand(command: ConstructCommand, sceneTree: SceneTree): Promise<void> {
        sceneTree.append(command.object);
    }
    async executeDeleteCommand(command: DeleteCommand, sceneTree: SceneTree): Promise<void> {
        sceneTree.remove(command.object);
    }
    async newScene(): Promise<void> {
        return Promise.resolve();
    }
} 

SceneEngines.registerEngine(new BaseEngine());