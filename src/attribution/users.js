import {flatten, uniq, merge} from 'lodash';
import {getNickname} from 'components/utils/indicators';
import {getFormName, getMarketingVsSalesTitle} from 'components/utils/users';

const stagesOrder = {
  blogSubscribers: 0,
  MCL: 1,
  MQL: 2,
  SQL: 3,
  opps: 4,
  users: 5
};

const mode = (array) => {
  if (array.length === 0) {
    return null;
  }

  let maxEl = array[0];
  let maxCount = 1;

  array.reduce((res, el) => {
    res[el] = res[el] ? res[el] + 1 : 1;

    if (res[el] > maxCount) {
      maxEl = el;
      maxCount = res[el];
    }

    return res;
  }, {});

  return maxEl;
};

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + ' years ago';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + ' months ago';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + ' days ago';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + ' hours ago';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};

export const formatUsers = (usersData, startDateTS, endDateTS, numberOfCustomFields) =>
  usersData.map((user) => {
    // const getLastOrEmpty = field => user.sessions.reverse().map(item => item[field]).find(item => !!item);
    const getUniqNotEmpty = field => uniq(user.sessions.map(item => item[field]).filter(item => !!item));
    const getUniqAsString = field => uniq(user.sessions.map(item => String(item[field])));
    const firstTouchPoint = new Date(user.sessions[0].startTime);
    const lastTouchPoint = new Date(user.sessions[user.sessions.length - 1].endTime);
    const timeSinceFirst = timeSince(firstTouchPoint);
    const timeSinceLast = timeSince(lastTouchPoint);
    const uniqChannels = uniq(user.sessions.map(item => item.channel));
    const uniqCampaigns = uniq(user.sessions.map(item => item.campaign)).filter((c) => !!c);
    const emails = getUniqNotEmpty('email');
    const domain = mode(user.sessions.map(item => {
      const domain = item.email && item.email.match('@(.+\.[a-z]+)');
      return domain && domain[1];
    }));
    const devices = getUniqNotEmpty('device');
    const countries = getUniqNotEmpty('country');
    const displayName = user.accountName
      ? user.accountName
      : domain && domain.match('[^.]+(?=\\.)') && domain.match('[^.]+(?=\\.)')[0];
    const domainIcon = domain ? 'https://logo.clearbit.com/' + domain : undefined;
    const maxFunnelStageIndex = Math.max(...Object.keys(user.funnelStages).map(stage => stagesOrder[stage]));
    const funnelStage = Object.keys(stagesOrder)[maxFunnelStageIndex];
    const stageNickname = getNickname(funnelStage, true);

    // Filters needs an object, while the popup needs the array. data is the same
    const customFields = {};
    const uniqCustoms = [];
    for (let i = 1; i <= numberOfCustomFields; i++) {
      const dataKey = `custom${i}`;
      const fieldName = `uniqCustom${i}`;
      const value = getUniqAsString(dataKey);
      uniqCustoms.push(value);
      customFields[fieldName] = value;
    }

    const externalLeadSource = getUniqNotEmpty('external_lead_source');
    const externalLeadSourceData1 = getUniqNotEmpty('external_lead_source_data1');
    const externalLeadSourceData2 = getUniqNotEmpty('external_lead_source_data2');
    const platforms = getUniqNotEmpty('crm_platform');
    const isOpp = getUniqNotEmpty('is_opp');
    const region = getUniqNotEmpty('region');
    const product = getUniqNotEmpty('product');
    const emailToLinkProps = merge({}, ...user.sessions.map(item => ({
      [item.email]: {
        externalId: item.external_id,
        email: item.email,
        isOpp: item.is_opp,
        platform: item.crm_platform
      }
    })));
    const formNames = (user.forms || []).map(getFormName);
    const marketingVsSales = getMarketingVsSalesTitle(user);

    const getUniqContent = (pages) => uniq(pages.map((page) => page.title));
    const getUniqContentPath = (pages) => uniq(pages.map((page) => page.path));
    const getUniqContentChannel = (pages) => uniq(pages.map((page) => page.contentChannel));

    const pages = flatten(getUniqNotEmpty('pages'));
    const uniqContent = getUniqContent(pages);
    const uniqContentPath = getUniqContentPath(pages);
    const uniqContentTypes = getUniqContentChannel(pages);
    const funnelStagesInDateRange =
      Object.keys(user.funnelStages).filter((key) => {
        const funnelStageDate = new Date(user.funnelStages[key]).getTime();

        return funnelStageDate >= startDateTS && funnelStageDate <= endDateTS;
      });
    const channelBeforeStages =
      user.sessions
        .filter(({startTime}) => {
          const startDate = new Date(startTime).getTime();

          return startDate >= startDateTS && startDate <= endDateTS;
        })
        .map(({channel, pages, campaign, startTime}) => {
          const notReachedFunnelStages = [];
          const startDate = new Date(startTime);

          Object.keys(user.funnelStages).forEach((key) => {
            if (funnelStagesInDateRange.includes(key) && new Date(user.funnelStages[key]) >= startDate) {
              notReachedFunnelStages.push(key);
            }
          });

          return {
            channel,
            campaign,
            contentType: getUniqContentChannel(pages),
            content: getUniqContentPath(pages),
            funnelStages: notReachedFunnelStages
          };
        });

    return {
      ...user,
      devices,
      countries,
      timeSinceFirst,
      timeSinceLast,
      firstTouchPoint,
      lastTouchPoint,
      emails,
      displayName,
      domainIcon,
      uniqChannels,
      uniqCampaigns,
      funnelStage,
      stageNickname,
      ...customFields,
      uniqCustoms,
      externalLeadSource,
      externalLeadSourceData1,
      externalLeadSourceData2,
      platforms,
      isOpp,
      emailToLinkProps,
      uniqContent,
      uniqContentPath,
      uniqContentTypes,
      channelBeforeStages,
      funnelStagesInDateRange,
      formNames,
      marketingVsSales,
      region,
      product
    };
  });


function getUniqAsString(field, path) {
  return path.reduce((acc, item) => {
    const value = item[field];
    if (!acc.includes(String(value))) {
      acc.push(String(value));
    }

    return acc;
  }, []);
}

// Get the most frequently item in array
export function getFrequently(arr) {
  if (!arr.length) {
    return null;
  }
  const modeMap = {};
  let maxEl = arr[0],
    maxCount = 1;

  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (modeMap[el] == null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }

    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}

export const formatUsersReworked = (
  usersData,
  startDateTS,
  endDateTS,
  numberOfCustomFields,
) =>
  usersData.map(user => {
    const firstTouchPoint = new Date(user.sessions[0].startTime);
    const lastTouchPoint = new Date(
      user.sessions[user.sessions.length - 1].endTime,
    );
    const timeSinceFirst = timeSince(firstTouchPoint);
    const timeSinceLast = timeSince(lastTouchPoint);

    const fields = [
      ['channel', 'uniqChannels'],
      ['campaign', 'uniqCampaigns'],
      ['email', 'emails'],
      ['device', 'devices'],
      ['country', 'countries'],
      ['external_lead_source', 'externalLeadSource'],
      ['external_lead_source_data1', 'externalLeadSourceData1'],
      ['external_lead_source_data2', 'externalLeadSourceData2'],
      ['crm_platform', 'platforms'],
      ['is_opp', 'isOpp'],
      'region',
      'product',
      'pages',
    ];
    const uniqFields = user.sessions.reduce((acc, session) => {
      fields.forEach(field => {
        let path;
        let name;
        path = name = field;
        if (Array.isArray(field)) {
          [path, name] = field;
        }
        const value = session[path];

        if (!acc[name]) {
          acc[name] = [];
        }

        if (value && !acc[name].includes(value)) {
          acc[name].push(value);
        }
      });

      const {
        email,
        external_id: externalId,
        is_opp: isOpp,
        crm_platform: platform,
      } = session;

      if (!acc.emailToLinkProps) {
        acc.emailToLinkProps = {};
      }
      acc.emailToLinkProps[email] = {
        externalId,
        email,
        isOpp,
        platform,
      };

      return acc;
    }, {});
    const pages = flatten(uniqFields.pages);

    const domains = user.sessions.map(item => {
      if (!item.email) {
        return null;
      }
      return item.email.split('@')[1];
    });

    const domain = getFrequently(domains);
    const displayName = user.accountName || (domain || '').split('.')[0];

    const domainIcon = domain
      ? `https://logo.clearbit.com/${domain}`
      : null;

    const maxFunnelStageIndex = Math.max(
      ...Object.keys(user.funnelStages).map(stage => stagesOrder[stage]),
    );
    const funnelStage = Object.keys(stagesOrder)[maxFunnelStageIndex];
    const stageNickname = getNickname(funnelStage, true);

    // Filters needs an object, while the popup needs the array. data is the same

    const customFields = {};
    const uniqCustoms = [];
    for (let i = 1; i <= numberOfCustomFields; i++) {
      const dataKey = `custom${i}`;
      const fieldName = `uniqCustom${i}`;
      const value = getUniqAsString(dataKey, user.sessions);
      uniqCustoms.push(value);
      customFields[fieldName] = value;
    }

    const formNames = (user.forms || []).map(getFormName);
    const marketingVsSales = getMarketingVsSalesTitle(user);

    const pagesContent = pages.reduce(
      (acc, curr) => {
        const fields = [
          ['title', 'uniqContent'],
          ['path', 'uniqContentPath'],
          ['contentChannel', 'uniqContentTypes'],
        ];
        fields.forEach(([path, name]) => {
          const value = curr[path];

          if (value && !acc[name].includes(value)) {
            acc[name].push(value);
          }
        });
        return acc;
      },
      {
        uniqContent: [],
        uniqContentPath: [],
        uniqContentTypes: [],
      },
    );

    const funnelStagesInDateRange = Object.keys(user.funnelStages).filter(
      key => {
        const funnelStageDate = new Date(
          user.funnelStages[key],
        ).getTime();

        return (
          funnelStageDate >= startDateTS &&
          funnelStageDate <= endDateTS
        );
      },
    );
    const channelBeforeStages = user.sessions
      .filter(({ startTime }) => {
        const startDate = new Date(startTime).getTime();

        return startDate >= startDateTS && startDate <= endDateTS;
      })
      .map(({ channel, pages, campaign, startTime }) => {
        const notReachedFunnelStages = [];
        const startDate = new Date(startTime);

        Object.keys(user.funnelStages).forEach(key => {
          if (
            funnelStagesInDateRange.includes(key) &&
            new Date(user.funnelStages[key]) >= startDate
          ) {
            notReachedFunnelStages.push(key);
          }
        });

        return {
          channel,
          campaign,
          contentType: pagesContent.uniqContentTypes,
          content: pagesContent.uniqContentPath,
          funnelStages: notReachedFunnelStages,
        };
      });

    // Seems this way to merge object can be
    // A little bit faster than Object.assign
    // And really faster than {...}
    user.channelBeforeStages = channelBeforeStages;
    user.countries = uniqFields.countries;
    user.devices = uniqFields.devices;
    user.displayName = displayName;
    user.domainIcon = domainIcon ? domainIcon : undefined;
    user.emails = uniqFields.emails;
    user.emailToLinkProps = uniqFields.emailToLinkProps;
    user.externalLeadSource = uniqFields.externalLeadSource;
    user.externalLeadSourceData1 = uniqFields.externalLeadSourceData1;
    user.externalLeadSourceData2 = uniqFields.externalLeadSourceData2;
    user.firstTouchPoint = firstTouchPoint;
    user.formNames = formNames;
    user.funnelStage = funnelStage;
    user.funnelStagesInDateRange = funnelStagesInDateRange;
    user.isOpp = uniqFields.isOpp;
    user.lastTouchPoint = lastTouchPoint;
    user.marketingVsSales = marketingVsSales;
    user.platforms = uniqFields.platforms;
    user.product = uniqFields.product;
    user.region = uniqFields.region;
    user.stageNickname = stageNickname;
    user.timeSinceFirst = timeSinceFirst;
    user.timeSinceLast = timeSinceLast;
    user.uniqCampaigns = uniqFields.uniqCampaigns;
    user.uniqChannels = uniqFields.uniqChannels;
    user.uniqContent = pagesContent.uniqContent;
    user.uniqContentPath = pagesContent.uniqContentPath;
    user.uniqContentTypes = pagesContent.uniqContentTypes;
    user.uniqCustoms = uniqCustoms;

    Object.keys(customFields).forEach(key => {
      user[key] = customFields[key];
    });

    return user;
  });
