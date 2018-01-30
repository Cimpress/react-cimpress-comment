import React from 'react';
import { storiesOf } from '@storybook/react';
import Comments from '../src/Comments';
import CommentsDrawerLink from '../src/CommentsDrawerLink';


let accessTokenOfTheUser = "ew0KICAidHlwIjogIkpXVCIsDQogICJhbGciOiAiUlMyNTYiLA0KICAia2lkIjogIldlZndlRldFRldFZndlRVdGd2VmMjMzM3JFRldFRmV3ZmV3MzIzMiINCn0=.eyJzdWIiOiI0OWMwODdhYi0zZmVlLTQ5OTQtODZlNy1jNjNkMmI0N2FjOGIiLCJhdWQiOiJodHRwczovL2FwaS5jaW1wcmVzcy5pby8iLCJpYXQiOjQyMzQyMzQyMzQsImV4cCI6MjM0MzI0MzI0MjM0LCJhenAiOiJSRnJmRVJXRkVSZkZUNnZjcTc5eWxjSXVvbEZ6MmN3TiIsInNjb3BlIjoiIn0=.43tf3wcfww5f3ftd5wtw";

storiesOf('List of Comments', module)
  .add('Foreign comments', () => (<Comments accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={true} />))
  .add('Own comments with editing off', () => (<Comments accessToken={accessTokenOfTheUser} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={false} />))
  .add('Own comments with editing on', () => (<Comments accessToken={accessTokenOfTheUser} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={false} editComments={true}/>));

storiesOf('Comments drawer with link', module)
  .add('Link alone', () => (<CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={true} />))
  .add('Link and drawer open by default', () => (<CommentsDrawerLink accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={true} opened={true}/>))
