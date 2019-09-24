import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';

import style from 'styles/analyze/analyze.css';

export default class TwitterPaidCard extends Component {
    static propTypes = {
        // main content props
        title: PropTypes.string.isRequired,
        
        // styling props
        className: PropTypes.string,
        containerClassName: PropTypes.string,
        // other props
        iconUrl: PropTypes.string,
        iconText: PropTypes.string
    }

    static defaultProps = {
        backgroundIconUrl: '/assets/channels-icons/efficiency.svg',
        iconUrl: '/assets/channels-icons/twitter-icon.svg',
        downIconUrl: '/assets/channels-icons/arrow-down-icon.png'
      };

    style = style;

    render() {
        const {
            header,
            title,
            stat,
            suffix,
            backgroundIconUrl,
            iconUrl,
            downIconUrl,
            iconText,
            prefixcontent,
            content,
            suffixcontent,
            className,
            containerClassName
          } = this.props;

        return (
            <div className={classnames(this.classes.container, containerClassName)}>    
                <div className={classnames(this.classes.cardItem, className)} style={{backgroundImage: `url(${backgroundIconUrl})`}}>
                    <div className={this.classes.cardHeader}>{header}</div>
                    <div className={this.classes.cardIcon} style={{backgroundImage: `url(${iconUrl})`}}></div>
                    <div className={this.classes.cardTitle}>{title}</div>
                    <div className={this.classes.cardMqls}>{stat} <div className={this.classes.suffix}>{suffix}</div></div>
                    <div className={this.classes.cardArrowContent}>
                        <div className={this.classes.cardArrowUpIcon} style={{backgroundImage: `url(${downIconUrl})`}}>  </div>
                        <div className={this.classes.cardArrowUpIconText}>{iconText}</div>
                    </div>
                    <div className={this.classes.compared}>{prefixcontent} <div className={this.classes.content}>{content}</div> {suffixcontent}</div>
                </div>
                
            </div>
          );
    }
}