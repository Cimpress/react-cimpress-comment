import React from 'react';
import {storiesOf} from '@storybook/react';
import Comments from '../src/Comments';
import CommentsDrawerLink from '../src/CommentsDrawerLink';
import fetchMock from 'fetch-mock';

import {mockCoamPrincipals} from './mockCoam';
import {mockComments} from './mockComment';

let accessTokenOfTheUser = 'ew0KICAidHlwIjogIkpXVCIsDQogICJhbGciOiAiUlMyNTYiLA0KICAia2lkIjogIldlZndlRldFRldFZndlRVdGd2VmMjMzM3JFRldFRmV3ZmV3MzIzMiINCn0=.eyJzdWIiOiI0OWMwODdhYi0zZmVlLTQ5OTQtODZlNy1jNjNkMmI0N2FjOGIiLCJhdWQiOiJodHRwczovL2FwaS5jaW1wcmVzcy5pby8iLCJpYXQiOjQyMzQyMzQyMzQsImV4cCI6MjM0MzI0MzI0MjM0LCJhenAiOiJSRnJmRVJXRkVSZkZUNnZjcTc5eWxjSXVvbEZ6MmN3TiIsInNjb3BlIjoiIn0=.43tf3wcfww5f3ftd5wtw';

function initMock() {
    let m = fetchMock.restore()
        .get('http://localhost:9102/v1/resources/https%3A%2F%2Fcomment.trdlnk.cimpress.io%2F/settings', {
            status: 200,
            body: {
                mentionsUsageNotification: {
                    alertDismissed: true,
                },
            },
        });

    m = mockCoamPrincipals(m);

    m = mockComments(m, 'http%3A%2F%2Feda234a4-485f-4c0c-806d-1c9748994c00.com');

    return m;
}

storiesOf('List of Comments', module)
    .add('Foreign comments', () => {
        initMock();
        return <Comments accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
            newestFirst={true}/>;
    })
    .add('Own comments with editing off', () => {
        initMock();
        return <Comments accessToken={accessTokenOfTheUser}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
            newestFirst={false}/>;
    })
    .add('Own comments with editing on', () => {
        initMock();
        return <Comments accessToken={accessTokenOfTheUser}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
            newestFirst={false} editComments={true}/>;
    });

storiesOf('Mention box', module)
    .add('Highlighter for mentions', () => {
        initMock();
        return <Comments accessToken={'ff294991-6ec1-4219-b868-3dcfa726b045'}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com/non-existent'}
            newestFirst={true}
            initialValue={'@[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086)\n check for displaced highlighter - @[John Does](b636a568-b51e-4653-903c-01e71d5a5a86)'}/>;
    });

storiesOf('Comments drawer with link', module)
    .add('Link alone', () => {
        initMock();
        return <CommentsDrawerLink accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
            newestFirst={true}/>;
    })
    .add('Link and drawer open by default', () => {
        initMock();
        return <CommentsDrawerLink accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'} newestFirst={true}
            opened={true}/>;
    })
    .add('Multiple links on one page', () => {
        initMock();
        return <div>
            <CommentsDrawerLink accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
                resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
                newestFirst={true}/><br/>
            <CommentsDrawerLink accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
                resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
                newestFirst={true}/><br/>
            <CommentsDrawerLink accessToken={'51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134'}
                resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com'}
                newestFirst={true}/><br/>
        </div>;
    });

storiesOf('Errors', module)
    .add('With get comments returning 403', () => {
        initMock()
            .get('http://localhost:9102/v0/resources/http%3A%2F%2Feda234a4-485f-4c0c-806d-1c9748994c00.com%2F403', {
                status: 403,
            }, {
                overwriteRoutes: true,
            });

        return <Comments accessToken={'ff294991-6ec1-4219-b868-3dcfa726b045'}
            resourceUri={'http://eda234a4-485f-4c0c-806d-1c9748994c00.com/403'} newestFirst={true}
            initialValue={'@[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086)\n check for displaced highlighter - @[John Does](b636a568-b51e-4653-903c-01e71d5a5a86)'}/>;
    });
