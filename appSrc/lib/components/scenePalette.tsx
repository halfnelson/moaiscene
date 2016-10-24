import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';
import { SceneComponent } from '../sceneComponent';

interface IPaletteProps {
    sceneEditor: SceneEditor,
}

interface IPaletteState {
    
}

@observer export class ScenePalette extends React.Component<IPaletteProps, IPaletteState> {

    constructor(props: IPaletteProps) {
        super(props);
        this.state = {}
    }

    componentWillUnmount() { }

    componentWillReceiveProps(nextProps: IPaletteProps) { }

    componentDidMount() { }

    getComponents() {
        return this.props.sceneEditor.engine.getComponents();
    }

    render() {
        return <div>
            <h1>Palette</h1>
            <pre><code>
                { JSON.stringify(this.getComponents(),null,2) }
            </code></pre>
            </div>            
    }
}