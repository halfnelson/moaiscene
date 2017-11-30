import { Message } from "phosphor-messaging";
import { ResizeMessage, Widget } from "phosphor-widget";
import * as React from "react";
import * as ReactDOM from "react-dom";

export class ReactWidget<T extends React.ComponentClass> extends Widget {
    component: T;
    width: number;
    height: number;
    props: any;
    constructor(component: T, props: any) {
        super();
        this.props = props;
        this.component = component;
    }

    protected onResize(msg: ResizeMessage): void {
        this.width = msg.width;
        this.height = msg.height;
        this.update();
    }

    protected onUpdateRequest(msg: Message): void {
        ReactDOM.render(
            <this.component
                {...this.props }
                layoutWidth={this.width}
                layoutHeight={this.height}
            />,
            this.node
        );
        this.fit();
    }
}