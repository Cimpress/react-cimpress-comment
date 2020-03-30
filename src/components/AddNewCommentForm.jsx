import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import CommentVisibilityOption from './CommentVisibilityOption';
import renderCoamMentionSuggestion from '../renderers/renderCoamMentionSuggestion';

import {getVisibilityLevels} from '../tools/visibility';
import {Mention, MentionsInput} from 'react-mentions';
import {Alert, Select} from '@cimpress/react-components';

import {CustomizrClient} from 'cimpress-customizr';

import {getI18nInstance} from '../tools/i18n';
import {translate, Trans} from 'react-i18next';
import {getSubFromJWT, performActionOnMetaEnter} from '../tools/helper';
import {fetchMatchingMentions} from '../clients/mentions';

import {WatchLabel} from '@cimpress-technology/react-baywatch';

class AddNewCommentForm extends React.Component {
    constructor(props) {
        super(props);

        this.customizrClient = new CustomizrClient({
            resource: `https://comment.trdlnk.cimpress.io/`,
        });

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

    componentDidUpdate(prevProps) {
        let commentVisibilityLevels = JSON.stringify(this.state.commentVisibilityLevels);
        let newCommentVisibilityLevels = JSON.stringify(getVisibilityLevels(this.tt.bind(this)));
        if (commentVisibilityLevels !== newCommentVisibilityLevels) {
            newCommentVisibilityLevels = JSON.parse(newCommentVisibilityLevels);
            let newSelectedVisibilityOption = this.state.selectedVisibilityOption
                ? newCommentVisibilityLevels.find((x) => x.value === this.state.selectedVisibilityOption.value)
                : null;
            this.setState({
                commentVisibilityLevels: newCommentVisibilityLevels,
                selectedVisibilityOption: newSelectedVisibilityOption,
            });
        }
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
        this.customizrClient
            .getSettings(this.props.accessToken)
            .then((json) => {
                let newAlertDismissed = json.mentionsUsageNotification && json.mentionsUsageNotification.alertDismissed === true;
                let newSelectedVisibilityOption = this.state.commentVisibilityLevels.find((l) => l.value === (this.props.enforceVisibilityLevel || json.selectedVisibility));
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
        this.customizrClient
            .putSettings(this.props.accessToken, {
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
        let {t, locale} = this.props;
        if (locale.length > 2) {
            locale = locale.substr(0, 2);
        }
        return t(key, {lng: locale});
    }

    render() {
        const postComment = (locality) => (key) => {
            locality.props.onPostComment(locality.state.commentToAdd, locality.state.selectedVisibilityOption.value);
            locality.safeSetState({commentToAdd: ''});
        };

        let watchLink = <WatchLabel accessToken={this.props.accessToken} resourceUri={this.props.commentsClient.getResourceUri()}
            locale={this.props.locale} labelOnSubscriptionActive={this.props.textOverrides.unsubscribe || this.tt('stop_watching_this_thread')}
            labelOnSubscriptionInactive={this.props.textOverrides.subscribe || this.tt('watch_this_thread')}/>;

        let postButton = (
            <button
                className="btn btn-primary"
                disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === '' || !this.state.selectedVisibilityOption}
                onClick={postComment(this)}>
                {this.props.textOverrides.postComment || this.tt('btn_post')}
            </button>
        );

        let visibilityLevels = (
            <div style={{display: 'table'}}>
                <Select
                    label={this.tt('show_my_comment_to')}
                    value={this.state.selectedVisibilityOption}
                    options={this.state.commentVisibilityLevels}
                    onChange={(selectedVisibilityOption) => {
                        this.customizrClient
                            .putSettings(this.props.accessToken, {selectedVisibility: selectedVisibilityOption.value});
                        this.safeSetState({selectedVisibilityOption});
                    }}
                    searchable={false}
                    clearable={false}
                    optionComponent={CommentVisibilityOption}
                />
                <span className="input-group-btn" style={{display: 'table-cell'}}>
                    { postButton }
                </span>
            </div>);

        return (
            <div
                className="comments-add"
                onKeyDown={performActionOnMetaEnter(postComment(this))}
                tabIndex="0">
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
                { this.props.newestFirst ? null : watchLink }
                <div className={this.props.showVisibilityLevels ? null : 'post-button-inline'}>
                    <MentionsInput
                        autoFocus={this.props.autoFocus}
                        className="mentions mentions-min-height"
                        value={this.state.commentToAdd}
                        onChange={(e, newValue) => this.safeSetState({commentToAdd: newValue})}
                        displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}
                        placeholder={this.props.textOverrides.placeholder}>
                        <Mention
                            trigger="@"
                            data={(search, callback) => {
                                fetchMatchingMentions(this.props.accessToken, search).then(callback);
                            }}
                            renderSuggestion={renderCoamMentionSuggestion}
                        />
                    </MentionsInput>
                    { this.props.showVisibilityLevels ? null : postButton }
                </div>
                { this.props.showVisibilityLevels ? visibilityLevels : null }
                { this.props.newestFirst ? watchLink : null }
            </div>
        );
    }
}

AddNewCommentForm.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    initialValue: PropTypes.string,
    newestFirst: PropTypes.bool,
    onPostComment: PropTypes.func,
    commentsClient: PropTypes.any,
    showVisibilityLevels: PropTypes.bool,
    autoFocus: PropTypes.bool,
    enforceVisibilityLevel: PropTypes.oneOf(['public', 'internal']),
    textOverrides: PropTypes.shape({
        placeholder: PropTypes.string,
        subscribe: PropTypes.string,
        unsubscribe: PropTypes.string,
        postComment: PropTypes.string,
    }),
};

AddNewCommentForm.defaultProps = {
    locale: 'en',
    autoFocus: true,
};

export default translate('translations', {i18n: getI18nInstance()})(AddNewCommentForm);
