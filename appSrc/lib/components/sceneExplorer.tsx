import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';

interface IExplorerProps {
    sceneEditor: SceneEditor,
}

interface IExplorerState {
    expanded: Array<SceneObject>
}

@observer export class SceneExplorer extends React.Component<IExplorerProps, IExplorerState> {

    constructor(props: IExplorerProps) {
        super(props);
        this.state = {
            expanded: []
        }
    }

    componentWillUnmount() {

     }

    componentWillReceiveProps(nextProps: IExplorerProps) { }

    componentDidMount() { 

    }
    toggleNode(obj: SceneObject, event: React.SyntheticEvent ) {
        event.stopPropagation();
        if (this.state.expanded.indexOf(obj) > -1) {
            //remove
            this.setState({ 
                expanded: this.state.expanded.filter(x=>x != obj)
            })
        } else {
            this.setState({
                expanded: this.state.expanded.concat([obj])
            })
        }
    }

    render() {
        var scene = this.props.sceneEditor ? this.props.sceneEditor.scene : null;
        var sceneTree = scene ? scene.sceneTree : null;
        var renderChildren = (o: SceneObject) => {
            if (o && this.state.expanded.indexOf(o) < 0)  return;
            var children = sceneTree.childrenOf(o);
            if (children.length == 0) return;          
            return <ul> 
                        { children.map(c => <li key={c.name} onClick={this.toggleNode.bind(this, c)}><span className="node">{ c.name }</span> { renderChildren(c) }</li>) }
                   </ul>
        }
        return (
             sceneTree ?  renderChildren(null)  : <span> No Scene </span> 
        );            
    }
}