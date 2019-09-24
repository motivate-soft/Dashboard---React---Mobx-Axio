import {decorate, computed, observable, action} from 'mobx';
import { persist } from 'mobx-persist';
import {contentPageConfig} from 'components/utils/filters/configs';
import {
  makeContentChannelBeforeStageFilter,
  makeContentBeforeStageFilter
} from 'components/utils/filters/make';
import {calculateAttributionPages, calculatePagesImpactByMonth} from 'attribution/pages';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';
import hydrate from 'stores/hydrate';

const filtersStore = persist(FiltersStore.persistSchema)(new FiltersStore(contentPageConfig));

hydrate('contentFilters', filtersStore)

class ContentStore {
  constructor() {
    this.isContentPages = true;
    this.filtersStore = filtersStore;
  }

  setIsContentPages(isContentPages) {
    this.isContentPages = isContentPages;
  }

  get pages() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateAttributionPages(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights,
      this.isContentPages ? undefined : 'contentChannel'
    );
  }

  get filtersData() {
    return filtersStore.filtersData;
  } 

  get pagesImpactByMonth() {
    const {getMetricsDataFiltered, calculateAttributionWeights} = this.filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculatePagesImpactByMonth(
      groupByMapping,
      getMetricsDataFiltered,
      userMonthPlan,
      calculateAttributionWeights,
      this.isContentPages ? undefined : 'contentChannel'
    );
  }

  get filtersData() {
    return filtersStore.filtersData
  }
  
  navigateToJourneys = (funnelStage, page) => {
    const makeFilterFunc = this.isContentPages
      ? makeContentBeforeStageFilter
      : makeContentChannelBeforeStageFilter;

    journeysStore.navigateWithFilters(
      funnelStage,
      [makeFilterFunc(page, funnelStage), ...filtersStore.rawFilters]
    );
  }
}

decorate(ContentStore, {
  filtersData: computed,
  pages: computed,
  isContentPages: observable,
  setIsContentPages: action.bound,
});

const schema = {
  isContentPages: true,
}

const store = persist(schema)(new ContentStore());

hydrate('contentStore', store);

export default store;
