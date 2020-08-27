import * as React from 'react';

import {
  GitPathSetup,
  GitBranchSetup,
} from './git_setup';

import { Props } from './panel';


// if not collaborative just don't set remote and worktree
export class GitSetup extends React.Component<Props, {}> {
  constructor(props) {
    super(props);
  }

  render(): React.ReactElement {
    return(
      <div>
        <GitPathSetup service={this.props.service}/>
        <GitBranchSetup service={this.props.service}/>
      </div>
    );
  }  
}