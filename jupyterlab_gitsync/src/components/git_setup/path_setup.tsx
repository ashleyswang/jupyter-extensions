import * as React from 'react';
import { classes } from 'typestyle';

import { Props } from '../panel';

import { 
  setupItemClass,
  setupItemInnerClass,
} from '../../style/setup';

import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from '@material-ui/core/Input';


interface GitPathState {
  disabled: boolean;
  path: string;
  value: string;
}

export class GitPathSetup extends React.Component<Props, GitPathState> {
  constructor(props){
    super(props);
    this.state = {
      disabled: false,
      path: '.',
      value: '.',
    }
  }

  componentDidMount() {
    this.props.service.git.setup('.');
    this._addListeners();
  }

  render(): React.ReactElement {
    return(
      <FormControl 
        className={classes(setupItemClass)}
        disabled={this.state.disabled} 
      >
        <Input 
          className={classes(setupItemInnerClass)}
          value={this.state.value} 
          onChange={(event) => this._onChange(event)} 
          onBlur={() => this._updatePath()}
        />
        <FormHelperText>Repository </FormHelperText>
      </FormControl>
    );
  }

  private _onChange(event) {
    this.setState({ value: event.target.value });
  }

  private _updatePath() {
    this.setState({ path: this.state.value });
    this.props.service.git.path = this.state.path;
  }

  /* Only allow path changes when the service is not running */
  private _addListeners() {
    this.props.service.stateChange.connect((_, running) => {
      if (running && !this.state.disabled) this.setState({ disabled: true });
      else if (!running && this.state.disabled) this.setState({ disabled: false });
    });
  }

}