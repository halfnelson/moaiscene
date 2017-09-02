import * as React from "react";
import * as ReactDOM from "react-dom";
import { SceneEditor } from "../sceneEditor";
import { SceneEngine, EditorProps } from "../sceneEngines";
import { SceneObject } from "../sceneObject";
import { observer } from "mobx-react";
import { SceneComponent, SceneComponentProperty } from "../sceneComponent";

interface IObjectPropertiesProps {
    sceneEditor: SceneEditor;
}

interface IObjectPropertiesState { }

@observer
export class DefaultScalarPropertyEditor extends React.Component<
EditorProps,
{}
> {
    constructor(props: EditorProps) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        const value = event.target.value;
        this.props.sceneEditor.setScalarOnSelected(
            this.props.propertyName,
            value
        );
        console.log("value set");
    }

    render() {
        var propval = this.props.propertyValue;
        return (
            <div>
                <label>
                    {this.props.propertyName}
                </label>
                <input
                    type="text"
                    value={propval ? propval.value : ""}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

@observer
export class SceneObjectProperties extends React.Component<
IObjectPropertiesProps,
IObjectPropertiesState
> {
    constructor(props: IObjectPropertiesProps) {
        super(props);
        this.state = {};
    }

    componentWillUnmount() { }

    componentWillReceiveProps(nextProps: IObjectPropertiesProps) { }

    componentDidMount() { }

    renderPropertyEditor(obj: SceneObject, prop: SceneComponentProperty) {
        var editorProps: EditorProps = {
            // obj: obj,
            propertyName: prop.name,
            sceneEditor: this.props.sceneEditor,
            options: prop.editorOptions,
            propertyValue: obj.properties.get(prop.name)
        };

        var editor;

        //TODO some sort of editor lookup
        //fallback to key-value
        if (prop.type == "scalar") {
            editor = <DefaultScalarPropertyEditor {...editorProps} />;
        }
        return (
            <div className="propertyEditor" key={prop.name}>
                {editor}
            </div>
        );
    }

    renderEditors() {
        //TODO allow multiple sceneObjects
        var components = this.props.sceneEditor.getComponents();
        if (this.props.sceneEditor.selected.length > 0) {
            var thisObject = this.props.sceneEditor.selected[0];
        }
        if (thisObject) {
            var typeinfo = components.find(x => x.name == thisObject.type);
            //generate an editor for each typeinfo
            return typeinfo.properties.map(ti =>
                this.renderPropertyEditor(thisObject, ti)
            );
        } else {
            <div>Nothing Selected</div>;
        }
    }

    render() {
        return (
            <div>
                {this.renderEditors()}
            </div>
        );
    }
}
