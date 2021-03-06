import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';

interface IReactProps {}

interface IExplorerProps extends IReactProps {
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
    selectNode(obj: SceneObject, event: React.SyntheticEvent<HTMLElement>) {
        event.stopPropagation();
        //select it
        if (!window['keys']['Control']) { 
            this.props.sceneEditor.clearSelection()
        }
        this.props.sceneEditor.addToSelection(obj);
    }

    toggleNode(obj: SceneObject, event: React.SyntheticEvent<HTMLElement>) {
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
                        { children.map(c => <li key={c.getFullName()} onClick={this.toggleNode.bind(this, c)}><span onClick={this.selectNode.bind(this,c)}  className={`node ${this.props.sceneEditor.selected.indexOf(c) >=0  ? "selected": "" }`} >{ c.name }</span> { renderChildren(c) }</li>) }
                   </ul>
        }
        return (
             sceneTree ?  renderChildren(null)  : <span> No Scene </span> 
        );            
    }
}