import React from 'react';
import {storiesOf} from '@storybook/react';
import Comments from '../src/Comments';
import CommentsDrawerLink from '../src/CommentsDrawerLink';
import fetchMock from 'fetch-mock';

let accessTokenOfTheUser = "ew0KICAidHlwIjogIkpXVCIsDQogICJhbGciOiAiUlMyNTYiLA0KICAia2lkIjogIldlZndlRldFRldFZndlRVdGd2VmMjMzM3JFRldFRmV3ZmV3MzIzMiINCn0=.eyJzdWIiOiI0OWMwODdhYi0zZmVlLTQ5OTQtODZlNy1jNjNkMmI0N2FjOGIiLCJhdWQiOiJodHRwczovL2FwaS5jaW1wcmVzcy5pby8iLCJpYXQiOjQyMzQyMzQyMzQsImV4cCI6MjM0MzI0MzI0MjM0LCJhenAiOiJSRnJmRVJXRkVSZkZUNnZjcTc5eWxjSXVvbEZ6MmN3TiIsInNjb3BlIjoiIn0=.43tf3wcfww5f3ftd5wtw";

let defaultCustomerzMock = {
    url: 'http://localhost:9102/v1/resources/https%3A%2F%2Fcomment.trdlnk.cimpress.io%2F/settings',
    response: {
        status: 200, body: {
            mentionsUsageNotification: {
                alertDismissed: true
            }
        }
    }
};

storiesOf('List of Comments', module)
    .add('Foreign comments', () => {
        fetchMock.restore();
        return <Comments accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                         resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                         newestFirst={true}/>
    })
    .add('Own comments with editing off', () => {
        fetchMock.restore();
        return <Comments accessToken={accessTokenOfTheUser}
                         resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                         newestFirst={false}/>
    })
    .add('Own comments with editing on', () => {
        return <Comments accessToken={accessTokenOfTheUser}
                         resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                         newestFirst={false} editComments={true}/>
    });

storiesOf('Mention box', module)
    .add('Highlighter for mentions', () => {
        fetchMock.restore();
        return <Comments accessToken={"ff294991-6ec1-4219-b868-3dcfa726b045"}
                         resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com/non-existent"}
                         newestFirst={true}
                         initialValue={"@[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086)\n check for displaced highlighter - @[John Does](b636a568-b51e-4653-903c-01e71d5a5a86)"}/>
    });

storiesOf('Comments drawer with link', module)
    .add('Link alone', () => {
        fetchMock.restore();
        return <CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                                   resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                                   newestFirst={true}/>
    })
    .add('Link and drawer open by default', () => {
        fetchMock.restore();
        return <CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                                   resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={true}
                                   opened={true}/>
    })
    .add('Multiple links on one page', () => {
        fetchMock.restore();
        return <div>
            <CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                                resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                                newestFirst={true}/><br/>
            <CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                                resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                                newestFirst={true}/><br/>
            <CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"}
                                resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"}
                                newestFirst={true}/><br/>
        </div>
    });

storiesOf('Errors', module)
    .add('With get comments returning 403', () => {
        fetchMock
            .restore()
            .get('http://localhost:9102/v0/resources/http%3A%2F%2Feda234a4-485f-4c0c-806d-1c9748994c00.com%2F403', {status: 403})
            .get(defaultCustomerzMock.url, defaultCustomerzMock.response);

        return <Comments accessToken={"ff294991-6ec1-4219-b868-3dcfa726b045"}
                         resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com/403"} newestFirst={true}
                         initialValue={"@[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086)\n check for displaced highlighter - @[John Does](b636a568-b51e-4653-903c-01e71d5a5a86)"}/>
    })
    .add('With getting single comment returning 403', () => {
        let commentIdA = 'ed0b20a0-78c5-11e8-b9eb-3be9f7ea0679-1';
        let commentIdB = 'ed0b20a0-78c5-11e8-b9eb-3be9f7ea0679-2';
        let resourceId = 'http://eda234a4-485f-4c0c-806d-1c9748994c00.com';
        fetchMock
            .restore()
            .get(`http://localhost:9102/v0/resources/${encodeURIComponent(resourceId)}`,
                {
                    status: 200,
                    body: {
                        "URI": "https://stereotype.trdlnk.cimpress.io/v1/templates/aaa-3.csv",
                        "comments": [{
                            "referer": "http://localhost:3000/",
                            "createdAt": "2018-06-25T22:20:11.562Z",
                            "updatedBy": "adfs|istanishev@cimpress.com",
                            "visibility": "internal",
                            "createdBy": "adfs|istanishev@cimpress.com",
                            "comment": "kkdsrghsdfg\nsd\nfg\nsdfglksdjflgka\n",
                            "id": commentIdA,
                            "updatedAt": "2018-06-25T22:20:11.562Z"
                        }, {
                            "referer": "http://localhost:3000/",
                            "createdAt": "2018-06-25T22:20:11.562Z",
                            "updatedBy": "adfs|istanishev@cimpress.com",
                            "visibility": "internal",
                            "createdBy": "adfs|istanishev@cimpress.com",
                            "comment": "kkdsrghsdfg\nsd\nfg\nsdfglksdjflgka\n",
                            "id": commentIdB,
                            "updatedAt": "2018-06-25T22:20:11.562Z"
                        }],
                        "eTag": 2
                    }
                },
            )
            .get(`http://localhost:9102/v0/resources/${encodeURIComponent(resourceId)}/comments/${commentIdA}`, {status: 403})
            .get(`http://localhost:9102/v0/resources/${encodeURIComponent(resourceId)}/comments/${commentIdB}`, {status: 403})
            .get(defaultCustomerzMock.url, defaultCustomerzMock.response);

        return <Comments accessToken={"ff294991-6ec1-4219-b868-3dcfa726b045"}
                         resourceUri={resourceId} newestFirst={true}
                         initialValue={"@[John Doe](b636a568-b51e-4653-903c-01e7bd5a5086)\n check for displaced highlighter - @[John Does](b636a568-b51e-4653-903c-01e71d5a5a86)"}/>
    });
