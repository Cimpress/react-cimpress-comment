import '../../style/index.css';
import '../../style/icon.css';
import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from '@cimpress/react-components';

import refererUtils from '../tools/refererUtils';

import url from 'url';

class CommentRefererIcon extends React.Component {
    render() {
        let {referer} = this.props;
        if (!referer || !refererUtils.isCimpressDomain(referer)) {
            return null;
        }

        let originatesHere = url.parse(window.location.href).host === url.parse(referer).host;
        let iconClass = originatesHere ? 'home' : 'map-marker';
        let label = originatesHere ?
            (<span>Comment created in this UI</span>) :
            (<span>
                Comment created at:<br/>
                <a>{refererUtils.makeIntoLabel(referer)}</a><br/>
                Click the icon to follow the link.
            </span>);

        let icon = (
            <div className={`comment-header-icon fa fa-${iconClass}`}/>
        );

        return (
            <a href={referer} target="_blank" rel="noopener noreferrer">
                <Tooltip
                    direction="top"
                    contents={label}
                    tooltipStyle={{minWidth: '100em'}}>
                    {icon}
                </Tooltip>
            </a>
        );
    }
}

CommentRefererIcon.propTypes = {
    referer: PropTypes.string,
};

export default CommentRefererIcon;
