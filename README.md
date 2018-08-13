# React Native Segmented Pager

[![Version][version-badge]][package]
[![MIT License][license-badge]][license]

Pure React Native cross-platform segmented pager component


## Requirements

- React version >= 16.3.0
- React Native - any version with Animated lib supported (but tested with >= 0.55.4 only)


## Features

- Tabs scrolling independently
- Header height animated
- No extra libs or components, just segmented pager component
- Easy to implement parallax for the header and tab bar with underline animated (see Demo)


## Demo

Please see `example` folder

<img
  src="https://github.com/niloms/react-native-segmented-pager/blob/master/ReactNativeSegmentedPager.gif?raw=true"
  width="180"
/>

## Installation

```sh
npm install react-native-segmented-pager --save
```
or

```sh
yarn add react-native-segmented-pager
```


## Example

Please see `example` folder for full code

```js
import React, { PureComponent } from 'react';

import ReactNativeSegmentedPager from 'react-native-segmented-pager';

export default class ReactNativeSegmentedPagerDemo extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.renderHeader = this.renderHeader.bind(this);

    this.state = {
      currentPage: 0,
      pages: getPages(),
    };
  }

  render() {
    const { currentPage, pages, } = this.state;

    return (
      <ReactNativeSegmentedPager
        currentPage={currentPage}
        header={this.renderHeader}
        headerMaxHeight={150}
        headerMinHeight={70}
        headerStyle={styles.header}
        onCurrentPageChange={(pageIndex) => {
          this.setState(() => ({
            currentPage: pageIndex,
          }));
        }}
        pages={pages}
        style={styles.segmented}
      />
    );
  }

  renderHeader(state, props) {
    return (
      ...
    );
  }
}


function getPages() {
  return [{
    content: (
      ...
    ),
    title: 'PAGE 1',
  }, {
    content: (
      ...
    ),
    title: 'PAGE 2',
  }, {
    content: (
      ...
    ),
    title: 'PAGE 3',
  }];
}
```


## Props

- `currentPage` - index of the currently visible page (number, default is 0)
- `header` - header to render at the top of the component (element, array of elements or a function)
- `headerMaxHeight` - max possible height of the header (number, auto-calculated if not set)
- `headerMinHeight` - min possible height of the header (number, default is 0)
- `headerStyle` - custom style for the header (style object)
- `horScrollProps` - ScrollView props for horizontal ScrollView component
- `onCurrentPageChange` - a callback function called when current page changes (takes index of the new visible page as an argument)
- `pages` - array of objects of the following view:

```js
{
  content: ...,
  scrollViewProps: ...,
  title: ...,
}
```

Here
- `content` - a React Native element
- `scrollViewProps` - ScrollView props for vertical ScrollView component of the page

- `style` - custom style for the component


## Header as a render prop

If `header` prop is a function it takes two arguments:
- `state` - state of the ReactNativeSegmentedPager (to access it's Animated vars)
- `props` - props of the ReactNativeSegmentedPager

Please see `example` folder for an example
