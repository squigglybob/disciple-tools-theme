import {html, css, LitElement, staticHtml, unsafeStatic, literal} from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';

export class SetupWizard extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
                font-size: 18px;
                line-height: 1.4;
                font-family: Arial, Helvetica, sans-serif;
            }
            /* Resets */
            /* Inherit fonts for inputs and buttons */
            input, button,
            textarea, select {
                font-family: inherit;
                font-size: inherit;
            }
            /* Set shorter line heights on headings and interactive elements */
            h1, h2, h3, h4,
            button, input, label {
                line-height: 1.1;
            }
            /* Box sizing rules */
            *,
            *::before,
            *::after {
                box-sizing: border-box;
            }
            /* Global */
            h1, h2, h3 {
                font-weight: 500;
                color: #3f729b;
            }
            button {
                border: none;
                padding: 0.5rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                background-color: #efefef;
                transition: background-color 120ms linear;
            }
            button:hover,
            button:active,
            button:focus {
                background-color: #cdcdcd;
            }
            select, input {
                padding: 0.2em 0.5em;
                border-radius: 8px;
                border: 2px solid #cdcdcd;
                background-color: white;
            }
            /* Composition */
            .wrap {
                padding: 1rem;
                min-height: 100vh;
            }
            .cluster {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space, 1rem);
                justify-content: flex-start;
                align-items: center;
            }
            .cluster[position="end"] {
                justify-content: flex-end;
            }
            .flow {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
            }
            .flow > * {
                margin-block: 0;
            }
            .flow > * + * {
                margin-block-start: var(--spacing, 1rem);
            }
            .grid {
                display: grid;
                grid-gap: 1rem;

                &[size="small"] {
                    --column-size: 100px;
                }
            }
            @supports (width: min(250px, 100%)) {
                .grid {
                    grid-template-columns: repeat(auto-fit, minmax(min(var(--column-size, 250px), 100%), 1fr));
                }
            }
            .cover {
                display: flex;
                flex-direction: column;
                min-block-size: 80vh;
            }

            .cover > * {
                margin-block: 0.5rem;
            }

            .cover > :first-child:not(.content) {
                margin-block-start: 0;
            }

            .cover > :last-child:not(.content) {
                margin-block-end: 0;
            }

            .cover > .content {
                margin-block-end: auto;
            }
            /* Utilities */
            .ms-auto {
                margin-left: auto;
            }
            .align-start {
                align-items: flex-start;
            }
            .white {
                color: white;
            }
            /* Blocks */
            .wizard {
                border-radius: 12px;
                border: 1px solid transparent;
                overflow: hidden;
                background-color: white;
                padding: 1rem;
            }
            .sidebar {
                background-color: grey;
                color: white;
                padding: 1rem;
            }
            .btn-primary {
                background-color: #3f729b;
                color: #fefefe;
            }
            .btn-primary:hover,
            .btn-primary:focus,
            .btn-primary:active {
                background-color: #366184;
            }
            .btn-card {
                background-color: #3f729b;
                color: #fefefe;
                padding: 1rem 2rem;
                box-shadow: 1px 1px 3px 0px #ababab;
            }
            .btn-card:focus,
            .btn-card:hover,
            .btn-card:active {
                background-color: #366184;
            }
            .input-group {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
            }
            .toggle {
                position: relative;
                display: inline-block;

                input {
                    display: none;
                }
                span {
                    display: inline-block;
                    padding-block: 1rem;
                    background-color: #cdcdcd;
                    border-radius: 8px;
                    width: 100%;
                    text-align: center;
                }
                input:checked + span {
                    background-color: #4caf50;
                    color: white;
                }
            }
            .breadcrumbs {
                --gap: 6rem;
                --divider-width: calc( var(--gap) / 2 );
                display: flex;
            }
            .breadcrumbs > * + * {
                margin-left: var(--gap);
            }
            .breadcrumbs > * + *:before {
                content: '';
                width: var(--divider-width);
                position: absolute;
                height: 3px;
                border-radius: 10px;
                background-color: #3F729B;
                left: calc( ( var(--gap) + var(--divider-width) ) / -2 - 2px );
                top: calc(50% - 1px);
            }
            .crumb {
                position: relative;
                width: 16px;
                height: 16px;
                border-radius: 100%;
                border: 2px solid #cdcdcd;
            }
            .crumb.complete {
                background-color: #3F729B;
                border-color: #3F729B;
            }
            .crumb.active {
                outline: 5px solid #3F729B;
                outline-offset: -10px;
            }
        `
    ];

    static get properties() {
        return {
            steps: { type: Array },
            currentStepNumber: { type: Number, attribute: false },
            decision: { type: String, attribute: false },
        };
    }

    constructor() {
        super()

        this.translations = setupWizardShare.translations
        this.steps = []
        this.currentStepNumber = 0

        const url = new URL(location.href)

        this.isKitchenSink = url.searchParams.has('kitchen-sink')
    }

    firstUpdated() {
        if (this.steps.length === 0 && setupWizardShare && setupWizardShare.steps && setupWizardShare.steps.length !== 0) {
            this.steps = setupWizardShare.steps
        }
    }

    render() {
        return html`
            <div class="wrap">
                <div class="wizard">
                    <h2>${this.translations.title}</h2>
                    ${
                        this.isKitchenSink
                            ? this.kitchenSink()
                            : html`
                                ${this.renderStep()}
                            `
                    }
                </div>
            </div>
        `;
    }


    back() {
        this.gotoStep(this.currentStepNumber - 1)
    }
    next() {
        this.gotoStep(this.currentStepNumber + 1)
    }
    gotoStep(i) {
        if ( i < 0 ) {
            this.currentStepNumber = 0
            return
        }
        if ( i > this.steps.length - 1 ) {
            /* TODO: Then we have finished the wizard and need to exit or show some completion message */
            this.currentStepNumber = this.steps.length - 1
            return
        }
        this.currentStepNumber = i;
        console.log(this.currentStepNumber)
    }

    renderStep() {
        if (this.steps.length === 0) {
            return
        }
        const step = this.steps[this.currentStepNumber]
        const { component } = step

        return staticHtml`
            <${unsafeStatic(component)}
                .step=${step}
                @back=${this.back}
                @next=${this.next}
            ></${unsafeStatic(component)}>
        `
    }

    renderDecision(component) {
        return html`
            <div class="decisions">
                ${component.description ? html`
                    <p>${component.description}</p>
                ` : ''}
                <div class="grid">

                ${component.options && component.options.length > 0
                    ? component.options.map((option) => html`
                        <button class="btn-card" data-key=${option.key} @click=${option.callback}>
                            <h3 class="white">${option.name}</h3>
                            <p>${option.description ?? ''}</p>
                        </button>
                    `) : ''
                }
                </div>
            </div>
        `
    }
    renderMultiSelect(component) {
        return html`
            <div class="multiSelect">
                ${component.description ? html`
                    <p>${component.description}</p>
                ` : ''}
                <div class="grid" size="small">
                    ${component.options && component.options.length > 0
                        ? component.options.map((option) => html`
                            <label class="toggle" for="${option.key}">
                                <input ?checked=${option.checked} type="checkbox" name="${option.key}" id="${option.key}">
                                <span>${option.name}</span>
                            </label>
                        `) : ''
                    }
                </div>
            </div>
        `
    }
    renderModuleDecision(component) {
        return html`
            <div class="decisions">
                ${component.description ? html`
                    <p>${component.description}</p>
                ` : ''}
                <div class="grid">
                    ${component.options && component.options.length > 0
                        ? component.options.map((option) => html`
                            <button class="btn-card" data-key=${option.key}>
                                <h3 class="white">${option.name}</h3>
                                <p>${option.description ?? ''}</p>
                            </button>
                        `) : ''
                    }
                </div>
            </div>
        `
    }
    renderFields(component) {
        return html`
            <div class="options">
                ${component.description ? html`
                    <p>${component.description}</p>
                ` : ''}
                <div class="flow">
                    ${component.options && component.options.length > 0
                        ? component.options.map((option) => html`
                            <div class="input-group">
                                <label for="${option.key}">${option.name}</label>
                                <input placeholder="${option.value}" type="text" name="${option.key}" id="${option.key}">
                            </div>
                        `) : ''
                    }
                </div>
            </div>
        `
    }

    renderControls() {
    }

    kitchenSink() {
        return html`
            <div class="flow">
                <h3>A cluster of buttons</h3>
                <div class="cluster">
                    <button>Bog standard button</button>
                    <button class="btn-primary">Primary button</button>
                </div>
                <h3>A grid of button cards</h3>
                <div class="grid">
                    <button class="btn-card">A button card</button>
                    <button class="btn-card">A button card</button>
                    <button class="btn-card">A button card</button>
                </div>
                <h3>Fields</h3>
                <div class="input-group">
                    <label for="foo">Foo</label>
                    <input placeholder="foo" type="text" name="foo" id="foo">
                </div>
                <div class="input-group">
                    <label for="bar">bar</label>
                    <input placeholder="bar" type="text" name="bar" id="bar">
                </div>
                <div class="input-group">
                    <label for="day">day</label>
                    <select name="day" id="day">
                        <option value="1">1</option>
                        <option value="any">any</option>
                        <option value="thing">thing</option>
                    </select>
                </div>
                <h3>Breadcrumbs</h3>
                <div class="breadcrumbs">
                    <div class="crumb complete" title="foo"></div>
                    <div class="crumb active" title="bar"></div>
                    <div class="crumb" title="day"></div>
                </div>

                <h3>Selectable items</h3>
                <div class="grid" size="small">
                    <label class="toggle">
                        <input type="checkbox">
                        <span>Name</span>
                    </label>
                    <label class="toggle">
                        <input type="checkbox">
                        <span>Gender</span>
                    </label>
                    <label class="toggle">
                        <input type="checkbox">
                        <span>Email</span>
                    </label>
                    <label class="toggle">
                        <input type="checkbox">
                        <span>Location</span>
                    </label>
                    <label class="toggle">
                        <input type="checkbox">
                        <span>Phone</span>
                    </label>
                </div>
                <h3>Stepper</h3>
                <div class="flow | stepper">
                    ${this.renderStep()}
                    <div class="cluster">
                        <button @click=${this.back}>Back</button>
                        <button @click=${this.next} class="btn-primary">Next</button>
                    </div>
                </div>
            </div>
        `
    }
}
customElements.define('setup-wizard', SetupWizard);