import React from 'react';

import { Props } from '../panel';

import { IconButton } from '@material-ui/core';
import SyncIcon from '@material-ui/icons/Sync';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';
import MergeTypeIcon from '@material-ui/icons/MergeType';


interface StatusButtonState {
  title: string;
  icon: any;
  status: string;
}

export class StatusButton extends React.Component<Props, StatusButtonState> {
  constructor(props) {
    super(props);
    this.state = {
      title: 'All Files Up To Date',
      icon: <DoneAllIcon fontSize='small'/>,
      status: 'up-to-date',
    };
  }

  componentDidMount() {
    this._addListeners();
  }

  render() {
    return (
      <IconButton
        title={this.state.title}
        color='inherit'
        onClick={() => this._onClick()}
      >
        {this.state.icon}
      </IconButton>
    );
  }

  private _onClick(): void {
    // TO DO (ashleyswang): onClick bring sync log to the front
    return;
  }

  private _setUpToDateState(): void {
    this.setState({
      title: 'All Files Up To Date',
      icon: <DoneAllIcon fontSize='small'/>,
      status: 'up-to-date',
    })
  }

  private _setSyncState(): void {
    this.setState({
      title: 'Syncing with Remote Repository',
      icon: <SyncIcon fontSize='small'/>,
      status: 'sync',
    })
  }

  private _setMergeState(): void {
    this.setState({
      title: 'Merging Local and Remote Versions',
      icon: <MergeTypeIcon fontSize='small'/>,
      status: 'merge',
    })
  }

  private _setDirtyState(): void {
    this.setState({
      title: 'Files have Unsaved Changes',
      icon: <DoneIcon fontSize='small'/>,
      status: 'dirty',
    })
  }

  private _setWarningState(): void {
    this.setState({
      title: 'An Error has Occurred',
      icon: <SyncProblemIcon fontSize='small'/>,
      status: 'warning',
    })
  }

  private _addListeners() {
    this.props.service.statusChange.connect((_, status) => {
      if (status != this.state.status){
        switch (status) {
          case 'up-to-date':
            this._setUpToDateState();
            break;
          case 'sync':
            this._setSyncState();
            break;
          case 'merge':
            this._setMergeState();
            break;
          case 'dirty':
            this._setDirtyState();
            break;
          case 'warning':
            this._setWarningState();
            break;
        }
      }
    });
  }
}