/*
 * Create Change
 * Supporting creative industries through research, innovation
 * and development initiatives since 2019.
 *
 * @link https://createchange.ro
 * @author Eugen Bușoiu
 *
 * Copyright 2019-2022 All rights reserved.
 */

'use strict';

/**
 * Dialog.js is a multipurpose lightweight highly configurable dialog library.
 *
 * @author Eugen Bușoiu <eugen@eugen.pro>
 * @link https://github.com/eugenb/dialog.js
 *
 * @licence MIT <https://raw.githubusercontent.com/eugenb/dialog.js/master/LICENSE>
 */

'use strict';

class Dialog {

    /**
     * Dialog constructor.
     *
     * @param body Dialog content
     * @param args Dialog arguments
     */
    constructor(body, args) {

        // Default options
        this.options = {

            // Styling classes
            dialogClassName: null,
            dialogPlaceholderClassName: null,

            // Size
            size: {
                x: 0,
                y: 0
            },
            position: {},

            // Automatically trigger dialog show
            autoShow: true,

            // Events
            autoClose: false,
            closeOnEsc: true,
            closeOnOutsideClick: true,

            // Callbacks
            callback: {
                onBeforeShow: null,
                onShow: null,
                onClose: null
            },

            // Attach dialog relative to element
            linkTo: null
        };

        // Extend options
        this.options = Object.assign(this.options, args);

        // Create dialog
        this.create(body);
    }

    /**
     * Checks if given element is a child of given dialog.
     *
     * @param elem Element
     * @param dialog Dialog parent
     * @return {boolean}
     */
    static isChild(elem, dialog) {

        // Get descendents
        let d = dialog.getElementsByTagName('*');
        for (let i = 0; i < d.length; i++) {
            if (d[i] === elem) {
                return true;
            }
        }
        return false;
    }

    /**
     * Close all open dialogs.
     */
    static closeAll() {

        // Close all open dialogs
        document.querySelectorAll('[dialog-id]').forEach(dlg => {
            if (typeof dlg.close === 'function') {
                dlg.close();
            }
        });
    }

    /**
     * Creates dialog.
     *
     * @param body Dialog content
     */
    create(body) {

        // Elements
        this.dlg = document.createElement('div');
        this.dlgPlaceholder = document.createElement('div');

        // Apply default classes
        this.dlgPlaceholder.classList.add('dialog-placeholder');
        this.dlg.classList.add('dialog');

        // Apply given classes
        if (this.options.dialogPlaceholderClassName !== null) {
            this.dlgPlaceholder.classList.add(this.options.dialogPlaceholderClassName);
        }

        if (this.options.dialogClassName !== null) {
            this.dlg.classList.add(this.options.dialogClassName);
        }

        // Set dialog placeholder attributes
        this.dlgPlaceholder.setAttribute('dialog-id', Math.random().toString(36).substr(2, 9));
        this.dlgPlaceholder.style.visibility = 'hidden';

        // Set dialog attributes
        this.dlg.setAttribute('dialog-id', Math.random().toString(36).substr(2, 9));

        // Set dialog body
        this.dlg.innerHTML = body;

        // Append dialog
        document.body.appendChild(this.dlgPlaceholder);

        // Calculate viewport size(s)
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

        // Render dialog attached to an existing element
        if (this.options.linkTo !== null) {

            // Move dialog next to linkTo element
            this.options.linkTo.parentNode.insertBefore(this.dlg, this.options.linkTo.nextSibling);

            // Set position coordinates based on linked element coords
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` : 0;
            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` : 0;
        } else {

            // Append dialog to placeholder
            this.dlgPlaceholder.appendChild(this.dlg);

            // Get dialog width
            const dlgStyle = getComputedStyle(this.dlg),
                dlgStyleWidth = dlgStyle.getPropertyValue('width'),
                dlgStyleHeight = dlgStyle.getPropertyValue('height');

            // Calculate sizes
            this.options.size = {
                x: dlgStyleWidth.match(/px/) ?
                    parseInt(dlgStyleWidth.replace(/px/, '')) :
                    dlgStyleWidth.match(/%/) ? (viewportWidth * parseInt(dlgStyleWidth.replace(/%/, ''))) / 100 : this.dlg.offsetWidth,
                y: dlgStyleHeight.match(/px/) ?
                    parseInt(dlgStyleHeight.replace(/px/, '')) :
                    dlgStyleHeight.match(/%/) ? (viewportHeight * parseInt(dlgStyleHeight.replace(/%/, ''))) / 100 : this.dlg.offsetHeight
            };

            // Set position coordinates based on provided values
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` :
                `${(viewportWidth - parseInt(this.options.size.x)) / 2}px`;

            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` :
                `${(viewportHeight - parseInt(this.options.size.y)) / 2}px`;
        }

        // AutoClose
        if (this.options.autoClose) {
            setTimeout(() => {
                this.close()
            }, parseInt(this.options.autoClose) * 1000);
        }

        // Close dialog on escape
        if (this.options.closeOnEsc) {
            document.addEventListener('keyup', e => {

                let key = e.code,
                    target = e.target;

                if (target.nodeType === 3) {
                    target = target.parentNode;
                }

                if (!/(ArrowUp|ArrowDown|Escape|Space)/.test(key) || /input|textarea/i.test(target.tagName)) {
                    return;
                }

                if (key === 'Escape' && this.isVisible()) {
                    this.close();
                }
            });
        }

        // Close dialog when outside click
        if (this.options.closeOnOutsideClick) {
            this.dlgPlaceholder.addEventListener('click', e => {

                let target = e.target;

                if (this.isVisible() && target !== this.dlg && !Dialog.isChild(target, this.dlg)) {
                    this.close();
                }
            });
        }

        // Attach callbacks
        Object.defineProperty(this.dlg, 'show', {
            value: () => {

                // Trigger onBeforeShow callback
                if (typeof this.options.callback.onBeforeShow === 'function') {
                    this.options.callback.onBeforeShow();
                }

                // Show dialog
                this.dlgPlaceholder.style.visibility = 'visible';

                // Trigger onBeforeShow callback
                if (typeof this.options.callback.onShow === 'function') {
                    this.options.callback.onShow();
                }
            },
            configurable: true
        });

        Object.defineProperty(this.dlg, 'close', {
            value: () => {

                // Remove dialog
                if (this.isVisible()) {

                    // Trigger onClose callback
                    if (typeof this.options.callback.onClose === 'function') {
                        this.options.callback.onClose();
                    }

                    // Remove dialog
                    this.dlg.parentNode.removeChild(this.dlg);

                    // Remove dialog placeholder
                    this.dlgPlaceholder.parentNode.removeChild(this.dlgPlaceholder);
                    this.dlgPlaceholder = null;
                }
            },
            configurable: true
        });

        // Show dialog (if autoShow is true)
        if (this.options.autoShow) {
            this.show();
        }
    }

    /**
     * Checks if dialog is visible.
     *
     * @return {boolean}
     */
    isVisible() {
        return this.dlgPlaceholder && !(this.dlgPlaceholder.style.visibility === 'visible');
    }

    /**
     * Checks if dialog has been created.
     *
     * @return {boolean}
     */
    isCreated() {
        return this.dlgPlaceholder !== null;
    }

    /**
     * Closes dialog.
     */
    close() {
        this.dlg.close();
    }

    /**
     * Show dialog (if hidden)
     */
    show() {
        this.dlg.show();
    }
}

/**
 * Create Change application.
 * @type {{slide: slideMenu}}
 */
const CreateChangeApp = (() => {

    /**
     * Enable slide menu for mobile devices.
     */
    function slideMenu() {

        let slideMenuTrigger = document.querySelector('.btn-menu'),
            slideMenu = document.querySelector('.slide-menu');

        if (slideMenuTrigger && slideMenu) {
            slideMenuTrigger.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();

                // Slide dialog
                const dlg = new Dialog(slideMenu.innerHTML, {
                        dialogClassName: 'slide-menu-dialog',
                        dialogPlaceholderClassName: 'slide-menu-dialog-placeholder',
                        position: {
                            x: 0,
                            y: 0
                        },
                        callback: {
                            onShow: () => {
                                document.body.classList.add('no-scroll');
                            },
                            onClose: () => {
                                document.body.classList.remove('no-scroll');
                            }
                        }
                    }
                );

                // Attach event on slide close
                let slideMenuCloseButton = dlg.dlg.querySelector('button.btn-slide-close');
                if (slideMenuCloseButton) {
                    slideMenuCloseButton.addEventListener('click', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        dlg.close();
                    });
                }
            });
        }
    }

    /**
     * Exposed methods.
     */
    return {
        slide: slideMenu
    };

})();

/**
 * Initialize app.
 */
(() => {
    CreateChangeApp.slide();
})();