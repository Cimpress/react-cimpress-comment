import React from 'react';
import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean, select} from '@storybook/addon-knobs';
import Authenticated from './Authenticated';
import auth from './auth';

import Comments from '../../src/Comments';
import CommentsDrawerLink from '../../src/CommentsDrawerLink';
import CommentChat from '../../src/CommentChat';

storiesOf('Production-like', module)
    .addDecorator(withKnobs)
    .add('Comments', () => {
        return <Authenticated>
            <div className={'card'}>
                <div className={'card-block'}>
                    <Comments
                        locale={text('locale', null, 'eng')}
                        accessToken={auth.getAccessToken()}
                        resourceUri={text('resourceUri', 'https://stereotype.trdlnk.cimpress.io/v1/templates/123123', 'Settings')}
                        newestFirst={boolean('newestFirst', true, 'Settings')}
                        editComments={boolean('editComments', true, 'Settings')}
                        deleteComments={boolean('deleteComments', true, 'Settings')}
                        showVisibilityLevels={boolean('showVisibilityLevels', true, 'Settings')}
                        autoFocus={boolean('autoFocus', true, 'Settings')}
                        textOverrides={{
                            placeholder: text('placeholder', null, 'Text Overrides'),
                            subscribe: text('subscribe', null, 'Text Overrides'),
                            unsubscribe: text('unsubscribe', null, 'Text Overrides'),
                            postComment: text('postComment', null, 'Text Overrides'),

                        }}
                    />
                </div>
            </div>
        </Authenticated>;
    })
    .add('CommentsDrawerLink', () => {
        return <Authenticated>
            <div className={'card'}>
                <div className={'card-block'}>
                    <CommentsDrawerLink
                        locale={text('locale', 'eng')}
                        accessToken={auth.getAccessToken()}
                        resourceUri={text('resourceUri', 'https://stereotype.trdlnk.cimpress.io/v1/templates/123123')}
                        newestFirst={boolean('newestFirst', true)}
                        editComments={boolean('editComments', true)}
                        deleteComments={boolean('deleteComments', true, 'Settings')}
                    />
                </div>
            </div>
        </Authenticated>;
    })
    .add('CommentChat', () => {
        return <Authenticated>
            <div className={'card'}>
                <div className={'card-block'}>
                    <CommentChat
                        locale={text('locale', 'eng')}
                        accessToken={auth.getAccessToken()}
                        resourceUri={text('resourceUri', 'https://stereotype.trdlnk.cimpress.io/v1/templates/123123')}
                        newestFirst={boolean('newestFirst', true)}
                        editComments={boolean('editComments', false)}
                        deleteComments={boolean('deleteComments', true, 'Settings')}
                        positionSelf={select('positionSelf', {
                            left: 'left',
                            right: 'right',
                        }, 'left')}
                    />
                </div>
            </div>
        </Authenticated>;
    });
