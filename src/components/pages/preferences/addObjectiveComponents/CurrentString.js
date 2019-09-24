import React from 'react';
import Component from 'components/Component';
import {formatNumber} from 'components/utils/budget';

export default class CurrentString extends Component {
  render() {
    const {indicator, isRecurrent, isCustom, classes, actualIndicators} = this.props;
    if (!indicator || !!((isRecurrent && !isCustom))) return null;

    return (
      <div className={classes.text} style={{marginLeft: '20px'}}>
        Current: {formatNumber(actualIndicators[indicator])}
      </div>
    );
  }
}
