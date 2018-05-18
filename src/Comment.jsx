import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import '../style/index.css';
import TimeAgo from 'react-timeago';
import CommentClient from './clients/CommentClient';
import {getSubFromJWT} from './helper';
import {Mention, MentionsInput} from 'react-mentions';
import MentionsClient from './clients/MentionsClient';
import {shapes} from '@cimpress/react-components';
import {TextBlock} from 'react-placeholder/lib/placeholders';

let {Spinner} = shapes;

let globalCacheKey = Symbol();
let globalCache = {};

export default class _Comment extends React.Component {

    constructor(props) {
        super(props);
        this.commentClient = new CommentClient(props.accessToken, props.commentUri);
        this.mentionsClient = new MentionsClient(props.accessToken);
        this.jwtSub = getSubFromJWT(props.accessToken);

        this.state = {
            editMode: false,
            editedComment: null,
            savingComment: false,
            comment: (props.comment)
                ? props.comment.comment
                : '',
            createdBy: (props.comment)
                ? props.comment.createdBy
                : '',
            createdByName: (props.comment)
                ? this[globalCacheKey][props.comment.createdBy]
                : null,
            createdAt: (props.comment)
                ? props.comment.createdAt
                : '',
            updatedBy: (props.comment)
                ? props.comment.updatedBy
                : '',
            updatedByName: (props.comment)
                ? this[globalCacheKey][props.comment.updatedBy]
                : null,
            updatedAt: (props.comment)
                ? props.comment.updatedAt
                : '',
            visible: false,
            ready: props.comment != null
        };
    }

    get [globalCacheKey]() {
        return globalCache;
    }

    componentWillReceiveProps(newProps) {
        let accessTokenChanged = this.props.accessToken !== newProps.accessToken;
        let commentUriChanged = this.props.commentUri !== newProps.commentUri;

        if ( accessTokenChanged || commentUriChanged ) {
            this.commentClient = new CommentClient(newProps.accessToken, newProps.commentUri);
            this.jwtSub = getSubFromJWT(newProps.accessToken);
        }

        if ( accessTokenChanged ) {
            this.mentionsClient = new MentionsClient(props.accessToken);
        }

        if ( commentUriChanged ) {
            this.setState({
                comment: (newProps.comment)
                    ? newProps.comment.comment
                    : '',
                createdBy: (newProps.comment)
                    ? newProps.comment.createdBy
                    : '',
                createdAt: (newProps.comment)
                    ? newProps.comment.createdAt
                    : '',
                updatedBy: (newProps.comment)
                    ? newProps.comment.updatedBy
                    : '',
                updatedAt: (newProps.comment)
                    ? newProps.comment.updatedAt
                    : '',
                updatedByName: (newProps.comment)
                    ? this[globalCacheKey][newProps.comment.updatedBy]
                    : null,
                createdByName: (newProps.comment)
                    ? this[globalCacheKey][newProps.comment.createdBy]
                    : null,
                ready: newProps.comment != null
            }, () => this.fetchComment(this.state.visible));
        }
    }

    fetchUserName(userId, stateToUpdate) {

        if ( this[globalCacheKey][userId] ) {
            this.setState({
                [stateToUpdate]: this[globalCacheKey][userId]
            });
        }

        return this.mentionsClient
            .fetchUserName(userId)
            .then((responseJson) => {
                this[globalCacheKey][userId] = responseJson.profile.name;
                this.setState({
                    [stateToUpdate]: responseJson.profile.name
                });
            });
    }

    putComment(comment) {
        return this.commentClient.putComment(comment);
    }

    fetchComment(isVisible) {
        this.setState({
            visible: isVisible
        });
        if ( isVisible ) {
            return this.commentClient.fetchComment().then(responseJson => {
                this.setState({
                    comment: responseJson.comment,
                    updatedBy: responseJson.updatedBy,
                    createdBy: responseJson.createdBy,
                    createdAt: responseJson.createdAt,
                    updatedAt: responseJson.updatedAt,
                    updatedByName: this[globalCacheKey][responseJson.updatedBy],
                    createdByName: this[globalCacheKey][responseJson.createdBy],
                    ready: true
                });
                if ( responseJson.updatedBy ) {
                    this.fetchUserName(responseJson.updatedBy, 'updatedByName');
                }
                if ( responseJson.createdBy ) {
                    this.fetchUserName(responseJson.createdBy, 'createdByName');
                }
            }).catch(err => {
                console.error(err);
            });
        }
        return Promise.resolve();
    }

    change(event, newValue, newPlainTextValue, mentions) {
        this.setState({
            editedComment: newValue
        });
    }

    completeEditing() {
        this.setState({
            savingComment: true
        });
        if ( this.state.editedComment !== null && this.state.editedComment !== this.state.comment ) {
            this.putComment(this.state.editedComment.trim()).then((responseJson) => {
                this.setState({
                    editedComment: null,
                    editMode: false,
                    savingComment: false,
                    comment: responseJson.comment,
                    updatedBy: responseJson.updatedBy,
                    createdBy: responseJson.createdBy,
                    createdAt: responseJson.createdAt,
                    updatedAt: responseJson.updatedAt
                });
            }).catch(() => {
                this.setState({
                    savingComment: false
                });
            });
        } else {
            this.setState({
                editedComment: null,
                editMode: false,
                savingComment: false
            });
        }
    }

    cancelEditing() {
        this.setState({
            editedComment: null,
            editMode: false
        });
        this.fetchComment(this.state.isVisible);
    }

    authorPlaceholder = (
        <div>
            <TextBlock rows={1} color='lightgray' style={{width: 30, height: 5, marginTop: 10, marginBottom: 10}}/>
        </div>
    );

    commentPlaceholder = (
        <div>
            <TextBlock rows={2} color='gray' lineSpacing={4} style={{width: 30, height: 30}}/>
        </div>
    );

    render() {
        let classes = 'mentions disabled';
        let editMenu = null;
        if ( this.props.editComments === true && (this.state.createdBy === this.jwtSub || this.state.updatedBy === this.jwtSub) ) {
            if ( this.state.savingComment === true ) {
                classes = 'mentions disabled';
                editMenu = <div className={'mentions-edit'}><Spinner size={20}/></div>;
            } else if ( this.state.editMode ) {
                classes = 'mentions';
                let completeEdit = <div onClick={this.completeEditing.bind(this)}
                                        className={'fa fa-check mentions-ok'}/>;
                let cancelEdit = <div onClick={this.cancelEditing.bind(this)}
                                      className={'fa fa-undo mentions-cancel'}/>;
                editMenu = (<div>
                    {(this.state.editedComment !== null && this.state.editedComment !== this.state.comment)
                        ? completeEdit
                        : null}
                    {cancelEdit}
                </div>);
            } else {
                editMenu = <div onClick={() => {
                    this.setState({editMode: true});
                }} className={'mentions-edit fa fa-edit'}/>;
            }
        }

        let commentBody = (
            <div style={{position: 'relative'}}>
                <MentionsInput className={classes} value={this.state.editedComment || this.state.comment}
                               onChange={this.change.bind(this)}
                               displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}
                               readOnly={classes.includes('disabled')}>
                    <Mention trigger="@" data={(search, callback) => {
                        this.mentionsClient.fetchMatchingMentions(search).then(callback);
                    }}
                    />
                </MentionsInput>
                {editMenu}
            </div>);

        let modified = <span>, modified {(this.state.updatedBy !== this.state.createdBy)
            ? `by ${this.state.updatedByName || this.state.updatedBy}`
            : null} <TimeAgo
            date={this.state.updatedAt}/></span>;
        return (
            <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComment.bind(this)}>
                <div className={this.props.className || 'comment'}>
                    <ReactPlaceholder showLoadingAnimation customPlaceholder={this.authorPlaceholder}
                                      ready={this.state.ready}>
                        <div className={'comment-creator'}>
                            {this.state.createdBy
                                ? `${this.state.createdByName || this.state.createdBy}, `
                                : null}
                            <TimeAgo date={this.state.createdAt}/>{this.state.createdAt !== this.state.updatedAt
                            ? modified
                            : null}
                        </div>
                    </ReactPlaceholder>
                    <div>
                        <ReactPlaceholder showLoadingAnimation customPlaceholder={this.commentPlaceholder}
                                          ready={this.state.ready}>
                            {commentBody}
                        </ReactPlaceholder>
                    </div>
                </div>
            </VisibilitySensor>
        );
    }
}

_Comment.propTypes = {
    className: PropTypes.string,
    accessToken: PropTypes.string,
    commentUri: PropTypes.string,
    comment: PropTypes.object,
    editComments: PropTypes.bool
};
