# react-cimpress-comment

This repository stores a react component that anyone can use to conveniently collect and display comments related to platform resources.

## Usage

Install the npm package

`npm install react-cimpress-comment --save`

import the component

`import Comments from 'react-cimpress-comment'`

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