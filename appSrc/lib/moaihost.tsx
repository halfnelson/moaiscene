import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare var MoaiPlayer:any;

interface IHostProps {
    sourcePath: string;
}

interface IHostState {
    player?: any;
    mount?: any;
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

        var player = new MoaiPlayer($("#moaiplayer"));
      
        player.initMoai(); 
        player.moai.getEmscripten();
        console.log(this.props.sourcePath)
        
        player.moai.emscripten.FS_mkdir('/project');
        var mount = player.moai.emscripten.FS_mount(player.moai.emscripten.FS_filesystems.NODEFS, { root: this.props.sourcePath }, '/project');
        player.moai.emscripten.FS_chdir('/project');
        
        this.setState({
            player: player,
            mount: mount
        }) 

        player.hideInfo();
        player.moai.hostinit();
        player.moai.emscripten.run()
        player.moai.AKUSetWorkingDirectory('/project');
        
        player.moai.AKURunScript('main.lua');
        player.moai.pause();
        player.moai.updateloop();
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

    dorun() {
          this.state.player.moai.run(this.state.player.script);
    }

}