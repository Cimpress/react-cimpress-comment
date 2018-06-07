import '../style/index.css';
import '../style/accessibilityIcon.css';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { Tooltip } from '@cimpress/react-components';

class CommentAccessibilityIcon extends React.Component {
    render() {
        let icon = (
            <FontAwesome
            name={this.props.icon}
            className="accessibility-icon-icon"
            />
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

CommentAccessibilityIcon.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string
};

export default CommentAccessibilityIcon;
