import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';

import style from 'styles/analyze/analyze.css';

export default class TopContributerCard extends Component {
    static propTypes = {
        // main content props
        header: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        className: PropTypes.string,
        containerClassName: PropTypes.string,
        // other props
        iconUrl: PropTypes.string,
        iconText: PropTypes.string
    }

    static defaultProps = {
        backgroundIconUrl: '/assets/channels-icons/trophy.svg',
        iconUrl: '/assets/channels-icons/webinar-icon.svg',
        upIconUrl: '/assets/channels-icons/arrow-up-icon.png'
    };

    style = style;

    render() {
        const {
            header,
            title,
            mqls,
            type,
            backgroundIconUrl,
            iconUrl,
            upIconUrl,
            changePercent,
            comparedValue,
            dateRange,
            className,
            containerClassName
          } = this.props;

        return (
            <div className={classnames(this.classes.container, containerClassName)}>    
                <div className={classnames(this.classes.cardItem, className)} style={{backgroundImage: `url(${backgroundIconUrl})`}}>
                    <div className={this.classes.cardHeader}>{header}</div>
                    <div className={this.classes.cardIcon} style={{backgroundImage: `url(${iconUrl})`}}></div>
                    <div className={this.classes.cardTitle}>{title}</div>
                    <div className={this.classes.cardMqls}>{mqls} <div className={this.classes.type}>{type}</div></div>
                    <div>
                        <div className={this.classes.cardArrowUpIcon} style={{backgroundImage: `url(${upIconUrl})`}}>  </div>
                        <div className={this.classes.cardArrowUpIconText}>{changePercent}</div>
                    </div>
                    <div className={this.classes.compared}>Compared to <div className={this.classes.comparedValue}>{comparedValue} MQLs</div> in {dateRange}</div>
                    <div className={this.classes.showMeBtn}>Show Me</div>
                </div>
                
            </div>
          );
    }
}