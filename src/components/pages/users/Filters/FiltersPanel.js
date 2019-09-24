import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';
import FilterPopup from 'components/pages/users/Filters/FilterPopup';
import {makeFilter, ConfigPropType, FilterPropType} from 'components/utils/filters';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

const FilterTag = ({ className, label, onRemove }) => (
  <div className={classnames(styles.filterTag, className)}>
    <div className={styles.filterLabel}>{label}</div>
    <button className={styles.filterRemoveButton} onClick={onRemove}/>
  </div>
)

export default class FiltersPanel extends Component {
  static propTypes = {
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    filters: PropTypes.arrayOf(FilterPropType).isRequired,
    setFilters: PropTypes.func.isRequired,
    filterConfigs: PropTypes.arrayOf(ConfigPropType).isRequired,
  }

  style = filterStyles;

  state = {
    showPopup: false,
  }

  addFilter = ({ kind, data }) => {
    const { filters, setFilters, filterConfigs } = this.props
    const filter = makeFilter({ kind, data }, filterConfigs)

    if (!filter || filters.find((f) => f.id === filter.id)) {
      return
    }

    setFilters([...filters, filter])
  }

  handlePopupToggle = () => {
    this.setState(({ showPopup }) => ({
      showPopup: !showPopup,
    }));
  }

  handleFilterRemove = (id) => {
    const { filters, setFilters } = this.props;

    setFilters(filters.filter((f) => f.id !== id))
  }

  handleClear = () => this.props.setFilters([])

  render() {
    const { data, filterConfigs, filters, className } = this.props;
    const { showPopup } = this.state;

    if (filterConfigs.length === 0) {
      return null
    }

    return (
      <div className={classnames(styles.panel, className)}>
        <button className={styles.toggle} onClick={this.handlePopupToggle}>
          <div className={styles.toggleIcon}/>
          Filter
        </button>
        <div className={styles.filterTags}>
          {filters.map((filter) => (
            <FilterTag
              key={filter.id}
              label={filter.label}
              onRemove={() => this.handleFilterRemove(filter.id)}
            />
          ))}
          {filters.length > 1 && (
            <FilterTag
              className={styles.filterClearTag}
              label="Clear all"
              onRemove={this.handleClear}
            />
          )}
        </div>
        {showPopup && (
          <FilterPopup
            opened
            onClose={this.handlePopupToggle}
            data={data}
            currentFilters={filters}
            filterConfigs={filterConfigs}
            onFilterAdd={this.addFilter}
          />
        )}
      </div>
    )
  }
}
