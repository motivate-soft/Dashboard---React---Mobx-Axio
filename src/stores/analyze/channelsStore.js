import {decorate, computed} from 'mobx';
import { persist } from 'mobx-persist';
import {channelsPageConfig} from 'components/utils/filters/configs';
import {makeChannelBeforeStageFilter} from 'components/utils/filters/make';
import {calculateChannelsImpact, calculateChannelsImpactByMonth} from 'attribution/channelsImpact';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';
import hydrate from 'stores/hydrate';

const filtersStore = persist(FiltersStore.persistSchema)(new FiltersStore(channelsPageConfig));

hydrate('channelFilters', filtersStore)

class ChannelsStore {
  constructor() {
    this.filtersStore = filtersStore;
  }

  get channelsImpact() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateChannelsImpact(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  get channelsImpactByMonth() {
    const {getMetricsDataFiltered, calculateAttributionWeights} = filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateChannelsImpactByMonth(
      groupByMapping,
      getMetricsDataFiltered,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  get filtersData() {
    return filtersStore.filtersData
  }

  navigateToJourneys = (funnelStage, channelKey) => {
    journeysStore.navigateWithFilters(
      funnelStage,
      [makeChannelBeforeStageFilter(channelKey, funnelStage), ...filtersStore.rawFilters]
    );
  };
}

decorate(ChannelsStore, {
  channelsImpact: computed,
  channelsImpactByMonth: computed,
  filtersData: computed,
});

export default new ChannelsStore();
