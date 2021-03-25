/**
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
  Platform
} from 'react-native';

type Props = {
  value: number,
  disabled: boolean,
  min: number,
  max: number,
  onChange: (value: number) => void,
  onComplete: (value: number) => void,
  width: number,
  height: number,
  borderRadius: number,
  showBallIndicator: boolean,
  step?: number,
  ballIndicatorColor?: string,
  ballIndicatorWidth?: number,
  ballIndicatorPosition?: number,
  ballIndicatorTextColor?: string,
  unitSymbol: string,
  scaleColor: string,
  scaleWidth: number,
};


type State = {
  value: number,
  sliderHeight: any,
  ballHeight: any,
  panResponder: any
};

export default class VerticalScroller extends Component<Props, State> {
  _moveStartValue = null;
  arrScaleItems = [];

  constructor(props: Props) {
    super(props);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {
        this._moveStartValue = this.state.value;
      },
      onPanResponderMove: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      }
    });

    this.state = {
      value: props.value,
      sliderHeight: new Animated.Value(0),
      ballHeight: new Animated.Value(0),
      panResponder
    };
  }

  _renderArrow = () => {
    const {ballIndicatorColor} = this.props;

    return (
      <View style={{marginTop: 0, marginHorizontal: 0}}>
        <View style={{position: 'relative'}}>
          <View style={{position: 'absolute', top: -19, left: -40}}>
            <View
              style={
                {borderBottomWidth: 0,
                  borderLeftWidth: 0,
                  backgroundColor: ballIndicatorColor,
                  width: 10,
                  height: 10,
                  transform: [{rotate: '45deg'}]}}
            >
            </View>
          </View>
        </View>
      </View>
    );
  };

  _getScale() {
    this.arrScaleItems = [];
    for (let cnt = this.props.min; cnt < this.props.max; cnt += this.props.step) {
      this.arrScaleItems.push(cnt);
    }
  }

  _fetchNewValueFromGesture(gestureState: any): number {
    const {min, max, step, height} = this.props;
    const ratio = -gestureState.dy / height;
    const diff = max - min;
    if (step) {
      return Math.max(
        min,
        Math.min(
          max - 1,
          this._moveStartValue + Math.round((ratio * diff) / step) * step
        )
      );
    }
    const value = Math.max(min, this._moveStartValue + ratio * diff);
    return Math.floor(value * 100) / 100;
  }

  _getSliderHeight(value: number): number {
    const {min, max, height} = this.props;
    return ((value - min) * height) / (max - min);
  }

  _changeState(value: number): void {
    const {height, ballIndicatorWidth} = this.props;
    const sliderHeight = this._getSliderHeight(value);
    let ballPosition = sliderHeight;
    const ballHeight = (ballIndicatorWidth ? ballIndicatorWidth : 48) / 2;
    if (ballPosition + ballHeight > height) {
      ballPosition = height - ballHeight * 2;
    } else if (ballPosition - ballHeight <= 0) {
      ballPosition = 0;
    } else {
      ballPosition -= ballHeight;
    }
    Animated.parallel([
      Animated.timing(this.state.sliderHeight, {
        toValue: sliderHeight,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(this.state.ballHeight, {
        toValue: ballPosition,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ]).start();
    this.setState({value});
  }

  componentDidMount(): void {
    const {value} = this.props;
    if (value) {
      this._changeState(value);
    }
  }

  render() {
    const {
      max,
      width,
      height,
      showBallIndicator,
      ballIndicatorColor,
      ballIndicatorWidth,
      ballIndicatorPosition,
      ballIndicatorTextColor,
      unitSymbol,
      scaleColor,
      scaleWidth
    } = this.props;

    const C_HEIGHT = height - ((Platform.OS === 'ios') ? 26 : 28);
    return (
      <View style={[{height, width}]}>
        <View
          style={[
            styles.container,
            {
              height,
              width,
              backgroundColor: 'transparent'
            }
          ]}
          {...this.state.panResponder.panHandlers}
        >
          {
            this._getScale()
          }
          <View style={{width: scaleWidth, left: 100, top: (height / 2 - (this.state.value * (height / max)))}}>
            {
              this.arrScaleItems.map((item, key) => {
                return (<View
                  style={[styles.scaleItem, {
                    backgroundColor: scaleColor,
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor: scaleColor,
                    position: 'absolute',
                    top: key * (height / max),
                    width: key % 5 ? '80%' : '100%'}]}
                  key={key} />);
              })
            }
          </View>
        </View>
        {showBallIndicator && (
          <Animated.View
            style={[
              styles.ball,
              {
                top: C_HEIGHT / 2, // C_HEIGHT - (this.state.value * (height / max)),
                width: ballIndicatorWidth ? ballIndicatorWidth : 70,
                height: 30,
                borderRadius: 4,
                bottom: this.state.ballHeight,
                left: ballIndicatorPosition ? ballIndicatorPosition : width,
                backgroundColor: ballIndicatorColor,
                textAlign: 'center'
              }
            ]}
          >
            <Text
              style={[
                styles.ballText,
                {
                  color: ballIndicatorTextColor
                }
              ]}
            >
              {this.state.value + (unitSymbol && unitSymbol !== '' ? unitSymbol : '')}
            </Text>
            {
              this._renderArrow()
            }
          </Animated.View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ballText: {
    width: '100%',
    textAlign: 'right',
    fontFamily: 'Maven Pro',
    fontSize: 18,
    padding: 2
  },
  container: {
    overflow: 'hidden'
  },
  slider: {
    position: 'absolute',
    bottom: 0
  },
  linearGradient: {
    width: '100%',
    height: '100%'
  }
});
