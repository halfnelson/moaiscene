import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare var MoaiJS: any;

const path = require('path');


interface IHostProps {
    sourcePath: string;
}

interface IHostState {
    player?: any;
    mount?: any;
    editor_mount?: any;
}

export class MoaiHost extends React.Component<IHostProps, IHostState> {
    moaiCanvas: HTMLCanvasElement;
    moai: any;
    active: boolean;
    unhookevents: () => void;

    constructor(props: IHostProps) {
        super(props);
        this.moaiCanvas = null;
        this.state = {
            player: null,
            mount: null
        }
    }

    componentWillUnmount() {
        console.log("destroying player");
        this.active = false;
        this.moai.pause();
        this.unhookevents();
        this.moai = null;
     }


    onError(err) {
        console.log("ERROR: ", err);
    };

    onPrint(x) {
        console.log(x);
    };

    renderLoop() {
        if (!this.active) return;
        this.moai.onPaint();
        const renderloop = this.renderLoop.bind(this); 
        this.moai.emscripten.requestAnimationFrame(renderloop);
    }

    componentDidMount() {
        console.log("creating new player");

        var appDir = path.join(window['appDir'], "lua");

        this.moai =   new MoaiJS(this.moaiCanvas, 64 * 1024 * 1024, ()=>{}, ()=>{}, this.onError.bind(this), this.onPrint.bind(this),()=>{});
        var moai = this.moai;

        moai.getEmscripten();
        var emscripten = moai.emscripten;
        emscripten.SetOpenWindowFunc(()=>{ return this.moaiCanvas}); //we will handle the canvas from here
        
        var canvas = this.moaiCanvas;
        canvas.width = 640;
        canvas.height = 480;
        moai.canvasScale = canvas.width / $(canvas).width();

        canvas.focus();

        var mousedown = moai.mousedown.bind(moai);
        var mouseup = moai.mouseup.bind(moai);
        var mousemove = moai.mousemove.bind(moai);
        var keydown = moai.keydown.bind(moai);
        var keyup = moai.keyup.bind(moai);
        var keypress =moai.keypress.bind(moai);
        var mouseover = function () { canvas.focus(); }
        var mouseout = (function () { canvas.blur(); moai.cancelMouseButtons(); }).bind(moai);
        var contextmenu = function (e) {
                                e.preventDefault();
                                return false;
                        };

        //hook mouse
        canvas.addEventListener("mousedown", mousedown, false);
        canvas.addEventListener("mouseup", mouseup, false);
        canvas.addEventListener("mousemove", mousemove, false);

        //grab focus on hover
        canvas.addEventListener("mouseover", mouseover, false);
        canvas.addEventListener("mouseout", mouseout, false);

        //grab keys
        canvas.addEventListener("keydown", keydown, false);
        canvas.addEventListener("keyup", keyup, false);
        canvas.addEventListener("keypress", keypress, false);

        canvas.addEventListener("contextmenu", contextmenu);

        this.unhookevents = () => {
            canvas.removeEventListener("mousedown", mousedown);
            canvas.removeEventListener("mouseup", mouseup);
            canvas.removeEventListener("mousemove", mousemove);
            canvas.removeEventListener("mouseover", mouseover);
            canvas.removeEventListener("mouseout", mouseout);
            canvas.removeEventListener("keydown", keydown);
            canvas.removeEventListener("keyup", keyup);
            canvas.removeEventListener("keypress", keypress);
            canvas.removeEventListener("contextmenu", contextmenu);
        }



        emscripten.FS_mkdir('/editor');
        var editor_mount = emscripten.FS_mount(emscripten.FS_filesystems.NODEFS, { root: appDir + "\\" }, '/editor');
        emscripten.FS_mkdir('/project');
        var mount =emscripten.FS_mount(emscripten.FS_filesystems.NODEFS, { root: this.props.sourcePath }, '/project');
        this.setState({
            editor_mount: editor_mount,
            mount: mount
        })

        //needs to be done on next turn after emscripten is initialized
        window.setTimeout(function () {
            console.log("MoaiJS Filesystem Loaded");
            this.moai.emscripten.run();
            this.moai.restoreDocumentDirectory();

            this.moai.hostinit();
            this.moai.AKUSetWorkingDirectory('/editor');
            this.moai.AKURunScript("main.lua");
            //player.moai.pause();
            //player.moai.updateloop();
                    //now start rendering and updationg
            moai.startUpdates();
            this.active = true;
            emscripten.requestAnimationFrame(this.renderLoop.bind(this));

        }.bind(this), 0);

    }

    toggle() {

    }
    render() {
        return (
            <canvas ref={(ref) => this.moaiCanvas = ref}></canvas>
        );
    }
}