import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';

import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';
import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';

import { compose } from 'components/utils/utils';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const CRMCacheKey = Symbol('CRM');

const enhance = compose(
    inject(
        ({
            attributionStore: { metricsOptions },
            analyze: { overviewStore },
        }) => {
            const { getCrmData } = overviewStore;

            return {
                metricsOptions,
                getCrmData,
            };
        },
    ),
    observer,
    withRouter,
);

class ImpactByCRM extends Component {
    state = {
        groupBy: 'region',
        indicator: 'SQL',
        filters: [],
    };

    onChangeSelect = name => event => {
        if (this.state[name] && event.value) {
            this.setState({
                [name]: event.value,
            });
        }
    };

    onChangeFilters = filters => {
        this.setState({
            filters,
        });
    };

    render() {
        const {
            location,
            metricsOptions,
            getCrmData,
        } = this.props;
        const { filters, groupBy, indicator } = this.state;

        const { data, filterConfigs } = getCrmData({
            filters,
            groupBy,
            indicator,
        });

        return (
            <div className={classes.rows}>
                <GeneratedImpact
                    data={data}
                    title="Impact by custom CRM data"
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
                            onChange={this.onChangeSelect('indicator')}
                            style={{
                                width: '143px',
                                marginLeft: '10px',
                                fontWeight: 500,
                                marginRight: '15px',
                            }}
                        />
                        <div className={classes.selectLabel}>Group by</div>
                        <Select
                            selected={groupBy}
                            select={{
                                options: [
                                    { value: 'product', label: 'Product' },
                                    { value: 'region', label: 'Region' },
                                    {
                                        value: 'external_lead_source',
                                        label: 'CRM Lead Source',
                                    },
                                ],
                            }}
                            onChange={this.onChangeSelect('groupBy')}
                            style={{
                                width: '143px',
                                marginLeft: '10px',
                                fontWeight: 500,
                            }}
                        />
                    </div>
                    <FiltersPanel
                        className={classes.crmFilters}
                        data={[]} // TODO - use real filtered data and dynamic options in filters config
                        filters={filters}
                        setFilters={this.onChangeFilters}
                        filterConfigs={filterConfigs}
                        location={location}
                        cacheKey={CRMCacheKey}
                    />
                </GeneratedImpact>
            </div>
        );
    }
}

ImpactByCRM.defaultProps = {
    // crmData: [],
};

ImpactByCRM.propTypes = {
    // crmData: PropTypes.arrayOf(PropTypes.shape({})),
    groupBy: PropTypes.string,
    indicator: PropTypes.string,
    metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
    onIndicatorChange: PropTypes.func,
};

export default enhance(ImpactByCRM);
