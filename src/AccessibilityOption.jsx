import React from 'react';
import PropTypes from 'prop-types';
import '../style/index.css';
import '../style/accessibilityOption.css';

class CommentAccessibilityOption extends React.Component {
    tt(key) {
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    handleMouseDown (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.props.option.disabled) {
            this.props.onSelect(this.props.option, event);
        }
    }

    handleMouseEnter (event) {
        this.props.onFocus(this.props.option, event);
    }

    handleMouseMove (event) {
        if (this.props.isFocused) return;
        this.props.onFocus(this.props.option, event);
    }

    render() {
        let icon = (
            <div className={`accessibility-option-icon fa fa-${this.props.option.icon}`}/>
        );

        return (
            <div className={this.props.className}
                onMouseDown={this.handleMouseDown.bind(this)}
                onMouseEnter={this.handleMouseEnter.bind(this)}
                onMouseMove={this.handleMouseMove.bind(this)}
                title={this.props.option.title}>
                <div>
                    {icon}
                    <span>{this.props.option.label}</span>
                </div>
                <div>
                    <small>{this.props.option.description}</small>
                </div>
            </div>
        );
    }
}

CommentAccessibilityOption.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isDisabled: PropTypes.bool,
    isFocused: PropTypes.bool,
    isSelected: PropTypes.bool,
    onFocus: PropTypes.func,
    onSelect: PropTypes.func,
    option: PropTypes.object.isRequired
};

export default CommentAccessibilityOption;
