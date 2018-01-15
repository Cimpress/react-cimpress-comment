# react-cimpress-comment

This repository stores a react component that anyone can use to conveniently collect and display comments related to platform resources.

## Usage

Install the npm package

`npm install react-cimpress-comment --save`

import the component

`import { Comments } from 'react-cimpress-comment'`

add the css dependencies

```
<link rel="stylesheet" href="https://static.ux.cimpress.io/mcp-ux-css/1.1/release/css/mcp-ux-css.min.css">
<link rel="stylesheet" href="//cloud.typography.com/7971714/6011752/css/fonts.css"/>
```

and then use wherever needed

    render() {

        return (
          <div>
            <Comments resourceUri={"https://some_resource_server.cimpress.io/v0/resource/resourceId"}
                      newestFirst={false} editComments={true} accessToken={"accessToken"}/>
          </div>
        );
      }

which will result in something like

![Demo](./demo.gif)

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

![Demo](./demo-drawer.gif)

Optional props:
- `header` allows overwriting the header/title part
- `footer` allows overwriting the footer part
- `position`, by default "right". Can also move the drawer to the "left" side.