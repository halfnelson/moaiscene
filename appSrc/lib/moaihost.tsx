import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare var MoaiPlayer:any;

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
    constructor(props: IHostProps) {
        super(props);
        this.state = {
            player: null,
            mount: null
        }
    }

    componentWillUnmount() {
        console.log("destroying player");
        this.setState({
            player: null,
            mount: null
        })
    }

    componentDidMount() {
        console.log("creating new player");
        
        var appDir = path.join(window['appDir'],"lua");

        var player = new MoaiPlayer($("#moaiplayer"));
        
        player.hideInfo();
        if (!player.moai) { player.initMoai(); }
        player.moai.getEmscripten();
        player.moai.emscripten.FS_mkdir('/editor');
        var editor_mount = player.moai.emscripten.FS_mount(player.moai.emscripten.FS_filesystems.NODEFS, { root: appDir+"\\" }, '/editor');

        player.moai.emscripten.FS_mkdir('/project');
        var mount = player.moai.emscripten.FS_mount(player.moai.emscripten.FS_filesystems.NODEFS, { root: this.props.sourcePath }, '/project');

        this.setState({
            player: player,
            mount: mount,
            editor_mount: editor_mount
        }) 

        //needs to be done on next turn after emscripten is initialized
        window.setTimeout(function() { 
              console.log("MoaiJS Filesystem Loaded");	
  	          player.moai.emscripten.run();   
		      player.moai.restoreDocumentDirectory();

                player.moai.hostinit();
                player.moai.AKUSetWorkingDirectory('/editor');
	            player.moai.AKURunScript("main.lua");
                
                //player.moai.pause();
                //player.moai.updateloop();
        }.bind(this),0);
        
        
    }
   
    render() {
        return ( 
            <div id="moaiplayer" className="moai-player" data-url="" data-title="My Moai App" data-ram="64">
                <div id="runMe" onClick={this.dorun}><i className="fa fa-play"></i></div>
                <div className="moai-cpal">
                    <img src="lib/moai-host/moailogo-white.svg"/>
                    <a href="http://www.getmoai.com">www.getmoai.com</a>
                </div>
            </div>
        );
    }
}