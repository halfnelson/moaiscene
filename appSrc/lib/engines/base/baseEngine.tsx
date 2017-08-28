import { Scene } from "../../scene";
import {
    SceneEngine,
    SceneEngines,
    EditorList,
    IPreviewProps,
    IPreviewState
} from "../../sceneEngines";
import {
    SceneCommand,
    ConstructCommand,
    DeleteCommand,
    PropertySetCommand
} from "../../sceneCommands";
import { SceneObject, SceneTree } from "../../sceneObject";
import { SceneComponent } from "../../sceneComponent";
import { SceneEditor } from "../../SceneEditor";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { extendObservable, autorun, observable } from "mobx";

class BaseEngine implements SceneEngine {
    name: string = "base";
    sg: any = {};

    previewComponent: React.ComponentClass<
        IPreviewProps
    > = observer((props: IPreviewProps) => {
        var dummy = props.sceneEditor.scene.changeLog.length;
        return (
            <div>
                <h1>Base Engine Preview</h1>
                <pre>
                    {JSON.stringify(this.sg, null, 2)}
                </pre>
            </div>
        );
    });

    constructor() {}

    private getObject(o: SceneObject): any {
        if (o.parent) {
            return this.getObject(o.parent)[o.name];
        } else {
            return this.sg[o.name];
        }
    }

    async executePropertySetCommand(
        command: PropertySetCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        var obj = this.getObject(command.object);

        //special change parent
        if (
            command.propertyName == "parent" &&
            command.newValue.kind == "ref"
        ) {
            var newParent = command.newValue.value
                ? this.getObject(command.newValue.value)
                : null;
            var oldParent = command.object.parent
                ? this.getObject(command.object.parent)
                : null;

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
        if (
            command.propertyName == "name" &&
            command.newValue.kind == "scalar"
        ) {
            var parent = command.object.parent
                ? this.getObject(command.object.parent)
                : this.sg;
            parent[command.newValue.value] = obj;
            if (command.newValue.value != command.object.name) {
                delete parent[command.object.name];
            }
            command.object.name = command.newValue.value;
            return Promise.resolve();
        }

        //set prop
        command.object.properties.set(command.propertyName, command.newValue);

        if (command.newValue.kind == "scalar") {
            obj[command.propertyName] = command.newValue.value;
        } else {
            obj[command.propertyName] = this.getObject(command.newValue.value);
        }
    }

    async executeConstructCommand(
        command: ConstructCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        sceneTree.append(command.object);
        //load properties
        var sg = this.sg;
        var parent = command.object.parent
            ? this.getObject(command.object.parent)
            : sg;
        parent[command.object.name] = { type: command.object.type };
    }

    async executeDeleteCommand(
        command: DeleteCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        sceneTree.remove(command.object);
        var parent = command.object.parent
            ? this.getObject(command.object.parent)
            : this.sg;
        delete parent[command.object.name];
    }

    getComponents(): Array<SceneComponent> {
        return [
            {
                name: "Circle",
                properties: [
                    { name: "radius", type: "scalar" },
                    { name: "location", type: "scalar" }
                ]
            },
            {
                name: "Square",
                properties: [
                    { name: "sideLength", type: "scalar" },
                    { name: "location", type: "scalar" }
                ]
            }
        ];
    }

    getEditors(): EditorList {
        return {};
    }
}

SceneEngines.registerEngine("base", async () => new BaseEngine());
