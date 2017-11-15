import * as React from "react";
import * as ReactDOM from "react-dom";
import { SceneCommand } from "./sceneCommands";

declare var MoaiJS: any;

const path = require("path");

export type scriptRunner = (script: string) => any;
export type messageProcessor = (msg: any) => any;
type engineAttachCallback = (sr: scriptRunner) => messageProcessor;

interface IHostProps {
    onAttach?: engineAttachCallback;
    sourcePath: string;
    layoutWidth?: number;
    layoutHeight?: number;
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
    onMessage?: messageProcessor;
    unhookevents: () => void;

    constructor(props: IHostProps) {
        super(props);
        this.moaiCanvas = null;
        this.state = {
            player: null,
            mount: null
        };
    }

    componentWillUnmount() {
        console.log("destroying player");
        this.active = false;
        this.moai.pause();
        this.unhookevents();
        this.moai = null;
    }

    refreshSize(width, height) {
        if (!this.active) return;
      
        this.moai.onReshape(width, height);
        this.moai.AKURunString(
            "MOAIEnvironment.horizontalResolution = " + width
        );
        this.moai.AKURunString(
            "MOAIEnvironment.verticalResolution = " + height
        );
        this.moai.AKURunString("refreshViewport()");
    }

    componentWillReceiveProps(nextProps: IHostProps) {
        if (
            nextProps.layoutHeight != this.props.layoutHeight ||
            nextProps.layoutWidth != this.props.layoutWidth
        ) {
            this.refreshSize(nextProps.layoutWidth, nextProps.layoutHeight);
        }
    }

    onError(err) {
        console.log("ERROR: ", err);
    }

    onPrint(x: string) {
        console.log(x);
        if (x.startsWith("MESSAGE:\n")) {
            //deserialize message
        }
    }

    renderLoop() {
        if (!this.active) return;
        this.moai.onPaint(); 
        const renderloop = this.renderLoop.bind(this);
        this.moai.getEmscripten().then(function(emscripten) { 
            emscripten.requestAnimationFrame(renderloop)
        }.bind(this));
    }

    initEmscripten(emscripten) {
        console.log("got emscripten",emscripten);
        emscripten.SetOpenWindowFunc(() => {
            return this.moaiCanvas;
        }); //we will handle the canvas from here
        emscripten.FS_mkdir("/editor");
        var appDir = path.join(window["appDir"], "lua");
        
        var editor_mount = emscripten.FS_mount(
            emscripten.FS_filesystems.NODEFS,
            { root: appDir + "\\" },
            "/editor"
        );
        emscripten.FS_mkdir("/project");
        //  var mount = emscripten.FS_mount(emscripten.FS_filesystems.NODEFS, { root: this.props.sourcePath }, '/project');
     //   this.setState({
       //     editor_mount: editor_mount
      //  });

      var moai = this.moai;
      
      var canvas = this.moaiCanvas;
      moai.canvasScale = 1;
      canvas.focus();
      var mousedown = moai.mousedown.bind(moai);
      var mouseup = moai.mouseup.bind(moai);
      var mousemove = moai.mousemove.bind(moai);
      var keydown = moai.keydown.bind(moai);
      var keyup = moai.keyup.bind(moai);
      var keypress = moai.keypress.bind(moai);
      var mouseover = function() {
          canvas.focus();
      };
      var mouseout = function() {
          canvas.blur();
          moai.cancelMouseButtons();
      }.bind(moai);
      var contextmenu = function(e) {
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
      };
        //needs to be done on next turn after emscripten is initialized
        console.log("MoaiJS Filesystem Loaded");
        emscripten.run();
        this.moai.restoreDocumentDirectory();

        this.moai.hostinit();

        this.moai.AKUSetWorkingDirectory("/editor");
        this.moai.AKURunScript("main.lua");
        this.refreshSize(
            this.props.layoutWidth,
            this.props.layoutHeight
        );

        //now start rendering and updationg
        this.moai.startUpdates();
        this.active = true;

        emscripten.requestAnimationFrame(this.renderLoop.bind(this));

        if (this.props.onAttach) {
            this.onMessage = this.props.onAttach(function(
                script: string
            ) {
                console.log("run string:", script);
            });
            this.onMessage("Hi from moai host");
        }
     

    }

    componentDidMount() {
        console.log("creating new player");

        var appDir = path.join(window["appDir"], "lua");

        this.moai = new MoaiJS(
            this.moaiCanvas,
            64 * 1024 * 1024,
            () => {},
            () => {},
            this.onError.bind(this),
            this.onPrint.bind(this),
            () => {},
            'lib/moai-host/lib/moaijs.wasm'
        );
       

      


        this.moai.getEmscripten()
        .then((emscripten) => Promise.resolve(emscripten))
        .then((emscripten) => {
            this.initEmscripten(emscripten);
            return true;
        }).error(function(err) {
            console.error(err);
        });
   }

    toggle() {}
    render() {
        return (
            <canvas
                ref={ref => (this.moaiCanvas = ref)}
                width={this.props.layoutWidth}
                height={this.props.layoutHeight}
                tabIndex={0}
            />
        );
    }
}
