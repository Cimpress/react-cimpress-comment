import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import CommentVisibilityOption from './CommentVisibilityOption';

import {getVisibilityLevels} from '../tools/visibility';
import {Mention, MentionsInput} from 'react-mentions';
import {Alert, Select} from '@cimpress/react-components';

import CustomizrClient from '../clients/CustomizrClient';

import {getI18nInstance} from '../tools/i18n';
import {translate, Trans} from 'react-i18next';
import {getSubFromJWT} from '../tools/helper';

class AddNewCommentForm extends React.Component {
    constructor(props) {
        super(props);

        this.customizrClient = new CustomizrClient(props.accessToken);
        this.jwtSub = getSubFromJWT(this.props.accessToken);

        this.state = {
            commentToAdd: props.initialValue || '',
            alertDismissed: true,
            commentVisibilityLevels: getVisibilityLevels(this.tt.bind(this)),
            selectedVisibilityOption: null,
            userAccessLevel: null,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        this.init();
        this.resetSelectedVisibilityOption();
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    init() {
        // Get the settings (it won't make a network call as the data is cached!
        this.customizrClient.fetchSettings()
            .then((json) => {
                let newAlertDismissed = json.mentionsUsageNotification && json.mentionsUsageNotification.alertDismissed === true;
                let newSelectedVisibilityOption = this.state.commentVisibilityLevels.find((l) => l.value === json.selectedVisibility);
                // Only update the state if there is change
                if (this.state.alertDismissed !== newAlertDismissed || this.state.selectedVisibilityOption !== newSelectedVisibilityOption) {
                    this.safeSetState({
                        alertDismissed: newAlertDismissed,
                        selectedVisibilityOption: newSelectedVisibilityOption,
                    }, () => {
                        this.resetSelectedVisibilityOption();
                    });
                }
            });

        // Creating these clients is inexpensive and do not clear caching
        this.customizrClient = new CustomizrClient(this.props.accessToken);
    }

    resetSelectedVisibilityOption() {
        let newCommentVisibilityLevels = getVisibilityLevels(this.tt.bind(this), this.state.userAccessLevel);
        let narrowestAvailableVisibilityOptionIndex = newCommentVisibilityLevels.every((l) => !l.disabled) ?
            newCommentVisibilityLevels.length - 1 :
            newCommentVisibilityLevels.findIndex((l) => l.disabled) - 1;

        let preferredVisibilityOptionIndex = this.state.selectedVisibilityOption ?
            newCommentVisibilityLevels.findIndex((l) => l.value === this.state.selectedVisibilityOption.value) :
            newCommentVisibilityLevels.length - 1;

        let selectedVisibilityOptionIndex = Math.min(narrowestAvailableVisibilityOptionIndex, preferredVisibilityOptionIndex);

        if (this.state.commentVisibilityLevels !== newCommentVisibilityLevels ||
            this.state.selectedVisibilityOption !== newCommentVisibilityLevels[selectedVisibilityOptionIndex]) {
            this.safeSetState({
                commentVisibilityLevels: newCommentVisibilityLevels,
                selectedVisibilityOption: newCommentVisibilityLevels[selectedVisibilityOptionIndex],
            });
        }
    }

    onAlertDismissed() {
        this.customizrClient.updateSettings({
            mentionsUsageNotification: {
                alertDismissed: true,
            },
        });
        this.safeSetState({
            alertDismissed: true,
        });
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderSuggestion(entry, search, highlightedDisplay, index) {
        return <span>{highlightedDisplay} <i><small>{entry.email}</small></i></span>;
    }

    render() {
        return (
            <div className="comments-add">
                <div className='comments-alert'>
                    <Alert
                        type={'info'}
                        message={<p><Trans
                            defaults={this.tt('use_at_char_for_mentions')}
                            // eslint-disable-next-line react/jsx-key
                            components={[<strong>@</strong>]}
                        /></p>}
                        dismissible={true}
                        dismissed={this.state.alertDismissed}
                        onDismiss={this.onAlertDismissed.bind(this)}
                    />
                </div>
                <MentionsInput
                    className="mentions mentions-min-height"
                    value={this.state.commentToAdd}
                    onChange={(e, newValue) => this.safeSetState({commentToAdd: newValue})}
                    displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}>
                    <Mention
                        trigger="@"
                        data={(search, callback) => {
                            this.props.mentionsClient.fetchMatchingMentions(search).then(callback);
                        }}
                        renderSuggestion={this.renderSuggestion}
                    />
                </MentionsInput>
                <div style={{display: 'table'}}>
                    <Select
                        label={this.tt('show_my_comment_to')}
                        value={this.state.selectedVisibilityOption}
                        options={this.state.commentVisibilityLevels}
                        onChange={(selectedVisibilityOption) => {
                            this.customizrClient.updateSettings({selectedVisibility: selectedVisibilityOption.value});
                            this.safeSetState({selectedVisibilityOption});
                        }}
                        searchable={false}
                        clearable={false}
                        optionComponent={CommentVisibilityOption}
                    />
                    <span className="input-group-btn" style={{display: 'table-cell'}}>
                        <button
                            className="btn btn-default"
                            disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === '' || !this.state.selectedVisibilityOption}
                            onClick={() => {
                                this.props.onPostComment(this.state.commentToAdd);
                                this.safeSetState({commentToAdd: ''});
                            }}>
                            {this.tt('btn_post')}
                        </button>
                    </span>
                </div>
            </div>
        );
    }
}

AddNewCommentForm.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    initialValue: PropTypes.string,

    onPostComment: PropTypes.func,
    mentionsClient: PropTypes.any,
};

AddNewCommentForm.defaultProps = {
    locale: 'eng',
};

export default translate('translations', {i18n: getI18nInstance()})(AddNewCommentForm);