import React from 'react';
import {storiesOf} from '@storybook/react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import Authenticated from './Authenticated';
import auth from './auth';

import Comments from '../../src/Comments';
import CommentsDrawerLink from '../../src/CommentsDrawerLink';

storiesOf('Production-like', module)
    .addDecorator(withKnobs)
    .add('Comments', () => {
        return <Authenticated>
            <div className={'card'}>
                <div className={'card-block'}>
                    <Comments
                        accessToken={auth.getAccessToken()}
                        resourceUri={text('resourceUri', 'https://stereotype.trdlnk.cimpress.io/v1/templates/123123')}
                        newestFirst={boolean('newestFirst', true)}
                        editComments={boolean('newestFirst', true)}
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
                        editComments={boolean('newestFirst', true)}
                    />
                </div>
            </div>
        </Authenticated>;
    });