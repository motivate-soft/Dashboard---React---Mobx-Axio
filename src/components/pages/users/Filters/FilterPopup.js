import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import memoize from 'memoize-one';
import Component from 'components/Component';
import Popup from 'components/Popup';
import ChannelsFilter from 'components/pages/users/Filters/ChannelsFilter';
import FunnelStagesFilter from 'components/pages/users/Filters/FunnelStagesFilter';
import CampaignsFilter from 'components/pages/users/Filters/CampaignsFilter';
import MultiFieldFilter from 'components/pages/users/Filters/MultiFieldFilter';
import ContentFilter from 'components/pages/users/Filters/ContentFilter';
import FormsFilter from 'components/pages/users/Filters/FormsFilter';
import MarketingVsSalesFilter from 'components/pages/users/Filters/MarketingVsSalesFilter';
import ProductFilter from 'components/pages/users/Filters/ProductFilter';
import RegionFilter from 'components/pages/users/Filters/RegionFilter';
import { filterKinds, ConfigPropType, FilterPropType } from 'components/utils/filters';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

const filtersUIConfig = {
  [filterKinds.CHANNELS]: {
    title: 'Channels',
    component: ChannelsFilter,
  },
  [filterKinds.FUNNEL_STAGES]: {
    title: 'Funnel stages',
    component: FunnelStagesFilter,
  },
  [filterKinds.CAMPAIGNS]: {
    title: 'Campaigns',
    component: CampaignsFilter,
  },
  [filterKinds.CONTENT]: {
    title: 'Content',
    component: ContentFilter,
  },
  [filterKinds.FORMS]: {
    title: 'Forms',
    component: FormsFilter,
  },
  [filterKinds.CUSTOM_FIELDS]: {
    title: 'Custom Fields',
    component: MultiFieldFilter,
  },
  [filterKinds.CRMSource]: {
    title: 'CRM Sources',
    component: MultiFieldFilter,
  },
  [filterKinds.MARKETING_VS_SALES]: {
    title: 'Marketing vs Sales',
    component: MarketingVsSalesFilter,
  },
  [filterKinds.PRODUCT]: {
    title: 'Product',
    component: ProductFilter,
  },
  [filterKinds.REGION]: {
    title: 'Region',
    component: RegionFilter,
  },
}

export default class FilterPopup extends Component {
  static propTypes = {
    className: PropTypes.string,
    opened: PropTypes.bool,
    onClose: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onFilterAdd: PropTypes.func.isRequired,
    filterConfigs: PropTypes.arrayOf(ConfigPropType).isRequired,
    currentFilters: PropTypes.arrayOf(FilterPropType),
  }

  state = {
    activeFilterKind: this.props.filterConfigs[0].kind,
  }

  handleActiveFilterClick = (e) => {
    this.setState({
      activeFilterKind: e.target.dataset.key,
    })
  }

  handleAddFilter = (filter) => {
    this.props.onFilterAdd(filter)
    this.props.onClose()
  }

  getConfig = memoize(
    (activeFilterKind, filterConfigs, data) => {
      const config = filterConfigs.find((config) => config.kind === activeFilterKind);

      if (!config) {
        return null;
      }

      return {
        ...config,
         // temporal workaround for ImpactByCRM filters
         // Actually all filters should use dynamic getOptions instead of static options
        options: config.getOptions ? config.getOptions(data) : config.options,
      };
    }
  );

  render() {
    const { className, opened, onClose, data, filterConfigs } = this.props;
    const { activeFilterKind } = this.state;
    const activeFilterConfig = this.getConfig(activeFilterKind, filterConfigs, data);
    const Filter = filtersUIConfig[activeFilterKind].component;

    return (
      <Popup
        className={classnames(styles.popup, className)}
        hidden={!opened}
        onClose={onClose}
      >
        <ul className={styles.nav}>
          {filterConfigs.map(({ kind }) => filtersUIConfig[kind] && (
            <li
              key={kind}
              data-key={kind}
              className={classnames(styles.navItem, (kind === activeFilterKind) && styles.activeNavItem)}
              onClick={this.handleActiveFilterClick}
            >
              {filtersUIConfig[kind].title}
            </li>
          ))}
        </ul>
        {activeFilterConfig && (
          <Filter
            key={activeFilterKind}
            config={activeFilterConfig}
            onCancel={onClose}
            onAddFilter={this.handleAddFilter}
          />
        )}
        <button className={styles.popupClose} onClick={onClose}/>
      </Popup>
    )
  }
}
