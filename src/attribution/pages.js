import {initializeBaseObject} from './baseObject';
import {aggregateAttributionIndicators, aggregateWeights} from './aggregators';
import {getStartOfMonthTimestamp} from 'components/utils/date';
import {union, isNil, groupBy} from 'lodash';
import moment from 'moment';

const initializePage = (contentChannel, title) => {
  const baseObject = initializeBaseObject();
  return {
    ...baseObject,
    title: title,
    totalRead: 0,
    total: 0,
    proceed: 0,
    channel: contentChannel
  };
};

function calculateAttributionPages(mapping, dataByUser, getMetricsData, userMonthPlan, calculateAttributionWeights, key = 'path') {
  const pages = {};
  dataByUser.forEach(user => {

    const userPages = union(...user.sessions
      .map(session => session.pages.filter(page => !isNil(page.contentChannel))));

    userPages.forEach((page, index) => {

      const pageKey = page[key];

      // Initialize
      if (!pages[pageKey]) {
        pages[pageKey] = initializePage(page.contentChannel, page.title);
      }

      // Web visits
      pages[pageKey].webVisits++;

      // is last?
      if (index !== userPages.length - 1) {

        const readTime = moment.duration(moment(page.endTime).diff(page.startTime)).asSeconds();
        if (readTime && readTime >= 90) {
          pages[pageKey].totalRead++;
        }

        pages[pageKey].total++;
        pages[pageKey].proceed++;
      }
    });
  });

  Object.keys(mapping).forEach(indicator => {

    const data = getMetricsData(indicator);
    data.forEach(user => {
      calculateIndicatorImpact(calculateAttributionWeights,indicator,user,userMonthPlan,pages)
    });
  });
  return Object.keys(pages).map(function (page) {
    return {
      ...pages[page],
      page: page
    };
  });
}

function calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, pagesImpact, key = 'path') {
  const userPagesForFunnel = union(
    ...(user.filterredSessions[indicator] || []).map(session =>
      session.pages.filter(page => !isNil(page.contentChannel))
    )
  );

  // Weights
  const weights = calculateAttributionWeights(userPagesForFunnel, indicator);
  const aggregatedWeights = aggregateWeights(
    userPagesForFunnel.map(page => page[key]),
    weights
  );

  userPagesForFunnel.forEach((page, index) => {
    const pageKey = page[key];
    if (!pagesImpact[pageKey]) {
      pagesImpact[pageKey] = initializePage(page.contentChannel, page.title);
    }
    const { revenueForAccount, accountMRR } = user;

    const aggregatedWeight = aggregatedWeights[pageKey];
    delete aggregatedWeights[pageKey];

    aggregateAttributionIndicators(
      pagesImpact[pageKey],
      indicator,
      weights,
      index,
      revenueForAccount,
      accountMRR,
      userMonthPlan,
      aggregatedWeight
    );
  });
}

function calculatePagesImpactByMonth(mapping, getMetricsData, userMonthPlan, calculateAttributionWeights, key = 'path') {
  const pagesImpactByMonth = {};

  Object.keys(mapping).forEach(indicator => {
    const data = groupBy(getMetricsData(indicator), item =>
      getStartOfMonthTimestamp(new Date(item.funnelStages[indicator]))
    );

    Object.keys(data).forEach(monthKey => {

      if (!pagesImpactByMonth[monthKey]) {
        pagesImpactByMonth[monthKey] = {};
      }

      data[monthKey].forEach(user => {
        calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, pagesImpactByMonth[monthKey], key);
      });

    });

  });

  // Return sorted object values
  return Object.keys(pagesImpactByMonth).sort().map(key => pagesImpactByMonth[key]);
}

export {
  calculateAttributionPages,
  calculatePagesImpactByMonth
};