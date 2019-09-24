import {initializeBaseObject} from './baseObject';
import {aggregateAttributionIndicators, aggregateWeights} from './aggregators';
import {getStartOfMonthTimestamp} from 'components/utils/date';
import { groupBy } from 'lodash';

const initializeCampaign = () => {
    const baseObject = initializeBaseObject();
    return {
        ...baseObject,
        channels: []
    };
};

function calculateAttributionCampaigns(mapping, dataByUser, getMetricsData, userMonthPlan, calculateAttributionWeights) {
    
    const attributionCampaigns = {};

    dataByUser.forEach(user => {

        user.sessions.forEach(session => {
            if (session.campaign) {

                // Initialize
                if (!attributionCampaigns[session.campaign]) {
                    attributionCampaigns[session.campaign] = initializeCampaign();
                }

                // Web visits
                attributionCampaigns[session.campaign].webVisits += 1;
            }
        });
    });

    Object.keys(mapping).forEach(indicator => {

        const data = getMetricsData(indicator);
        data.forEach(user => {
          calculateIndicatorImpact(calculateAttributionWeights,indicator,user,userMonthPlan,attributionCampaigns)
        });
    });
    return Object.keys(attributionCampaigns).map(campaignName => {
        return {
            name: campaignName,
            ...attributionCampaigns[campaignName]
        };
    });
}

function calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, campaignsImpact ) {
    const relevantSessions = user.filterredSessions[indicator] || [];

    // Weights
    const weights = calculateAttributionWeights(
      relevantSessions,
      indicator
    );
    const aggregatedWeights = aggregateWeights(
      relevantSessions.map(session => session.campaign),
      weights
    );

    relevantSessions.forEach(function(session, index) {
      const channel = session.channel;
      const campaign = session.campaign;
      if (campaign) {
        if(!campaignsImpact[campaign]) {
          campaignsImpact[campaign] = initializeCampaign();
        }
        const { revenueForAccount, accountMRR } = user;

        const aggregatedWeight = aggregatedWeights[campaign];
        delete aggregatedWeights[campaign];

        aggregateAttributionIndicators(
          campaignsImpact[campaign],
          indicator,
          weights,
          index,
          revenueForAccount,
          accountMRR,
          userMonthPlan,
          aggregatedWeight
        );

        if (
          !campaignsImpact[campaign].channels.includes(channel) &&
          channel !== 'direct'
        ) {
          campaignsImpact[campaign].channels.push(channel);
        }

      }
    });
}

function calculateCampaignsImpactByMonth(mapping, getMetricsData, userMonthPlan, calculateAttributionWeights) {
    const campaignsImpactByMonth = {};

    Object.keys(mapping).forEach(indicator => {
      const data = groupBy(getMetricsData(indicator), item =>
        getStartOfMonthTimestamp(new Date(item.funnelStages[indicator]))
      );
      Object.keys(data).forEach(monthKey => {
  
        if (!campaignsImpactByMonth[monthKey]) {
          campaignsImpactByMonth[monthKey] = {}; 
        }
        data[monthKey].forEach(user => {
            calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, campaignsImpactByMonth[monthKey])
        });
      });
    });
    // Return sorted object values
    return Object.keys(campaignsImpactByMonth).sort().map(key => campaignsImpactByMonth[key]);
  }

export {
    calculateAttributionCampaigns,
    calculateCampaignsImpactByMonth,
}