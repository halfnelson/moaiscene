import * as React from "react";
import {
    IPreviewProps,
    IPreviewState,
    SceneEngine,
    EditorList,
    SceneEngines
} from "../../sceneEngines";
import { SceneObject, SceneTree, SceneObjectPropertyValue, SceneObjectReference, PropertyValueScalar, SceneRootName } from "../../sceneObject";
import {
    PropertySetCommand,
    ConstructCommand,
    DeleteCommand
} from "../../sceneCommands";
import { SceneComponent, SceneComponentProperty } from "../../sceneComponent";
import { observer } from "mobx-react";
import { MoaiHost,  messageProcessor, messageSender } from "../../moaihost";
import { sendMessage } from "phosphor-messaging";
import { Deferred } from "../../deferred";
import { components, ComponentList } from  "./moaiComponentSchema";


class MoaiEngineExpression {
    expr: string;
    constructor(expr:string) {
        this.expr = expr;
    }
    __tolua():string {
        return this.expr;
    }
}

class MoaiEngine implements SceneEngine {
    name: string = "moai";
    
    pendingEngineMessages: Array<any> = [];

    sendEngineMessage: messageSender;

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
            this.pendingEngineMessages.push(msg);
        }
    }

    init(): Promise<void> {
        return Promise.resolve();
    }
   
    onEngineMessage(msg: any) {
       console.log("got engine message", msg);
      
    }
    
    onAttach(sendEngineMessage: messageSender) {
        this.sendEngineMessage = sendEngineMessage;
        sendEngineMessage({msg:"Attached to engine"});
        this.pendingEngineMessages.forEach(msg =>  sendEngineMessage(msg));
    }

    async executePropertySetCommand(
        command: PropertySetCommand,
        sceneTree: SceneTree
    ): Promise<void> {
        var propName = command.propertyName;
        var className = command.object.type;
        var component = components[className];

        if (!component) {
            throw ("couldn't find class "+className+" in schema");
        }

        var prop = component.props[propName];
        if (!prop) {
            throw ("couldn't find property "+propName+" in schema for "+ className);
        }

        var script = prop.set(command.object.getFullName(), propName, command.newValue);

        return this.runLuaScript(script);

        /*

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
         */
    }

    async executeConstructCommand(
        command: ConstructCommand,
        sceneTree: SceneTree
    ): Promise<void> {
     
        var className = command.object.type;
        var component = components[className];

        if (!component) {
            throw ("couldn't find class "+className+" in schema");
        }

        var script = component.construct(command.object.parent ? command.object.parent.getFullName() : SceneRootName, command.object.name, command.object.type, command.args);
        sceneTree.append(command.object);
        script = script + `\n Editor:onObjectCreated(${command.object.getFullName()})`;
        return this.runLuaScript(script );

       

       /* this.sendEngineMessage({
            type: "createObject",
            name: command.object.name,
            objectClass: command.object.type,
            parent: command.object.parent && command.object.parent.getFullName(),
            args: command.args.map(a=>a.serialize())
        });*/
        
    }

    async executeDeleteCommand(
        command: DeleteCommand,
        sceneTree: SceneTree
    ): Promise<void> {
  /*      this.sendEngineMessage({
            type: "deleteObject",
            name: command.object.getFullName()
        });*/
        throw ("Delete not implemented");
       // sceneTree.remove(command.object);
    }

    runLuaScript(lua: string): Promise<void> {
        return this.sendEngineMessage({
            type: "runLuaString",
            script: lua
        });
    }


    getComponents(): Promise<Array<SceneComponent>> {
        var sc:Array<SceneComponent> = [];
        var schema: ComponentList = components;
        for (const name in schema) {
            var props: Array<SceneComponentProperty> = [];
            var currentComponent = schema[name];

            for(const p in currentComponent.props) {
                var currentProp = currentComponent.props[p];
                props.push({
                    editor: currentProp.editor,
                    name: p
                });
            }

            sc.push({
                name: name,
                properties: props
            })
        }
        return Promise.resolve(sc);
    }

    getEditors(): EditorList {
        return {};
    }

 /*
    constructUsingLua(newObject: SceneObject, args: Array<SceneObjectPropertyValue>): Promise<void> {
        //var construct = this.constructAsLua(newObject.getFullName(), newObject.type, args);
        return executeLuaInEngine(construct);
    }
    
    //Property Types
    setUsingLua(sceneObject: SceneObject, propertyName: string, value: SceneObjectPropertyValue): Promise<void> {
        return executeLuaInEngine(this.setterAsLua(sceneObject.getFullName(), propertyName, value))
    }*/
}

SceneEngines.registerEngine("moai", async () => {
    var moai = new MoaiEngine();
    return moai.init().then(()=>moai);
});
