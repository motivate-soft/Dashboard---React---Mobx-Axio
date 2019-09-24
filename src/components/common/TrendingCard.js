import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';

import style from 'styles/analyze/analyze.css';

export default class TrendingCard extends Component {
    static propTypes = {
        // main content props
        header: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        // styling props
        className: PropTypes.string,
        containerClassName: PropTypes.string,
        // other props
        iconUrl: PropTypes.string,
        iconText: PropTypes.string
    }

    static defaultProps = {
        backgroundIconUrl: '/assets/channels-icons/growth-trending.svg',
        iconUrl: '/assets/channels-icons/seo-icon.svg',
        upIconUrl: '/assets/channels-icons/arrow-up-icon.png',
        arrowRightIconUrl: '/assets/channels-icons/right-arrow-icon.svg',
      };

    style = style;

    render() {
        const {
            header,
            title,
            mql,
            type,
            backgroundIconUrl,
            iconUrl,
            upIconUrl,
            arrowRightIconUrl,
            previousValue,
            currentValue,
            dateRange,
            className,
            containerClassName
          } = this.props;

        return (
            <div className={classnames(this.classes.container, containerClassName)}>    
                <div className={classnames(this.classes.cardItem, className)} style={{backgroundImage: `url(${backgroundIconUrl})`}}>
                    <div className={this.classes.cardHeader} style={{paddingBottom: `30px`}}>{header}</div>
                    <div className={this.classes.cardIcon} style={{backgroundImage: `url(${iconUrl})`}}></div>
                    <div className={this.classes.cardTitle}>{title}</div>
                    <div className={this.classes.cardMqls} style={{paddingBottom: `41px`}}>
                        <div className={this.classes.cardArrowUpIcon} style={{backgroundImage: `url(${upIconUrl})`}}></div>
                        <div style={{color: `#2fcf5f`, display: `inline`}}>{mql} </div>
                        <div className={this.classes.type}>{type}</div>
                    </div>
                    <div className={this.classes.cardArrowContent} style={{width: `77px`}}>
                        <div className={this.classes.cardArrowUpIconText} style={{color:`#222a41`}}>{previousValue} </div>
                        <div className={this.classes.cardArrowRightIcon} style={{backgroundImage: `url(${arrowRightIconUrl})`}}>  </div>
                        <div className={this.classes.cardArrowUpIconText}>{currentValue}</div>
                    </div>
                    <div className={this.classes.compared}>MQLs compared to {dateRange}</div>
                </div>
                
            </div>
          );
    }
}