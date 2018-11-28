import { LitElement, html, property } from '@polymer/lit-element';

// TODO:
// * Add selection marker snapping based on steps
// * Add swipe support
// * Add bar between center and selection marker
// * Add dot in center of selection marker when not on a number
// * Using some magic numbers (width based mostly) switch to dynamic
// * Add selection logic
// * Bind the different values together in a shared interface for "time to number mapping"
// * Add animations
// * Set default selection based on view
// * Add a butt load of css variables
// * Add browser variants on styles (Chrome, FF, IE11, Edge, Safari)
// * Test me!

export interface ClockFace {
  selectionStep: number;
  startValue: number;
  stopValue: number;
  visualStep: number;
  padValue: ((value: number) => (number | string)) | null;
}
export enum ClockFaceView {
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}
export interface ClockNumber {
  angle: number;
  position: Coordinate;
  value: number | string;
  visible: boolean;
}
export interface Coordinate {
  x: number;
  y: number;
}
export class AmClockSelector extends LitElement {
  private _view: ClockFaceView;
  @property()
  set view(value) {
    this._view = value;
    this.numbers = this.__getNumbers(this.views[value]);
  }
  get view(): ClockFaceView {
    return this._view;
  }
  @property() public views: Record<ClockFaceView, ClockFace> = {
    [ClockFaceView.Hours]: {
      selectionStep: 1,
      visualStep: 1,
      startValue: 1,
      stopValue: 12,
      padValue: null,
    },
    [ClockFaceView.Minutes]: {
      selectionStep: 1,
      visualStep: 5,
      startValue: 0,
      stopValue: 59,
      padValue: (value: number) => {
        return (new String(value)).padStart(2, '0');
      },
    },
    [ClockFaceView.Seconds]: {
      selectionStep: 1,
      visualStep: 5,
      startValue: 0,
      stopValue: 59,
      padValue: (value: number) => {
        return (new String(value)).padStart(2, '0');
      },
    },
  };

  @property() private numbers: Array<ClockNumber> = [];
  @property() private position: Coordinate = { x: 0, y: 0 };

  constructor() {
    super();
    this.view = ClockFaceView.Hours;
  }
  render() {
    return html`
      <style>
        .clock-face {
          position: relative;
          width: var(--clock-size, 150px);
          height: var(--clock-size, 150px);
          background-color: var(--clock-face-color, #E0E0E0);
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
        .clock-number, .clock-marker {
          position: absolute;
          top: 50%;
          left: 50%;
        }
        .clock-number {
          color: rgb(255, 255, 255); 
          mix-blend-mode: difference;
          font-size: 10pt;
        }
        ${
          this.numbers.filter(({ visible }) => { return visible; }).map(({ position }, index) => {
            return html`.clock-number.position-${index} { transform: translate(${(position as Coordinate).x - 8}px, ${(position as Coordinate).y - 8}px); }`;
          })
        }
        .clock-marker {
          background-color: blue;
          border-radius: 100%;
          height: 26px;
          width: 26px;
          transform: translate(${this.position.x - 13}px, ${this.position.y - 13}px);
        }
      </style>
      <div class="clock-face" @click="${this.__positionMarker.bind(this)}">
        <span class="clock-marker"></span>
        ${
          this.numbers.filter(({ visible }) => { return visible; }).map(({ value }, index) => {
            return html`<div class="clock-number position-${index}">${value}</div>`;
          })
        }
      </div>
    `;
  }
  /**
   * Converts a radius and angle into x/y coordinates
   * @param radius 
   * @param angle 
   */
  __getCoordinates(radius: number, angle: number) {
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    }
  }
  /**
   * Positions the marker on the clock face based on the click event location
   * @param event
   */
  __positionMarker(event) {
    const opposite = event.offsetY - (150 / 2);
    const adjacent = event.offsetX - (150 / 2);
    this.position = this.__getCoordinates((150 - 30) / 2, Math.atan2(opposite, adjacent));
  }
  /**
   * Creates an array of all of the clock face number values to display
   * @param view 
   */
  __getNumbers({ padValue, selectionStep, startValue, stopValue, visualStep }: ClockFace): Array<ClockNumber> {
    const numbers: Array<ClockNumber> = [];
    let value = startValue;
    while (value <= stopValue) {
      const angle = (2 * Math.PI * value / (stopValue - startValue + 1)) - Math.PI / 2;
      numbers.push({
        angle,
        position: this.__getCoordinates((150 - 30) / 2, angle),
        value: padValue ? padValue(value) : value,
        visible: (value % visualStep) === 0,
      });
      value += selectionStep;
    }
    return numbers;
  }
}

customElements.define('am-clock-selector', AmClockSelector);