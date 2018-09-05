// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewPropTypes,
} from 'react-native';

export default class ReactNativeSegmentedPager extends PureComponent {
  static propTypes = {
    currentPage: PropTypes.number,
    header: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.func,
    ]),
    headerMaxHeight: PropTypes.number,
    headerMinHeight: PropTypes.number,
    headerStyle: ViewPropTypes.style,
    horScrollProps: PropTypes.object,
    onCurrentPageChange: PropTypes.func,
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.oneOfType([
          PropTypes.element,
          PropTypes.arrayOf(PropTypes.element),
        ]),
        scrollViewProps: PropTypes.object,
      })
    ),
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    currentPage: 0,
    header: undefined,
    headerMaxHeight: undefined,
    headerMinHeight: 0,
    headerStyle: undefined,
    horScrollProps: undefined,
    onCurrentPageChange: undefined,
    pages: [],
    style: undefined,
  };

  horScrollViewRef = null;
  pageVertScrollPos = {};
  pageVertScrollRef = {};

  static getDerivedStateFromProps(props, prevState) {
    const {
      currentPage,
      pages
    } = props;
    const newState = {};

    if (currentPage !== prevState.currentPage) {
      let pageIndex = currentPage;

      if (pageIndex < 0 || pageIndex >= pages.length) {
        pageIndex = 0;
      }
      newState.currentPage = pageIndex;
    }

    if (pages !== prevState.pages) {
      newState.pages = pages;

      if (prevState.currentPage >= pages.length) {
        newState.currentPage = 0;
      }
    }

    return newState;
  }

  constructor(props, context) {
    super(props, context);

    this.curHeaderHeight = props.headerMaxHeight || 0;
    this.prevStaticHeaderHeight = this.curHeaderHeight;

    this.onContainerLayout = this.onContainerLayout.bind(this);
    this.onHeaderLayout = this.onHeaderLayout.bind(this);
    this.renderPage = this.renderPage.bind(this);

    this.state = {
      containerHeight: null,
      containerWidth: null,
      currentPage: props.currentPage,
      headerHeightAnim: new Animated.Value(this.curHeaderHeight),
      headerMaxHeight: props.headerMaxHeight,
      horScrollAnim: new Animated.Value(0),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      containerWidth,
      currentPage,
    } = this.state;

    if (
      this.horScrollViewRef
      && (
        (prevProps.currentPage !== currentPage && prevState.currentPage !== currentPage)
        || prevState.containerWidth !== containerWidth
      )
    ) {
      const isFirstRenderWithContainerWidthSet = prevState.containerWidth === null;

      this.horScrollViewScrollToCurrentPage(isFirstRenderWithContainerWidthSet);
    }
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          this.props.style
        ]}
        onLayout={this.onContainerLayout}
      >
        {this.renderHorScrollView()}
        {this.renderHeader()}
      </View>
    );
  }

  renderHeader() {
    // if (!this.state.containerWidth) return;

    const {
      header,
      headerStyle,
    } = this.props;
    const hasHeaderMaxHeight = this.state.headerMaxHeight !== undefined;

    return (
      <Animated.View
        onLayout={!hasHeaderMaxHeight ? this.onHeaderLayout : null}
        style={[
          styles.header,
          headerStyle,
          hasHeaderMaxHeight && {
            height: this.state.headerHeightAnim,
          }
        ]}
      >
        {typeof header === 'function' ? header(this.state, this.props) : header}
      </Animated.View>
    );
  }

  renderHorScrollView() {
    if (!this.state.containerWidth) return;

    const appliedProps = this.getAppliedHorScrollViewProps();

    return (
      <ScrollView
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        {...appliedProps}
        directionalLockEnabled={true}
        horizontal={true}
        pagingEnabled={true}
      >
        {this.renderPages()}
      </ScrollView>
    );
  }

  renderPage(page, index) {
    const {
      content,
      scrollViewProps,
    } = page;
    const {
      contentContainerStyle,
      onMomentumScrollEnd,
      onScroll,
      onScrollEndDrag,
      ref,
      style,
      ...restProps
    } = scrollViewProps || {};
    const {
      containerHeight,
      headerMaxHeight,
    } = this.state;

    return (
      <ScrollView
        key={index}
        contentContainerStyle={{
          ...contentContainerStyle,
          paddingTop: headerMaxHeight,
          // to be able to scroll header to its min height
          // even if page content is too short
          minHeight: containerHeight + (headerMaxHeight - this.props.headerMinHeight),
        }}
        directionalLockEnabled={true}
        ref={this.getPageRefHandler(ref, index)}
        scrollEventThrottle={16}
        style={[
          StyleSheet.flatten(style),
          {
            width: this.state.containerWidth / 1,
          },
        ]}
        {...restProps}
        horizontal={false}
        onMomentumScrollEnd={(event) => {
          this.onPageScrollStopped(index);
          onMomentumScrollEnd && onMomentumScrollEnd(event);
        }}
        onScroll={(event) => {
          this.onPageScroll(event, index);
          onScroll && onScroll(event);
        }}
        onScrollEndDrag={(event) => {
          this.onPageScrollStopped(index);
          onScrollEndDrag && onScrollEndDrag(event);
        }}
      >
        {content}
      </ScrollView>
    );
  }

  renderPages() {
    return this.props.pages.map(this.renderPage);
  }

  horScrollViewScrollToCurrentPage(isFirstRenderWithContainerWidthSet) {
    const {
      currentPage,
      containerWidth,
    } = this.state;
    const offset = currentPage * containerWidth;

    if (isFirstRenderWithContainerWidthSet && currentPage > 0) {
      // to prevent a jump of the anim value from 0 to new offset
      // caused by the use of setTimeout below
      this.state.horScrollAnim.setValue(currentPage * containerWidth);

      // scrollTo() has no effect on scrolling offset if called without a delay
      // when initial currentPage is set to != 0 and we scroll first time after
      // containerWidth is calculated
      setTimeout(() => {
        this.horScrollViewRef.scrollTo({
          animated: false,
          x: offset,
        });
      });
    } else {
      this.horScrollViewRef.scrollTo({
        animated: true,
        x: offset,
      });
    }
  }

  shiftPageVertScrollPos(index, headerHeightDiff) {
    const scrollPos = this.getPageVertScrollPos(index);

    this.setPageVertScrollPos(index, scrollPos + headerHeightDiff);
    this.pageVertScrollRef[index].scrollTo({
      animated: false,
      y: this.getPageVertScrollPos(index),
    });
  }

  getAppliedHorScrollViewProps() {
    const { horScrollProps, ...restProps } = this.props;
    const {
      onMomentumScrollEnd,
      onScroll,
      ref,
    } = horScrollProps || {};

    return {
      ...restProps,
      ref: (refEl) => {
        this.horScrollViewRef = refEl;

        typeof ref === 'function' && ref(refEl);
      },
      onMomentumScrollEnd: (event) => {
        this.onHorMomentumScrollEnd(event);
        onMomentumScrollEnd && onMomentumScrollEnd(event);
      },
      onScroll: Animated.event(
        [{ nativeEvent: { contentOffset: { x: this.state.horScrollAnim, } } }],
        { listener: onScroll },
      ),
    };
  }

  getExpectedHeaderHeightByCurrentPageScrollPos(scrollPos) {
    const {
      headerMinHeight,
    } = this.props;
    const {
      headerMaxHeight,
    } = this.state;

    if (scrollPos > headerMaxHeight - headerMinHeight) {
      return headerMinHeight;
    }

    return headerMaxHeight - scrollPos;
  }

  getHeaderHeightByCurrentPageScrollPos(scrollPos, prevScrollPos) {
    const { curHeaderHeight } = this;
    const expectedHeaderHeight = this.getExpectedHeaderHeightByCurrentPageScrollPos(prevScrollPos);

    // scrolling when top position of the page content
    // is right below the bottom edge of the header
    if (curHeaderHeight === expectedHeaderHeight) {
      return this.getExpectedHeaderHeightByCurrentPageScrollPos(scrollPos);
    }

    const scrollPosDiff = prevScrollPos - scrollPos;

    // scrolling up when header is taller than it would be if we only
    // scrolled the page which is currently visible
    if (scrollPosDiff < 0) {
      return Math.max(
        this.props.headerMinHeight,
        curHeaderHeight + scrollPosDiff
      );
    }

    // scrolling down when header is taller than it would be if we only
    // scrolled the page which is currently visible

    // this height header would have if top endge of the page wasn't shifted
    // up above bottom edge of the header
    const regularHeaderHeight = this.getExpectedHeaderHeightByCurrentPageScrollPos(scrollPos);

    if (regularHeaderHeight > curHeaderHeight) {
      return regularHeaderHeight;
    }

    return curHeaderHeight;
  }

  getPageRefHandler(ref, index) {
    return (refEl) => {
      this.pageVertScrollRef[index] = refEl;

      typeof ref === 'function' && ref(refEl);
    };
  }

  getPageVertScrollPos(index) {
    return this.pageVertScrollPos[index] || 0;
  }

  onContainerLayout({ nativeEvent: { layout: { height, width, } } }) {
    const {
      containerHeight: curHeight,
      containerWidth: curWidth,
    } = this.state;

    if (curHeight !== height || curWidth !== width) {
      this.setState(() => ({
        containerHeight: height,
        containerWidth: width,
      }));
    }
  }

  onHeaderLayout({ nativeEvent: { layout: { height, } } }) {
    if (this.state.headerMaxHeight === undefined) {
      const headerMaxHeight = Math.max(this.props.headerMinHeight, height);

      this.setState(() => ({
        headerMaxHeight,
      }));
      this.state.headerHeightAnim.setValue(headerMaxHeight);
      this.curHeaderHeight = headerMaxHeight;
      this.prevStaticHeaderHeight = headerMaxHeight;
    }
  }

  onHorMomentumScrollEnd(event) {
    const {
      onCurrentPageChange,
    } = this.props;
    const scrolledToPage =
      Math.round(event.nativeEvent.contentOffset.x / this.state.containerWidth);

    this.setState(() => ({
      currentPage: scrolledToPage,
    }), () => {
      onCurrentPageChange && onCurrentPageChange(scrolledToPage);
    });
  }

  onPageScroll({ nativeEvent: { contentOffset: { y, } } }, index) {
    if (this.state.currentPage !== index) {
      this.setPageVertScrollPos(index, y);
      return;
    }

    const prevScrollPos = this.getPageVertScrollPos(index);

    // must be after const prevScrollPos = this.getPageVertScrollPos(index);
    this.setPageVertScrollPos(index, y);

    const newHeaderHeight = this.getHeaderHeightByCurrentPageScrollPos(y, prevScrollPos);

    this.curHeaderHeight = newHeaderHeight;

    if (Platform.OS === 'android') {
      this.state.headerHeightAnim.setValue(newHeaderHeight);
    } else {
      Animated.timing(this.state.headerHeightAnim, {
        toValue: newHeaderHeight,
        duration: 0,
        // useNativeDriver: true,
      }).start();
    }
  }

  onPageScrollStopped(index) {
    const {
      currentPage,
    } = this.state;

    if (currentPage !== index) {
      return;
    }

    // page is bouncing yet
    if (this.getPageVertScrollPos(currentPage) < 0) {
      return;
    }

    const currentHeaderHeight = this.curHeaderHeight;
    const headerHeightDiff = this.prevStaticHeaderHeight - currentHeaderHeight;

    this.prevStaticHeaderHeight = currentHeaderHeight;

    // when scrolling a page, positions of the top edges of all other pages
    // should stay the same related to the bottom edge of the header
    this.props.pages.forEach((page, pageIndex) => {
      if (pageIndex !== currentPage) {
        this.shiftPageVertScrollPos(pageIndex, headerHeightDiff);
      }
    });
  }

  setPageVertScrollPos(index, scrollPos) {
    this.pageVertScrollPos[index] = scrollPos;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'grey',
    flex: 1,
  },
  header: {
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
  },
});
