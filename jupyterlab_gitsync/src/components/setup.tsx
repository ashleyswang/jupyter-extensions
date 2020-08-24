import * as React from 'react';
// import { style } from 'typestyle';

import { Props } from './panel';

interface GitSetupState {
  path?: any;
  options?: any;
}

export class GitSetup extends React.Component<Props, GitSetupState> {
  constructor(props) {
    super(props);
    this.state = {
      path: '.', 
      options: undefined,
    }
  }

  componentDidMount() {
    this.props.service.git.setup('.');
  }

  onSubmit = (event): void => {
    event.preventDefault();
    const remote = this.state.options.split(' ')[0];
    const worktree = this.state.options.split(' ')[1];
    this.props.service.git.setup(this.state.path, remote, worktree);
  }

  onPathChange = (event): void => {
    this.setState({path: event.target.value});
  }

  onOptionsChange = (event): void => {
    this.setState({options: event.target.value});
  }

  render(): React.ReactElement {
    return(
      <form onSubmit={this.onSubmit}>
        <label> Working Repository:
          <input type="text" value={this.state.path} onChange={this.onPathChange} />
        </label>
        <label> Remote / Worktree:
          <input type="text" value={this.state.options} onChange={this.onOptionsChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
  
}