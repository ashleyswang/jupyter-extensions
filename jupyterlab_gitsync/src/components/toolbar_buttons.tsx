import React from 'react';
import { style } from 'typestyle';

import { Props } from './panel';
import { ToolbarButton } from './toolbar_button';

interface ControlButtonState {
  title: string;
  style: string;
  isRunning: boolean;
}

export class ControlButton extends React.Component<Props, ControlButtonState> {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Stop Auto Sync',
      style: style({ backgroundImage: 'var(--jp-icon-stop)' }),
      isRunning: true,
    };
  }

  componentDidMount() {
    this.props.service.start();
    this._addListeners();
  }

  render() {
    const { title, style } = this.state;
    return (
      <ToolbarButton
        title={title}
        service={this.props.service}
        style={style}
        onClick={() => this._onClick()}
      />
    );
  }

  private _onClick(): void {
    if (this.props.service.running) {
      this.props.service.stop();
    } else {
      this.props.service.start();
    }
  }

  private _setRunState() {
    this.setState({
      title: 'Stop Auto Sync',
      style: style({
        backgroundImage: 'var(--jp-icon-stop)',
      }),
      isRunning: true,
    });
  }

  private _setStopState() {
    this.setState({
      title: 'Start Auto Sync',
      style: style({
        backgroundImage: 'var(--jp-icon-run)',
      }),
      isRunning: false,
    });
  }

  private _addListeners() {
    this.props.service.stateChange.connect((_, running) => {
      if (running && !this.state.isRunning) this._setRunState();
      else if (!running && this.state.isRunning) this._setStopState();
    });
  }
}

interface StatusButtonState {
  title: string;
  style: string;
  status: boolean;
}

export class StatusButton extends React.Component<Props, StatusButtonState> {
  constructor(props) {
    super(props);
    this.state = {
      title: 'All Files Up To Date',
      style: style({ backgroundColor: 'green' }),
      status: 'up-to-date',
    };
  }

  componentDidMount() {
    this._addListeners();
  }

  render() {
    const { title, style } = this.state;
    return (
      <ToolbarButton
        title={title}
        service={this.props.service}
        style={style}
        onClick={() => this._onClick()}
      />
    );
  }

  private _onClick(): void {
    // TO DO (ashleyswang): onClick bring sync log to the front
    return;
  }

  private _setUpToDateState(): void {
    this.setState({
      title: 'All Files Up To Date',
      style: style({ backgroundColor: 'green'}),
      status: 'up-to-date',
    })
  }

  private _setSyncState(): void {
    this.setState({
      title: 'Syncing with Remote Repository',
      style: style({ backgroundColor: 'lightblue'}),
      status: 'sync',
    })
  }

  private _setMergeState(): void {
    this.setState({
      title: 'Merging Local and Remote Versions',
      style: style({ backgroundColor: 'blue'}),
      status: 'merge',
    })
  }

  private _setDirtyState(): void {
    this.setState({
      title: 'Files have Unsaved Changes',
      style: style({ backgroundColor: 'yellow'}),
      status: 'dirty',
    })
  }

  private _setWarningState(): void {
    this.setState({
      title: 'An Error has Occurred',
      style: style({ backgroundColor: 'red'}),
      status: 'warning',
    })
  }

  private _addListeners() {
    this.props.service.statusChange.connect((_, status) => {
      if (status != this.state.status){
        switch (status) {
          case 'up-to-date':
            this._setWarningState();
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

export class SaveButton extends React.Component<Props, {}> {
  private readonly title = 'Save All Open Files';
  private readonly style = style({ backgroundImage: 'var(--jp-icon-save)' });

  render() {
    return (
      <ToolbarButton
        title={this.title}
        service={this.props.service}
        style={this.style}
        onClick={() => this._onClick()}
      />
    );
  }

  private _onClick(): void {
    this.props.service.tracker.saveAll();
  }
}

export class SyncButton extends React.Component<Props, {}> {
  private readonly title = 'Sync With Remote Repo';
  private readonly style = style({ backgroundImage: 'var(--jp-icon-refresh)' });

  render() {
    return (
      <ToolbarButton
        title={this.title}
        service={this.props.service}
        style={this.style}
        onClick={() => this._onClick()}
      />
    );
  }

  private _onClick(): void {
    this.props.service.git.sync();
  }
}

export class ReloadButton extends React.Component<Props, {}> {
  private readonly title = 'Reload All Open Files';
  private readonly style = style({ backgroundImage: 'var(--jp--icon-bug)' });

  render() {
    return (
      <ToolbarButton
        title={this.title}
        service={this.props.service}
        style={this.style}
        onClick={() => this._onClick()}
      />
    );
  }

  private _onClick(): void {
    this.props.service.tracker.current.reload();
  }
}