import { LitElement, html, property } from '@polymer/lit-element';

export class AmTimePicker extends LitElement {
  @property({ type : Boolean, attribute : 'enable-seconds' }) enableSeconds = false;
  @property({ type : Number }) hour = 0;
  @property({ type : Number }) minute = 0;
  @property({ type : String }) period = 'AM';
  @property({ type : Number }) second = 0;
  @property({ type : String }) time = '00:00';
  @property({ type : Number }) value = 0;
  @property({ type : String }) view = 'hours';
  
  constructor() {
    super();
  }
  render() {
    return html`

    `;
  }
}

customElements.define('am-time-picker', AmTimePicker);