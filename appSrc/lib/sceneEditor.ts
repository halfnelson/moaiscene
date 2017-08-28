import { observable } from "mobx";
import { observer } from "mobx-react";
import {
    SceneCommand,
    DeleteCommand,
    ConstructCommand,
    PropertySetCommand
} from "./sceneCommands";
import {
    SceneObject,
    SceneObjectPropertyValue,
    PropertyValueScalar,
    SceneObjectReference
} from "./sceneObject";
import { Scene, SerializedScene } from "./scene";
import { SceneEngines, SceneEngine } from "./sceneEngines";
import fs = require("fs");

class BulkActionCommand {
    kind: "bulk";
    commands: Array<SceneCommand> = [];
}

export class SceneEditor {
    scenepath: string;
    @observable engine: SceneEngine;
    @observable scene: Scene;
    @observable selected: Array<SceneObject> = [];

    private undostack: Array<SceneCommand | BulkActionCommand> = [];
    private redostack: Array<SceneCommand | BulkActionCommand> = [];

    private bulkAction: BulkActionCommand;

    public async loadNewScene(type: string): Promise<void> {
        this.scene = await this.newSceneFromType(type);
    }

    public async LoadScene(path: string): Promise<void> {
        this.scene = await this.loadSceneFromFile(path);
    }

    private async newSceneFromType(type: string): Promise<Scene> {
        var engine = await SceneEngines.engineByName(type);
        if (engine) {
            this.engine = engine;
            return Scene.InitWithEngine(engine);
        } else {
            throw new Error(`No scene engine called ${type}`);
        }
    }

    public async loadSceneFromFile(path: string): Promise<Scene> {
        this.scenepath = path;
        var result = fs.readFileSync(path);
        var serializedScene: SerializedScene = JSON.parse(result.toString());
        var scene = await this.newSceneFromType(serializedScene.engine);
        await scene.load(serializedScene);
        return Promise.resolve(scene);
    }

    private beginBulkAction() {
        this.bulkAction = new BulkActionCommand();
    }

    private endBulkAction() {
        this.undostack.push(this.bulkAction);
        this.bulkAction = undefined;
    }

    private addUndo(command: SceneCommand) {
        if (this.bulkAction) {
            this.bulkAction.commands.push(command);
        } else {
            this.undostack.push(command);
        }
    }

    private applyToScene(command: SceneCommand) {
        this.scene.executeCommand(command);
    }

    do(command: SceneCommand) {
        this.addUndo(command);
        this.applyToScene(command);
    }

    reverseCommand(command: SceneCommand): Array<SceneCommand> {
        return command.inverse();
    }

    undo() {
        var lastcommand = this.undostack.pop();
        if (!lastcommand) return;

        this.redostack.push(lastcommand);

        if (lastcommand.kind == "bulk") {
            lastcommand.commands.forEach(c =>
                this.reverseCommand(c).forEach(rc => this.applyToScene(rc))
            );
        } else {
            this.reverseCommand(lastcommand).forEach(rc =>
                this.applyToScene(rc)
            );
        }
    }

    redo() {
        var nextcommand = this.redostack.pop();
        if (!nextcommand) return;
        this.undostack.push(nextcommand);
        if (nextcommand.kind == "bulk") {
            nextcommand.commands.forEach(c => this.applyToScene(c));
        } else {
            this.applyToScene(nextcommand);
        }
    }

    private clearRedoStack() {
        this.redostack = [];
    }

    private clearUndoStack() {
        this.undostack = [];
    }

    setScalarOnSelected(propertyName: string, value: any) {
        this.setPropertyOnSelected(
            propertyName,
            new PropertyValueScalar(value)
        );
    }

    setReferenceOnSelected(propertyName: string, value: SceneObject) {
        this.setPropertyOnSelected(
            propertyName,
            new SceneObjectReference(value)
        );
    }

    setPropertyOnSelected(
        propertyName: string,
        value: SceneObjectPropertyValue
    ) {
        this.selected.forEach(obj => {
            var cmd = new PropertySetCommand();
            cmd.newValue = value;
            cmd.oldValue = obj.properties.get(propertyName);
            cmd.object = obj;
            cmd.propertyName = propertyName;
            this.do(cmd);
        });
    }

    createObject(
        parent: SceneObject,
        name: string,
        type: string,
        args: Array<any>
    ) {
        var obj = new SceneObject();
        obj.name = name;
        obj.parent = parent;
        obj.type = type;

        var cmd = new ConstructCommand();
        cmd.object = obj;
        cmd.args = args;

        this.do(cmd);
    }

    deleteObject(obj: SceneObject) {}

    addInitializeScripts(scripts: Array<string>) {}

    addToSelection(obj: SceneObject) {
        this.selected.push(obj);
    }

    removeFromSelection(obj: SceneObject) {
        this.selected = this.selected.filter(o => o != obj);
    }

    clearSelection() {
        this.selected = [];
    }

    objectByName(name: string): SceneObject {
        return this.scene.objectByName(name);
    }

    saveAs(path: string) {}
    save() {}

    closeScene() {}
}
