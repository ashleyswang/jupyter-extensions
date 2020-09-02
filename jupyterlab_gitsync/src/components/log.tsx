import * as React from 'react';
import { classes } from 'typestyle';

import { 
  logDisplayClass,
  logEntryClass,
  logEntryTimeClass,
  logEntryValueClass,
} from '../style/log';

import { Props } from './panel';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

interface SyncLogState {
  entries: {
    date: Date;
    value: string;
  }[];
}

export class SyncLog extends React.Component<Props, SyncLogState> {
  readonly logEndRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = {
      entries: [],
    }
  }

  componentDidMount() {
    this._addListeners();
  }

  componentDidUpdate () {
    this._scrollToBottom();
  }

  private _scrollToBottom() {
    this.logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  render(): React.ReactElement {
    return(
      <List className={classes(logDisplayClass)}>
        {this._renderEntries()}
        <div ref={this.logEndRef} />
      </List>
    );
  }

  private _renderEntries(){
    return this.state.entries.map((entry, index) => {
      return (
        <React.Fragment key={`${index}-fragment`}>
          {(index) ? <Divider /> : undefined }
          <ListItem key={`${index}-listItem`} className={classes(logEntryClass)}>
            <Typography 
              className={classes(logEntryTimeClass)} 
              color = "textSecondary"
              key={`${index}-time`}
            > 
              {entry.date.toTimeString().split(' ')[0]} 
            </Typography>
            <Typography 
              className={classes(logEntryValueClass)} 
              color = "textPrimary"
              key={`${index}-value`}
            > 
              {entry.value}
            </Typography>
          </ListItem>
        </React.Fragment>
      )
    });
  }

  private _addListeners() {
    this.props.service.statusChange.connect((_, value) => {
      let entries = this.state.entries;
      switch (value.status) {
        case 'sync':
          entries.push({
            date: new Date(),
            value: 'Saved local changes.'
          })
          break;
        case 'merge':
          entries.push({
            date: new Date(),
            value: 'Synced with remote repository.'
          })
          break;
        case 'up-to-date':
          entries.push({
            date: new Date(),
            value: 'Successfully merged changes.'
          })
          break;
        case 'warning':
          entries.push({
            date: new Date(),
            value: value.error
          })
          break;
      }
      this.setState({ entries: entries });
    });

    this.props.service.setupChange.connect((_, value) => {
      let entries = this.state.entries;
      entries.push({
        date: new Date(),
        value: value.value,
      })
      this.setState({ entries: entries });
    });
  }
}