import { LitElement, html, property } from '@polymer/lit-element';

// TODO:
// * Add drag / swipe support
// * Add dot in center of selection arm when not on a number
// * Using some magic numbers (width based mostly) switch to dynamic
// * Add a butt load of css variables
// * Add browser variants on styles (Chrome, FF, IE11, Edge, Safari)
// * Test me!

export interface ClockFace {
  selectionStep: number;
  startValue: number;
  stopValue: number;
  visualStep: number;
  toNumber: ((value: string) => number);
  toString: ((value: number) => string);
  property: string;
}
export enum ClockFaceView {
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}
export interface ClockNumber {
  angle: number;
  position: Coordinate;
  label: string;
  value: number;
  visible: boolean;
}
export interface Coordinate {
  x: number;
  y: number;
}
export class AmClockSelector extends LitElement {
  @property({ // FIXME: the default deserializer for Array doesn't work
    type: {
      fromAttribute: (value) => {
        let result;
        try {
          result = JSON.parse(value);
        } catch (x) {
          result = value;
          console.warn(`Could not JSON.parse value ${value}`);
        }
        return result;
      },
      toAttribute: (value) => {
        try {
          return JSON.stringify(value);
        } catch (x) {
          console.warn(`Could not JSON.stringify value ${value}`);
          return '';
        }
      }
    }
  })
  set faceOrder(value: Array<ClockFaceView>) {
    this._faceOrder = value;
    this.view = value[0];
  }
  get faceOrder(): Array<ClockFaceView> {
    return this._faceOrder;
  }
  @property()
  set hours(value: number) {
    if (value !== this._hours) {
      this._hours = value;
      this.value = this.__calculateValues(this.faceOrder, this.views, this.valueDelimiter);
      this.__updateArm(this.view, this.numbers);
    }
  }
  get hours(): number {
    return this._hours;
  }
  @property()
  set minutes(value: number) {
    if (value !== this._minutes) {
      this._minutes = value;
      this.value = this.__calculateValues(this.faceOrder, this.views, this.valueDelimiter);
      this.__updateArm(this.view, this.numbers);
    }
  }
  get minutes(): number {
    return this._minutes;
  }
  @property()
  set seconds(value: number) {
    if (value !== this._seconds) {
      this._seconds = value;
      this.value = this.__calculateValues(this.faceOrder, this.views, this.valueDelimiter);
      this.__updateArm(this.view, this.numbers);
    }
  }
  get seconds(): number {
    return this._seconds;
  }
  @property()
  set value(value: string) {
    if (value !== this._value) {
      this._value = value;
      this.__parseValue(value, this.valueDelimiter, this.views, this.faceOrder);
      console.log('value', value);
    }
  }
  get value(): string {
    return this._value;
  }
  @property() public valueDelimiter: string = ':';
  @property()
  set view(value: ClockFaceView) {
    this._view = value;
    this.numbers = this.__getNumbers(this.views[value]);
    this.__updateArm(value, this.numbers);
  }
  get view(): ClockFaceView {
    return this._view;
  }
  @property()
  public views: Record<ClockFaceView, ClockFace> = {
    [ClockFaceView.Hours]: {
      property: 'hours',
      startValue: 1,
      selectionStep: 1,
      stopValue: 12,
      toNumber(value: string): number {
        return Number(value);
      },
      toString(value: number): string {
        return value.toString();
      },
      visualStep: 1,
    },
    [ClockFaceView.Minutes]: {
      property: 'minutes',
      startValue: 0,
      selectionStep: 1,
      stopValue: 59,
      toNumber(value: string): number {
        return Number(value);
      },
      toString(value: number): string {
        return value.toString().padStart(2, '0');
      },
      visualStep: 5,
    },
    [ClockFaceView.Seconds]: {
      property: 'seconds',
      startValue: 0,
      selectionStep: 1,
      stopValue: 59,
      toNumber(value: string): number {
        return Number(value);
      },
      toString(value: number): string {
        return value.toString().padStart(2, '0');
      },
      visualStep: 5,
    },
  };

  @property() private numbers: Array<ClockNumber> = [];
  @property() private _angle: number;

  private _faceOrder: Array<ClockFaceView>;
  private _hours: number = 12;
  private _minutes: number = 0;
  private _seconds: number = 0;
  private _value: string;
  private _view: ClockFaceView;

  constructor() {
    super();
    if (!this.faceOrder) {
      this.faceOrder = [
        ClockFaceView.Hours,
        ClockFaceView.Minutes,
        ClockFaceView.Seconds,
      ];
    }
  }
  render() {
    return html`
      <style>
        :host {
          user-select: none;
        }
        .clock-face {
          position: relative;
          width: var(--clock-size, 150px);
          height: var(--clock-size, 150px);
          background-color: var(--clock-face-color, #E0E0E0);
        }
        .clock-face::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          background-color: blue;
          border-radius: 100%;
          height: 4px;
          width: 4px;
          transform: translate(-50%, -50%);
        }
        .clock-face, .clock-face::after {
          border-radius: 100%;
          cursor: pointer;
        }
        .clock-face::after {
          position: absolute;
          content: "";
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .clock-number {
          position: absolute;
          top: 50%;
          left: 50%;
        }
        .clock-number {
          color: rgb(255, 255, 255); 
          mix-blend-mode: difference;
          font-size: 10pt;
          text-align: center;
          width: 30px;
        }
        ${
          this.numbers.filter(({ visible }) => { return visible; }).map(({ position }, index) => {
            return html`.clock-number.position-${index} { transform: translate(${(position as Coordinate).x}px, ${(position as Coordinate).y}px); }`;
          })
        }
        .clock-arm {
          border-radius: 100%;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          transform: rotate(${this._angle}deg);
          transition: 0.5s ease-in-out;
        }
        .clock-arm::after {
          position: absolute;
          content: '';
          background-color: blue;
          height: 26px;
          width: 26px;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 100%;
        }
        .clock-arm::before {
          position: absolute;
          content: '';
          background-color: blue;
          width: 1px;
          height: calc(50% - 15px);
          margin-top: 15px;
          margin-bottom: 50%;
          left: 50%;
          transform: translateX(-50%);
        }
      </style>
      <div class="clock-face" @click="${this.__positionArm.bind(this)}">
        <div class="clock-arm"></div>
        ${
          this.numbers.filter(({ visible }) => { return visible; }).map(({ label }, index) => {
            return html`<div class="clock-number position-${index}">${label}</div>`;
          })
        }
      </div>
    `;
  }
  /**
   * Moves to the next clock face option
   */
  nextFace() {
    let index = this.faceOrder.findIndex((face) => {
      return face === this.view;
    });
    if (typeof index === 'undefined') {
      index = 0;
    } else {
      index += 1;
    }
    if (index >= this.faceOrder.length) {
      index -= this.faceOrder.length;
    }
  }
  /**
   * Takes in the views and delimiter then parses them into a single value string
   * @param faceOrder the list of faces to use
   * @param views all clock face views
   * @param delimiter the delimiter between parts of the value
   */
  __calculateValues(faceOrder: Array<ClockFaceView>, views: Record<ClockFaceView, ClockFace>, delimiter: string): string {
    return faceOrder.reduce((acc: string, key: string): string => {
      const view = views[key];
      const value = this[view.property];
      if (acc) {
        acc += delimiter;
      }
      acc += view.toString(value);
      return acc;
    }, '');
  }
  /**
   * Converts a radius and angle into x/y coordinates
   * @param radius 
   * @param angle 
   * @param xOffset the shift to add to x values
   * @param yOffset the first to add to y values
   */
  __getCoordinates(radius: number, angle: number, xOffset: number = 0, yOffset: number = 0): Coordinate {
    return {
      x: radius * Math.cos(angle) + xOffset,
      y: radius * Math.sin(angle) + yOffset,
    }
  }
  /**
   * Parses a value string into it's parts based on the clock face views
   * @param value the value string to parse
   * @param delimiter the delimiter used to break out the parts of the value string
   * @param views the available ClockFaceViews
   */
  __parseValue(value: string, delimiter: string, views: Record<ClockFaceView, ClockFace>, viewOrder: Array<ClockFaceView>) {
    const parts = value.split(delimiter);
    parts.forEach((part, index) => {
      if (index >= viewOrder.length) { return; }

      const { property, toNumber } = views[viewOrder[index]];
      this[property] = toNumber(part);
    });
  }
  /**
   * Positions the arm on the clock face based on the click event location
   * @param event
   */
  __positionArm(event) {
    let angle = Math.atan2(event.offsetY - (150 / 2), event.offsetX - (150 / 2));
    const face = this.views[this.view];
    const value = this.numbers.sort((a, b) => {
      return Math.abs(a.angle - angle) - Math.abs(b.angle - angle);
    })[0];
    this[face.property] = value.value;
    this._angle = this.__radToDeg(value.angle);

    this.nextFace();
  }
  /**
   * Updates the arm position based on the new selection reference
   * @param view the currently active ClockFaceView
   * @param numbers the possible number options
   */
  __updateArm(view: ClockFaceView, numbers: Array<ClockNumber>) {
    const { property } = this.views[view];
    const value = numbers.find(({ value }) => {
      return value === this[property];
    });
    this._angle = this.__radToDeg(value.angle);
  }
  /**
   * Creates an array of all of the clock face number values to display
   * @param view 
   */
  __getNumbers({ toString, selectionStep, startValue, stopValue, visualStep }: ClockFace): Array<ClockNumber> {
    const numbers: Array<ClockNumber> = [];
    let value = startValue;
    while (value <= stopValue) {
      let angle = 2 * Math.PI * value / (stopValue - startValue + 1) - (Math.PI / 2); // Calculate the angle from center starting at the top
      if (angle > Math.PI) { // atan2 later requires us to use the right side as start so the top left quadrant needs to be negative
        angle -= 2 * Math.PI;
      }
      numbers.push({
        angle,
        position: this.__getCoordinates((150 - 30) / 2, angle, -30 / 2, -30 / 2 / 2),
        label: toString(value),
        value,
        visible: (value % visualStep) === 0,
      });
      value += selectionStep;
    }
    return numbers;
  }
  /**
   * Converts radians to degrees
   * @param radian
   * @param offset radian offset to inject for shifter from standard 0rad to web 0deg
   */
  __radToDeg(radian: number, offset: number = Math.PI / 2): number {
    return (radian + offset) * 180 / Math.PI;
  }
}

customElements.define('am-clock-selector', AmClockSelector);