import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {inject, observer} from 'mobx-react';

import {compose} from 'components/utils/utils';

import HistoricalPerformanceChart from 'components/pages/analyze/Overview/HistoricalPerformanceChart';
import HistoryOverviewTable from 'components/pages/analyze/Overview/HistoryOverviewTable';
import ImpactByCRM from 'components/pages/analyze/Overview/ImpactByCRM';
import ImpactByIndicator from 'components/pages/analyze/Overview/ImpactByIndicator';
import ImpactByMarketing from 'components/pages/analyze/Overview/ImpactByMarketing';
import StatsSquares from 'components/pages/analyze/Overview/StatsSquares';
import TypedOverviewTable from 'components/pages/analyze/Overview/TypedOverviewTable';

import styles from 'styles/analyze/analyze.css';

const enhance = compose(
  inject(({
            attributionStore: {
              data,
            },
          }) => ({
    data,
  })),
  observer
);

const classes = styles.locals;

class Overview extends React.Component {
  componentDidMount() {
    styles.use();
  }

  componentWillUnmount() {
    styles.unuse();
  }

  render() {
    const {
      data,
    } = this.props;

    if (!Object.keys(data).length) {
      return null;
    }

    return (
      <React.Fragment>
        <StatsSquares/>
        <ImpactByIndicator />
        <ImpactByCRM />
        <ImpactByMarketing />

        <div className={classNames(classes.rows, classes.wrap)}>
          <TypedOverviewTable type={'category'}/>
          <TypedOverviewTable type={'channel'}/>
          <TypedOverviewTable type={'campaign'}/>
          <TypedOverviewTable type={'content'}/>

          <HistoricalPerformanceChart />
          <HistoryOverviewTable />
        </div>
      </React.Fragment>
    );
  }
}

Overview.proTypes = {
  data: PropTypes.shape({}),
};

export default enhance(Overview);

