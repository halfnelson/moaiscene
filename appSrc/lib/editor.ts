import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { SceneCommand } from './sceneCommands'
import { SceneObject } from './sceneObject'
import { Scene } from './scene'
    

class BulkActionCommand {
    kind: "bulk";
    commands: Array<SceneCommand> = [];
}


export class Editor {
    scene: Scene;
    selected: Array<SceneObject>;

    private undostack: Array<SceneCommand|BulkActionCommand> = [];
    private redostack: Array<SceneCommand|BulkActionCommand> = [];
    
    private bulkAction: BulkActionCommand;

    private beginBulkAction() {
        this.bulkAction = new BulkActionCommand();
    }

    private endBulkAction() {
        this.undostack.push(this.bulkAction);
        this.bulkAction = undefined;
    }

    private addUndo(command:SceneCommand) {
        if (this.bulkAction) {
            this.bulkAction.commands.push(command);
        } else {
            this.undostack.push(command);
        }
    }

    private applyToScene(command:SceneCommand) {
        this.addUndo(command);
        this.scene.executeCommand(command);
    }

    undo() {
       var lastcommand = this.undostack.pop();
       if (!lastcommand) return;

       this.redostack.push(lastcommand);
       if (lastcommand.kind == "bulk") {
           lastcommand.commands.forEach(c=>this.applyToScene(c.inverse()));
       } else {
           this.applyToScene(lastcommand.inverse());
       }
    }

    redo() {
        var nextcommand = this.redostack.pop();
        if (!nextcommand) return;
        this.undostack.push(nextcommand);
        if (nextcommand.kind == "bulk") {
           nextcommand.commands.forEach(c=>this.applyToScene(c));
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

    setPropertyOnSelected(propertyName: string, value: any) {}
    createObject(parent: SceneObject, name: string, type: string, args: Array<any>) {}
    deleteObject(obj: SceneObject) {}
    addInitializeScripts(scripts: Array<string>) {}
    
    addToSelection(obj: SceneObject) {}
    removeFromSelection(obj: SceneObject) {}
    clearSelection() {}
    
    loadScene(path: string) {}
    saveScene(path: string) {}
}