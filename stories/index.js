import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Comments from '../src/Comments';

storiesOf('Comments', module)
  .add('default config', () => (<Comments accessToken={"51d3ab44-efe1-4cc7-b0fa-6c86fa2ca134"} resourceUri={"http://eda234a4-485f-4c0c-806d-1c9748994c00.com"} newestFirst={true} />));
