import {decorate, computed} from 'mobx';
import { persist } from 'mobx-persist';
import {campaignsPageConfig} from 'components/utils/filters/configs';
import {makeCampaignBeforeStageFilter} from 'components/utils/filters/make';
import {calculateAttributionCampaigns, calculateCampaignsImpactByMonth} from 'attribution/campaigns';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';
import hydrate from 'stores/hydrate';

const filtersStore = persist(FiltersStore.persistSchema)(new FiltersStore(campaignsPageConfig));

hydrate('campaignsFilters', filtersStore)

class CampaignsStore {
  constructor() {
    this.filtersStore = filtersStore;
  }

  get campaigns() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateAttributionCampaigns(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  get filtersData() {
    return filtersStore.filtersData
  }  
  
  get campaignsImpactByMonths(){
    const {getMetricsDataFiltered, calculateAttributionWeights} = this.filtersStore;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;
    return calculateCampaignsImpactByMonth(
      groupByMapping,
      getMetricsDataFiltered,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  navigateToJourneys = (funnelStage, campaignName) => {
    journeysStore.navigateWithFilters(
      funnelStage,
      [makeCampaignBeforeStageFilter(campaignName, funnelStage), ...filtersStore.rawFilters]
    );
  }
}

decorate(CampaignsStore, {
  campaigns: computed,
  filtersData: computed,
});

export default new CampaignsStore();
