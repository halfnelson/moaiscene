import * as React from "react";
import * as ReactDOM from "react-dom";
import { SceneEditor } from "../sceneEditor";
import { SceneObject } from "../sceneObject";
import { observer } from "mobx-react";
import { SceneComponent } from "../sceneComponent";

interface IPaletteProps {
    sceneEditor: SceneEditor;
}

interface IPaletteState {
    components: Array<SceneComponent>
}

@observer
export class ScenePalette extends React.Component<
    IPaletteProps,
    IPaletteState
> {
    constructor(props: IPaletteProps) {
        super(props);
        this.state = {
            components: []
        };
    }

    componentWillUnmount() {}

    componentWillReceiveProps(nextProps: IPaletteProps) {
        if (nextProps.sceneEditor != this.props.sceneEditor) {
            nextProps.sceneEditor.getComponents().then(components => {
                this.setState((prev, props) => {
                    return { components: components }
                })
            })
        }
    }

    componentDidMount() {
        this.props.sceneEditor.getComponents().then(components => {
            this.setState({ components: components })
        })
    }

    render() {
        return (
            <div>
                <h1>Palette</h1>
                <pre>
                    <code>
                        {JSON.stringify(this.state.components, null, 2)}
                    </code>
                </pre>
            </div>
        );
    }
}
