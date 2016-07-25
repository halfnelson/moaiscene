import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { MoaiHost } from './lib/moaihost';
 

var srcPath = "k:/dev/moai-projects/test175/src";
ReactDOM.render(<MoaiHost sourcePath={srcPath} />, document.getElementById('root'));