# react-cimpress-comment

This repository stores a react component that anyone can use to conveniently collect and display comments related to platform resources.

## Usage

Install the npm package

`npm install @cimpress-technology/react-comments --save`

import the component

`import { Comments } from 'react-cimpress-comment'`

add the css dependencies

```html
<link rel="stylesheet" href="https://static.ux.cimpress.io/mcp-ux-css/1.1/release/css/mcp-ux-css.min.css"/>
<link rel="stylesheet" href="//cloud.typography.com/7971714/6011752/css/fonts.css"/>
```

and then use wherever needed

```javascript
render() {

    return (
      <div>
        <Comments resourceUri={"https://some_resource_server.cimpress.io/v0/resource/resourceId"}
                  newestFirst={false} editComments={true} accessToken={"accessToken"}/>
      </div>
    );
  }
```

There is also a variant of the component that places the comments in a drawer, and provides a button with comment count as a badge that opens the drawer.

`import { CommentsDrawerLink } from 'react-cimpress-comment'`

    render() {

        return (
          <div>
            <CommentsDrawerLink resourceUri={"https://some_resource_server.cimpress.io/v0/resource/resourceId"}
                      newestFirst={false} editComments={true} accessToken={"accessToken"} />
          </div>
        );
      }

Optional props:
- `header` allows overwriting the header/title part
- `footer` allows overwriting the footer part
- `position`, by default "right". Can also move the drawer to the "left" side.

## Publishing a new version to NPM

New patch version: `$ npm version patch [ && npm publish ]` // minor changes

New minor version: `$ npm version minor [ && npm publish ]` // backwards compatible

New major version: `$ npm version major [ && npm publish ]` // breaking changes

Publish a module: `$ npm publish`

**Note:** The way we publish new versions is by using the command line tools.

## Development

Make sure you have the up-to-date translation files by calling

    CLIENT_ID="<here the client id>" CLIENT_SECRET="<here the client secret>" npm run translate

For developing you can use [storybook](https://github.com/storybooks/storybook)

    npm run start

This will run an instance of Storybook integrated with Auth0 and providing the components in this package in environment
as close as possible to production. It is useful to manually play with the components and validate if the features you
are working on are as you'd like them to be from UX point of view.

In some case, modelling a special condition is hard without mocking. The package also provides an alternative and isolated
Storybook environment where all external dependencies are mocked. This is extremely useful to validate a certain behavior
in particular situation.
    
    npm run storybook
    
This command will run the Storybook in the background. You can later stop it by running `npm run storybookstop`.

During and after development it is good to check or update [BackstopJS](https://github.com/garris/BackstopJS) data. 
Running the UI tests is done by `backstop test` ***after*** executing `npm run storybook`.

Note: Make sure you have backstop installed `npm install -g backstopjs` or use the one in `node_modules`.

To approve the changes to reference images run `node_modules/.bin/backstop approve` on the `results` branch and make 
sure to merge the reference images back to the respective branch
`
