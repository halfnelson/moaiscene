import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneEngine,EditorProps  } from '../sceneEngines'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';
import { SceneComponent, SceneComponentProperty } from '../sceneComponent';

interface IObjectPropertiesProps {
    sceneEditor: SceneEditor,
}

interface IObjectPropertiesState {
    
}

var defaultScalarPropertyEditor: React.StatelessComponent<EditorProps> = function(props: EditorProps) {
     var propval = props.obj.properties[props.propertyName];
      
     return <div className="propertyEditor">
            <label>{props.propertyName}</label>
            <input type="text" value={propval ? propval.value : ""}></input>
        </div>
}

@observer export class SceneObjectProperties extends React.Component<IObjectPropertiesProps, IObjectPropertiesState> {

    constructor(props: IObjectPropertiesProps) {
        super(props);
        this.state = {}
    }

    componentWillUnmount() { }

    componentWillReceiveProps(nextProps: IObjectPropertiesProps) { }

    componentDidMount() { }

    renderPropertyEditor(obj:SceneObject, prop: SceneComponentProperty ) {
        var editorProps:EditorProps = {
            obj: obj,
            propertyName: prop.name,
            sceneEditor: this.props.sceneEditor,
            options: prop.editorOptions
        }
        
        //TODO some sort of editor lookup
        //fallback to key-value
       if (prop.type == "scalar") {
           return defaultScalarPropertyEditor(editorProps)
       }
    }
    
    renderEditors() {
        //TODO allow multiple sceneObjects
        var components = this.props.sceneEditor.engine.getComponents();
        var thisObject = this.props.sceneEditor.selected[0];
       if (thisObject) {
            var typeinfo = components.find(x=> x.name == thisObject.type);
            //generate an editor for each typeinfo
            return typeinfo.properties.map(ti => this.renderPropertyEditor(thisObject, ti))
       } else {
           <div>Nothing Selected</div>
       }
    }

    render() {
        return <div>
                { this.renderEditors() }
            </div>            
    }
}