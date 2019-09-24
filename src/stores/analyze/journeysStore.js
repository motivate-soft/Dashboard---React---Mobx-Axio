import {decorate, observable, action, computed} from 'mobx';
import { persist } from 'mobx-persist';
import history from 'history';
import {GROUP_BY, LABELS, SINGULAR_LABELS} from 'components/utils/users';
import {usersPageConfig} from 'components/utils/filters/configs';
import {makeFunnelStagesFilter} from 'components/utils/filters/make';
import {VARIANTS, makeFilters} from 'components/utils/filters';
import attributionStore from 'stores/attributionStore';
import FiltersStore from 'stores/filtersStore';
import hydrate from 'stores/hydrate';

const filtersStore = persist(FiltersStore.persistSchema)(new FiltersStore(usersPageConfig));

hydrate('journeysFilters', filtersStore)

class JourneysStore {
  constructor() {
    this.filtersStore = filtersStore
    this.groupBy = GROUP_BY.USERS;
  }

  setGroupBy(groupBy) {
    this.groupBy = groupBy;
  }

  get users() {
    const {usersByEmail, usersByAccount} = filtersStore;

    return this.groupBy === GROUP_BY.USERS ? usersByEmail : usersByAccount;
  }

  get statsLabel() {
    return this.groupBy === GROUP_BY.USERS
      ? {
        plural: LABELS.USERS,
        singular: SINGULAR_LABELS.USERS
      }
      : {
        plural: LABELS.ACCOUNTS,
        singular: SINGULAR_LABELS.ACCOUNTS
      };
  }

  get filtersData() {
    return {
      ...filtersStore.filtersData,
      data: this.users,
    }
  }

  navigateWithFilters(funnelStage, filters) {
    const {setFilters, filterConfigs} = filtersStore;
    const {groupByMapping} = attributionStore.data.attribution;

    setFilters(makeFilters(
      [makeFunnelStagesFilter(VARIANTS.BECAME_ONE_OF, [funnelStage]), ...filters],
      filterConfigs
    ));
    this.setGroupBy(groupByMapping[funnelStage] === 'companies' ? GROUP_BY.ACCOUNT : GROUP_BY.USERS)

    history.push({ pathname: '/analyze/journeys' });
  }
}

decorate(JourneysStore, {
  users: computed,
  statsLabel: computed,
  filtersData: computed,
  groupBy: observable,
  setGroupBy: action.bound,
  navigateWithFilters: action.bound,
});

const schema = {
  groupBy: true,
}

const store = persist(schema)(new JourneysStore());

hydrate('journeysStore', store);

export default store;
