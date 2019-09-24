import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import { formatNumberWithDecimalPoint } from 'components/utils/budget';
import { compose } from 'components/utils/utils';

import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const enhance = compose(
    inject(
        ({
            attributionStore: { metricsOptions },
            analyze: {
                overviewStore: { getCategoryData },
            },
        }) => {
            return {
                getCategoryData,
                metricsOptions,
            };
        },
    ),
    observer,
);

class ImpactByMarketing extends Component {
    state = {
        indicator: 'SQL',
    };

    onIndicatorChange = ({ value: indicator }) => {
        this.setState({
            indicator,
        });
    };

    render() {
        const { getCategoryData, metricsOptions } = this.props;
        const { indicator } = this.state;
        const data = getCategoryData(indicator);

        return (
            <div className={classes.rows}>
                <GeneratedImpact
                    data={data}
                    valuesFormatter={formatNumberWithDecimalPoint}
                    title="Marketing-Generated Business Impact"
                    indicator={indicator}
                >
                    <div className={classes.select}>
                        <div className={classes.selectLabel}>
                            Conversion goal
                        </div>
                        <Select
                            selected={indicator}
                            select={{
                                options: metricsOptions,
                            }}
                            onChange={this.onIndicatorChange}
                            style={{
                                width: '143px',
                                marginLeft: '10px',
                                fontWeight: 500,
                            }}
                        />
                    </div>
                </GeneratedImpact>
            </div>
        );
    }
}

ImpactByMarketing.defaultProps = {
    getCategoryData: () => [],
};

ImpactByMarketing.propTypes = {
    getCategoryData: PropTypes.func,
    metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
};

export default enhance(ImpactByMarketing);
