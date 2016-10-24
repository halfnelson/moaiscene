import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SceneEditor } from '../sceneEditor'
import { SceneObject } from '../sceneObject'
import { observer } from 'mobx-react';

interface IPreviewProps {
    sceneEditor: SceneEditor,
    layoutWidth: number,
    layoutHeight: number
}

interface IPreviewState {
   
}

@observer
export class ScenePreview extends React.Component<IPreviewProps, IPreviewState> {

    constructor(props: IPreviewProps) {
        super(props);
        this.state = {}
    }

    componentWillUnmount() {}

    componentWillReceiveProps(nextProps: IPreviewProps) {}

    componentDidMount() {}
    
    render() {
        return <this.props.sceneEditor.engine.previewComponent {...this.props}> </this.props.sceneEditor.engine.previewComponent>
    }
}