import * as React from "react";
import {
    IPreviewProps,
    IPreviewState,
    SceneEngine,
    EditorList,
    SceneEngines
} from "../../sceneEngines";
import { SceneObject, SceneTree } from "../../sceneObject";
import {
    PropertySetCommand,
    ConstructCommand,
    DeleteCommand
} from "../../sceneCommands";
import { SceneComponent } from "../../sceneComponent";
import { observer } from "mobx-react";
import { MoaiHost,  messageProcessor, messageSender } from "../../moaihost";
import { sendMessage } from "phosphor-messaging";
import { Deferred } from "../../deferred";

class MoaiEngine implements SceneEngine {
    name: string = "moai";
    
    pendingEngineMessages: Array<any> = [];

    sendEngineMessage: messageSender;


    components: Deferred<Array<SceneComponent>> = new Deferred<Array<SceneComponent>>();

    previewComponent: React.ComponentClass<
    IPreviewProps
    > = observer((props: IPreviewProps) =>
        <MoaiHost
            sourcePath={"lua"}
            layoutWidth={props.layoutWidth}
            layoutHeight={props.layoutHeight}
            onAttach={this.onAttach.bind(this)}
            onMessage={this.onEngineMessage.bind(this)}

        />
    );

    constructor() {
        this.sendEngineMessage = (msg: any) => {
            console.log("pushing message",msg);
            this.pendingEngineMessages.push(msg);
        }
    }

    init(): Promise<void> {
        this.refreshComponents();
        return Promise.resolve();
    }
   
    onEngineMessage(msg: any) {
       console.log("got message", msg);
       if (msg.type == "ComponentInfo") {
            this.components.resolve(msg.components);
       }
    }

    private refreshComponents() {
        this.sendEngineMessage({ type: "GetComponents" });
    } 
    
    onAttach(sendEngineMessage: messageSender) {
        this.sendEngineMessage = sendEngineMessage;
        sendEngineMessage({msg:"Attached to engine111"});
        this.pendingEngineMessages.forEach(msg =>  sendEngineMessage(msg));
        this.components.resolve(this.dummyComponents());
    }

    async executePropertySetCommand(
        command: PropertySetCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        
        if (
            command.propertyName == "parent" &&
            command.newValue.kind == "ref"
        ) {
            this.sendEngineMessage({
                type: "setParent",
                target: command.object.getFullName(),
                value: command.newValue.value.getFullName()
            })
            command.object.parent = command.newValue.value;
            return Promise.resolve();
        }

        if (
            command.propertyName == "name" &&
            command.newValue.kind == "scalar"
        ) {
            this.sendEngineMessage({
                type: "setName",
                target: command.object.getFullName(),
                value: command.newValue.value
            })
            command.object.name = command.newValue.value;
            return Promise.resolve();
        }

        if (command.newValue.kind == "scalar") {
            this.sendEngineMessage({
                type: "setScalarProperty",
                target: command.object.getFullName(),
                propertyName: command.propertyName,
                value: command.newValue.value
            })
        }
        if (command.newValue.kind == "ref") {
            this.sendEngineMessage({
                type: "setRefProperty",
                target: command.object.getFullName(),
                propertyName: command.propertyName,
                value: (command.newValue.value && command.newValue.value.getFullName()) || null
            })
        }

        return Promise.resolve();
    }

    async executeConstructCommand(
        command: ConstructCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        this.sendEngineMessage({
            type: "createObject",
            name: command.object.name,
            objectClass: command.object.type,
            parent: command.object.parent && command.object.parent.getFullName(),
            args: command.args.map(a=>a.serialize())
        });
        sceneTree.append(command.object);
    }

    async executeDeleteCommand(
        command: DeleteCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        this.sendEngineMessage({
            type: "deleteObject",
            name: command.object.getFullName()
        });
        sceneTree.remove(command.object);
    }

    private dummyComponents(): Array<SceneComponent> {
        var components:Array<SceneComponent> = [];
        
                components.push({
                    name: 'MOAIPartitionViewLayer',
                    properties: []
                });
        
                components.push({
                    name: 'MOAIGraphicsProp',
                    properties: [
                        {
                            name: "Deck",
                            type: "ref"
                        },
                        {
                            name: "Partition",
                            type: "ref"
                        }
                    ]
                });
        
                components.push({
                    name: 'MOAISpriteDeck2D',
                    properties: [
                        {
                            name: "Texture",
                            type: "scalar"
                        },
                        {
                            name: "Rect",
                            type: "scalar"
                        }
                    ]
                });
                return components;
    }

    getComponents(): Promise<Array<SceneComponent>> {
       /* var components:Array<SceneComponent> = [];

        components.push({
            name: 'MOAIPartitionViewLayer',
            properties: []
        });

        components.push({
            name: 'MOAIGraphicsProp',
            properties: [
                {
                    name: "Deck",
                    type: "ref"
                },
                {
                    name: "Partition",
                    type: "ref"
                }
            ]
        });

        components.push({
            name: 'MOAISpriteDeck2D',
            properties: [
                {
                    name: "Texture",
                    type: "scalar"
                },
                {
                    name: "Rect",
                    type: "scalar"
                }
            ]
        });*/
        console.log("returning promise", this.components.promise)
         return this.components.promise;
    }

    getEditors(): EditorList {
        return {};
    }
}

SceneEngines.registerEngine("moai", async () => {
    var moai = new MoaiEngine();
    return moai.init().then(()=>moai);
});
