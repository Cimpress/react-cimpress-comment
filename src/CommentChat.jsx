import React from 'react';
import PropTypes from 'prop-types';

import '../style/index.css';
import '../style/select.css';
import '../style/chat.css';

import Comment from './components/Comment';
import Comments from './Comments';

import {getI18nInstance} from './tools/i18n';
import {translate} from 'react-i18next';
import {getSubFromJWT} from './tools/helper';
import CommentAuthor from './components/CommentAuthor';
import CommentTime from './components/CommentTime';

class CommentChat extends Comments {
    renderComments(commentIds) {
        let uri = this.commentsClient.getResourceCommentsUri();
        let jwt = getSubFromJWT(this.props.accessToken);

        return commentIds.map((commentId, index, array) => {
            let previousCommentObject = index - 1 >= 0 ? this.state.commentObjects[array[index - 1]] : null;
            let currentCommentObject = this.state.commentObjects[commentId];
            let chatParty;
            if (this.props.positionSelf === 'right') {
                chatParty = currentCommentObject.createdBy === jwt ? 'right' : 'left';
            } else {
                chatParty = currentCommentObject.createdBy === jwt ? 'left' : 'right';
            }
            let className = `bubble ${chatParty}`;
            let authorHeader =
                <React.Fragment>
                    <CommentAuthor
                        accessToken={this.props.accessToken}
                        className={`comment-author ${chatParty}`}
                        createdBy={currentCommentObject.createdBy}/>
                </React.Fragment>;
            let timeFooter =
                <CommentTime
                    accessToken={this.props.accessToken}
                    locale={this.props.locale}
                    className={`comment-creator ${chatParty}`}
                    createdBy={currentCommentObject.createdBy}
                    createdAt={currentCommentObject.createdAt}
                    updatedBy={currentCommentObject.updatedBy}
                    updatedAt={currentCommentObject.updatedAt} />;
            let implicit = (!previousCommentObject || previousCommentObject.createdBy !== currentCommentObject.createdBy);
            return <React.Fragment key={commentId}>
                {implicit ? authorHeader : null}
                <Comment
                    key={commentId}
                    locale={this.props.locale}
                    accessToken={this.props.accessToken}
                    className={className}
                    jwtSub={jwt}
                    commentsClient={this.commentsClient}
                    commentUri={`${uri}/${commentId}`}
                    comment={this.state.commentObjects[commentId]}
                    editComments={this.props.editComments}
                    deleteComments={this.props.deleteComments}
                    onDelete={this.handleDelete.bind(this)}
                    commentVisibilityLevels={this.state.commentVisibilityLevels}
                    header={null}
                    footer={timeFooter}
                /></React.Fragment>;
        });
    }

    render() {
        return <Comments {...this.props} renderComments={this.renderComments}/>;
    }
}

CommentChat.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool,
    editComments: PropTypes.bool,
    deleteComments: PropTypes.bool,
    refreshInterval: PropTypes.number,
    commentCountRefreshed: PropTypes.func,
    initialValue: PropTypes.string,
    showVisibilityLevels: PropTypes.bool,
    autoFocus: PropTypes.bool,
    enforceVisibilityLevel: PropTypes.oneOf(['public', 'internal']),
    positionSelf: PropTypes.oneOf(['left', 'right']),
    textOverrides: PropTypes.shape({
        placeholder: PropTypes.string,
        subscribe: PropTypes.string,
        unsubscribe: PropTypes.string,
        postComment: PropTypes.string,
    }),
    emailing: PropTypes.shape({
        enabled: PropTypes.bool,
        newCommentsTemplateId: PropTypes.string,
        newCommentsTemplatePayload: PropTypes.any,
    }),
};

CommentChat.defaultProps = {
    locale: 'en',
    showVisibilityLevels: true,
    autoFocus: true,
    positionSelf: 'left',
    editComments: false,
    deleteComments: false,
    textOverrides: {
        placeholder: null,
        subscribe: null,
        unsubscribe: null,
        postComment: null,
    },
    emailing: {
        enabled: false,
        newCommentsTemplateId: null,
        newCommentsTemplatePayload: {},
    },
};

export default translate('translations', {i18n: getI18nInstance()})(CommentChat);
