import '../../style/index.css';
import '../../style/visibilityIcon.css';
import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from '@cimpress/react-components';

class CommentVisibilityIcon extends React.Component {
    render() {
        let icon = (
            <div className={`visibility-icon-icon fa fa-${this.props.icon}`}/>
        );

        return (
            <Tooltip
                direction="top"
                contents={this.props.label}>
                {icon}
            </Tooltip>
        );
    }
}

CommentVisibilityIcon.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
};

export default CommentVisibilityIcon;
