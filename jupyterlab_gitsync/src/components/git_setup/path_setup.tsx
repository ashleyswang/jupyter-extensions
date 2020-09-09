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
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import Grid from "@material-ui/core/Grid";


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
    this._addListeners();
    this.props.service.setup(this.state.path);
  }

  render(): React.ReactElement {
    return(
      <FormControl 
        className={classes(setupItemClass)}
        disabled={this.state.disabled} 
      >
        <Grid container className={classes(setupItemInnerClass)}>
          <Grid item xs>
            <Input 
              value={this.state.value} 
              onChange={(event) => this._onChange(event)} 
              onKeyDown={(event) => this._onKeyDown(event)}
              style={{width: "85%"}}
            />
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => this._onClick()}
              style={{position: "absolute", right: "0px"}}
              disabled={this.state.disabled}
            >
              <SendIcon fontSize='small'/>
            </IconButton>
          </Grid>
        </Grid>
      <FormHelperText>Repository </FormHelperText>
      </FormControl>
    );
  }

  private _onChange(event) {
    this.setState({ value: event.target.value });
  }

  private _onKeyDown(event) {
    if (event.keyCode === 13)
      this._onClick();
  }

  private _onClick() {
    this.setState({ path: this.state.value });
    this.props.service.setup(this.state.value);
    console.log(this.state.value);
  }

  /* Only allow path changes when the service is not running */
  private _addListeners() {
    this.props.service.stateChange.connect((_, running) => {
      if (running && !this.state.disabled) this.setState({ disabled: true });
      else if (!running && this.state.disabled) this.setState({ disabled: false });
    });
  }

}