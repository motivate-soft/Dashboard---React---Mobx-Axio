import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FeatureToggle } from 'react-feature-toggles';
import { inject, observer } from 'mobx-react';

import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';

import { compose } from 'components/utils/utils';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const enhance = compose(
    inject(
        ({
            attributionStore: { metricsOptions },
            analyze: {
                overviewStore: { getImpactData },
            },
        }) => {
            return {
                getImpactData,
                metricsOptions,
            };
        },
    ),
    observer,
);

class ImpactByIndicator extends Component {
    state = {
        indicator: 'SQL',
    };

    onIndicatorChange = ({ value: indicator }) => {
        this.setState({
            indicator,
        });
    };

    render() {
        const { getImpactData, metricsOptions } = this.props;
        const { indicator } = this.state;
        const data = getImpactData(indicator);

        return (
            <FeatureToggle featureName="marketingVsSales">
                <div className={classes.rows}>
                    <GeneratedImpact
                        data={data}
                        title="Marketing vs Sales Impact"
                        indicator={indicator}
                    >
                        <div className={classes.select}>
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
            </FeatureToggle>
        );
    }
}

ImpactByIndicator.defaultProps = {
    impactData: [],
};

ImpactByIndicator.propTypes = {
    impactData: PropTypes.arrayOf(PropTypes.shape({})),
    indicator: PropTypes.string,
    metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
    onIndicatorChange: PropTypes.func,
};

export default enhance(ImpactByIndicator);
