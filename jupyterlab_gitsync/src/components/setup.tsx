import * as React from 'react';
// import { style } from 'typestyle';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { Props } from './panel';

interface GitSetupState {
  path?: any;
  options?: any;
}


// if not collaborative just don't set remote and worktree
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

  render(): React.ReactElement {
    return(
      <GitBranch service={this.props.service}/>
    );
  }  
}

interface GitBranchState {
  currBranch: string;
  branches: string[];
}

class GitBranch extends React.Component<Props, GitBranchState> {
  constructor(props){
    super(props);
    this.state = {
      currBranch: '        ',
      branches: [],
    }
  }

  componentDidMount() {
    this._addListeners();
  }

  render(): React.ReactElement {
    return(
      <DropdownButton id='git-branch-dropdown' title={this.state.currBranch}>
        <React.Fragment>
          {this._renderBranches()}
        </React.Fragment>
      </DropdownButton>
    );
  }

  private _renderBranches() {
    return this.state.branches.map((branch) => {
      return (
        <Dropdown.Item 
          as="button" 
          key={branch}
          eventKey={branch}
          onSelect={(key, event)=>this._onSelect(key, event)}
        > {branch}
        </Dropdown.Item>
      )
    });
  }

  private _onSelect(key, event){
    this.setState({ currBranch: key });
    this.props.service.git.currBranch = key;
  }

  private _addListeners() {
    this.props.service.git.setupChange.connect(()=>{
      this.setState({ branches: this.props.service.git.branches })
    });
  }

}
