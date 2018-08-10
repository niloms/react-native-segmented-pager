import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';

export default class TabBar extends PureComponent {
  static propTypes = {
    activeTab: PropTypes.number,
    activeTabStyle: ViewPropTypes.style,
    activeTabTextStyle: PropTypes.any,
    containerStyle: ViewPropTypes.style,
    onTabSelect: PropTypes.func,
    scrollXAnim: PropTypes.object,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
    })),
    tabStyle: ViewPropTypes.style,
    tabTextStyle: PropTypes.any,
  };

  static defaultProps = {
    activeTab: 0,
    activeTabStyle: undefined,
    activeTabTextStyle: undefined,
    containerStyle: undefined,
    onTabSelect: undefined,
    scrollXAnim: undefined,
    tabs: [],
    tabStyle: undefined,
    tabTextStyle: undefined,
  };

  state = {
    containerWidth: undefined,
  };

  constructor(props, context) {
    super(props, context);

    this.onContainerLayout = this.onContainerLayout.bind(this);
  }

  render() {
    const { containerStyle } = this.props;

    return (
      <View
        style={[
          styles.container,
          StyleSheet.flatten(containerStyle),
          // !this.state.containerWidth && styles.invisible,
        ]}
        onLayout={this.onContainerLayout}
      >
        {this.renderTabs()}
        {this.renderUnderline()}
      </View>
    );
  }

  renderTabs() {
    const {
      activeTab,
      activeTabStyle,
      activeTabTextStyle,
      onTabSelect,
      tabStyle,
      tabTextStyle,
    } = this.props;

    return this.props.tabs.map((tab, index) => {
      const isActiveTab = activeTab === index;

      return (
        <TouchableOpacity
          key={`tab-${tab.title}`}
          onPress={() => onTabSelect && onTabSelect(index)}
          style={[
            styles.tab,
            tabStyle,
            isActiveTab && activeTabStyle
          ]}
        >
          <Text
            style={[
              styles.tabText,
              tabTextStyle,
              isActiveTab && activeTabTextStyle
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      );
    });
  }

  renderUnderline() {
    const {
      tabs,
      scrollXAnim,
    } = this.props;
    const {
      containerWidth,
    } = this.state;
    const len = tabs.length;

    if (!containerWidth || !scrollXAnim || len === 0) return;

    return (
      <Animated.View
        style={[
          styles.underline,
          {
            left: 0,
            transform: [{ translateX: this.getUnderlineAnim() }],
            width: containerWidth / len,
          },
        ]}
      />
    );
  }

  getUnderlineAnim() {
    const {
      scrollXAnim,
      tabs,
    } = this.props;
    const len = tabs.length;

    return scrollXAnim.interpolate({
      inputRange: [0, len - 1],
      outputRange: [0, ((len - 1) * this.state.containerWidth) / len],
    });
  }

  onContainerLayout({ nativeEvent: { layout: { width } } }) {
    if (this.state.containerWidth !== width) {
      this.setState(() => ({ containerWidth: width }));
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invisible: {
    opacity: 0,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabText: {
    color: '#d4d4d4',
  },
  underline: {
    backgroundColor: 'white',
    bottom: 0,
    height: 4,
    position: 'absolute',
  },
});
