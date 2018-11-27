import { LitElement, html, property } from '@polymer/lit-element';

interface Coordinate {
  x: number;
  y: number;
}
export enum ClockFaceView {
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}
export class AmClockSelector extends LitElement {
  @property() public animated : Boolean = false;
  private _view : ClockFaceView = ClockFaceView.Hours;
  @property()
  set view(value) {
    this._view = value;
    this.numbers = this.__getNumbers(value);
  }
  get view(): ClockFaceView {
    return this._view;
  }
  @property() public count: number = 0;
  @property() public position: Coordinate;
  @property() public selected: number = 0;
  @property() public step : number = 1;
  @property() public useZero : Boolean = false;
  @property() public zeroPad : Boolean = false;
  @property() public numbers : Array<string> = [];

  render() {
    return html`
      <style>
        :host {
          position: relative;
        }
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
        .clock-number {
          position: absolute;
          transform: translate(-50%, -50%);
          color: rgb(255, 255, 255); 
          mix-blend-mode: difference;
          font-size: 10pt;
        }
        .clock-marker {
          transform: translate(-50%, -50%);
          position: absolute;
          background-color: blue;
          height: 26px;
          width: 26px;
          border-radius: 100%;
        }
      </style>
      <div class="clock-face" @click="${this.__positionMarker.bind(this)}">
        ${this.__getMarker(this.position)}
        ${this.__getNumbers(this.view).map(this.__displayNumbers)}
      </div>
    `;
  }
  /**
   * Generates a template partial for the marker to be placed on the clock face
   * @param position 
   */
  __getMarker(position: Coordinate) {
    // TODO: switch to using transform: translate for positioning
    return (position && position.x && position.y) ? html`
      <span class="clock-marker" style = "left: ${position.x}px; top: ${position.y}px;"></span>
    ` : '';
  }
  /**
   * Positions the marker on the clock face based on the click event location
   * @param event
   */
  __positionMarker(event) {
    this.position = {
      x: event.offsetX,
      y: event.offsetY
    };
  }
  /**
   * Creates a template partial to render one of the numbers on the clock face
   * @param number 
   * @param index 
   * @param numbers 
   */
  __displayNumbers(number: string, index: number, numbers: Array<string>) {
    const radius = (150 - 30) / 2;
    const angle = 2 * Math.PI * (numbers.length - index) / numbers.length;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    // TODO: switch to using transform: translate for positioning
    // TODO: move updates of styles into the style block?
    return html`
      <div class="clock-number" style="top: calc(50% + ${-x}px); left: calc(50% + ${-y}px)">${number}</div>
    `;
  }
  /**
   * Creates an array of all of the clock face number values to display
   * @param view 
   */
  __getNumbers(view: string): Array<string> {
    const numbers: Array<string> = [];
    let step;
    let start;
    let maxNumber;
    switch (view) {
      case ClockFaceView.Hours:
        maxNumber = 12;
        step = 1;
        start = 1
        break;
      case ClockFaceView.Minutes:
      case ClockFaceView.Seconds:
        maxNumber = 55;
        step = 5;
        start = 0;
        break;
    }
    while(start <= maxNumber) {
      numbers.push(('0' + start).slice(-2));
      start += step;
    }
    return numbers;
  }
}

customElements.define('am-clock-selector', AmClockSelector);