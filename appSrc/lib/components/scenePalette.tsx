import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';

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

    render() {
        return <h1>Palette</h1>            
    }
}