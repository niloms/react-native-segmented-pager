import React, { PureComponent } from 'react';

import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';

import ReactNativeSegmentedPager from 'react-native-segmented-pager';
import TabBar from './TabBar';

const HEADER_IMG = require('./pics/header.jpg');
const IMAGES = [
  require('./pics/1.jpg'),
  require('./pics/2.jpg'),
  require('./pics/3.jpg'),
  require('./pics/4.jpg'),
  require('./pics/5.jpg'),
  require('./pics/6.jpg'),
  require('./pics/7.jpg'),
  require('./pics/8.jpg'),
  require('./pics/9.jpg'),
];

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
    const isHeaderMaxHeightSet = state.headerMaxHeight !== undefined;

    const {
      containerWidth,
      headerMaxHeight,
    } = state;
    const {
      headerMinHeight,
    } = props;
    const inputRange = [headerMinHeight, headerMaxHeight, headerMaxHeight + 50];
    const opacityAnim = isHeaderMaxHeightSet
      ? state.headerHeightAnim.interpolate({
        inputRange,
        outputRange: [0, 1, 1]
      })
      : null;
    const widthAnim = isHeaderMaxHeightSet
      ? state.headerHeightAnim.interpolate({
        inputRange,
        outputRange: [containerWidth, containerWidth + 50, containerWidth + 100]
      })
      : null;
    const image = (
      <Animated.Image
        source={HEADER_IMG}
        style={{
          flex: 1,
          opacity: state.containerWidth ? opacityAnim : 0,
          resizeMode: 'cover',
          width: widthAnim || containerWidth,
        }}
      />
    );
    const scrollXAnim = state.containerWidth
      ? Animated.divide(state.horScrollAnim, state.containerWidth)
      : null;

    return (
      <View
        style={styles.headerCnt}
      >
        {image}
        <TabBar
          activeTab={this.state.currentPage}
          activeTabTextStyle={styles.activeTabText}
          containerStyle={styles.tabBarCnt}
          onTabSelect={tabIndex => this.setState(() => ({ currentPage: tabIndex }))}
          scrollXAnim={scrollXAnim}
          tabs={this.state.pages}
          tabTextStyle={styles.tabText}
        />
      </View>
    );
  }
}


function getPages() {
  return [{
    content: (
      <View>
        <Image
          source={IMAGES[0]}
          style={[
            styles.img,
            styles.img1,
          ]}
        />
        <Image
          source={IMAGES[1]}
          style={[
            styles.img,
            styles.img1,
          ]}
        />
        <Image
          source={IMAGES[2]}
          style={[
            styles.img,
            styles.img1,
          ]}
        />
      </View>
    ),
    title: 'PAGE 1',
  }, {
    content: (
      <View>
        <Image
          source={IMAGES[3]}
          style={[
            styles.img,
            styles.img2,
          ]}
        />
        <Image
          source={IMAGES[4]}
          style={[
            styles.img,
            styles.img2,
          ]}
        />
        <Image
          source={IMAGES[5]}
          style={[
            styles.img,
            styles.img2,
          ]}
        />
      </View>
    ),
    title: 'PAGE 2',
  }, {
    content: (
      <View>
        <Image
          source={IMAGES[6]}
          style={[
            styles.img,
            styles.img3,
          ]}
        />
        <Image
          source={IMAGES[7]}
          style={[
            styles.img,
            styles.img3,
          ]}
        />
        <Image
          source={IMAGES[8]}
          style={[
            styles.img,
            styles.img3,
          ]}
        />
      </View>
    ),
    title: 'PAGE 3',
  }];
}

const styles = StyleSheet.create({
  activeTabText: {
    color: 'white',
  },
  img: {
    alignSelf: 'center',
    marginBottom: 8,
    resizeMode: 'cover',
    width: '90%',
  },
  img1: {
    height: 200,
  },
  img2: {
    height: 600,
  },
  img3: {
    height: 400,
  },
  header: {
    backgroundColor: '#2d3a4b',
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  headerCnt: {
    alignItems: 'center',
    flex: 1,
    borderRadius: 2,
    borderWidth: 0,
  },
  segmented: {
    backgroundColor: '#efefef',
  },
  tabText: {
    fontWeight: 'bold',
  },
  tabBarCnt: {
    height: 48,
  },
});
