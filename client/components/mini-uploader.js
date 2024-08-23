import DOMPurify from 'dompurify';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

const preventDrag = (/** @type {DragEvent} */ event) => {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'none';
};

class MiniUploader extends LitElement {
  @property({ type: Boolean })
  accessor multiple = false;

  @property()
  accessor directory;

  @property()
  accessor accept;

  @property({ type: Object })
  accessor target;

  constructor() {
    super();

    this.inputRef = createRef();
  }

  render() {
    return html`
      <input
        type="file"
        name="files[]"
        ?multiple=${ifDefined(this.multiple)}
        @change=${this.handleFileChange}
        directory=${ifDefined(this.directory)}
        webkitdirectory=${ifDefined(this.directory)}
        accept=${ifDefined(this.accept)}
        ${ref(this.inputRef)}
      />
    `;
  }

  handleDragOver = (/** @type {DragEvent} */ event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

    this.dispatchEvent(new Event('dragover'));
  };

  handleDrop = (/** @type {DragEvent} */ event) => {
    event.stopPropagation();
    event.preventDefault();
    this.handleFilesSelect(event);
  };

  connectedCallback() {
    super.connectedCallback();

    if (this.target) {
      document.addEventListener('dragover', preventDrag, false);
      this.target.addEventListener('dragover', this.handleDragOver, false);
      this.target.addEventListener('drop', this.handleDrop, false);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.target) {
      document.removeEventListener('dragover', preventDrag, false);
      this.target.removeEventListener('dragover', this.handleDragOver, false);
      this.target.removeEventListener('drop', this.handleDrop, false);
    }
  }

  show() {
    // @ts-ignore
    this.inputRef.value.click();
  }

  handleFilesSelect = async (/** @type {DragEvent} */ event) => {
    const files = event.dataTransfer
      ? [...event.dataTransfer.files]
      : [...event.target['files']];

    if (this.multiple) {
      files?.length > 0 &&
        this.dispatchEvent(new CustomEvent('upload', { detail: { files } }));
    } else {
      const file = files[0];

      if (file) {
        file.filename = DOMPurify.sanitize(file.name);

        const data = await file.text();

        this.dispatchEvent(
          new CustomEvent('upload', { detail: { result: { file, data } } }),
        );
      }
    }

    // @ts-ignore
    this.inputRef.value.value = '';
  };

  /**
   * @param {DragEvent} event
   */
  handleFileChange(event) {
    event.stopPropagation();
    event.preventDefault();

    this.handleFilesSelect(event);
  }
}

@customElement('mini-uploader')
export class AppMiniUploader extends MiniUploader {
  static styles = css`
    :host {
      display: inline-block;
    }

    input[type='file'] {
      display: none;
    }
  `;
}
