/* eslint-disable semi */
import React, { MouseEvent, RefObject } from 'react';
import { roundNum } from './utils';
import { applyDragForce, applyBoundForce } from './force';
import getBoundaries from './getBoundaries';
// TypeScript does not like using the import statement for non js/ts files
const styles = require('./styles.css');

type onFrameParams = { x: number; outerWidth: number; innerWidth: number; progress: number };
interface Props {
    friction: number;
    ResizeObserver: boolean;
    onFrame: (args: onFrameParams) => void;
    onStaticClick: (e: EventTarget | MouseEvent<any>) => void;
    disabled: boolean;
    className: string;
    style: any;
}
// address 'any' typing
type reactRef = string | ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined | any;
export default class Dragger extends React.Component<Props, { isDragging: boolean; restPositionX: number }> {
    draggerRefOuter: reactRef;
    draggerRefInner: reactRef;
    settings: { friction: number };
    leftBound: number;
    rightBound: number;
    docStyle: CSSStyleDeclaration;
    inputType: string;
    velocityX: number;
    downX: number;
    dragStartPosition: number;
    nativePosition: number;
    dragPosition: any;
    rafId: number | null;
    outerEl: any;
    innerEl: any;
    outerWidth: number;
    innerWidth: number;
    constructor(props: Props) {
        super(props);
        this.draggerRefOuter = React.createRef();
        this.draggerRefInner = React.createRef();

        this.settings = {
            friction: props.friction || 0.92
        };

        this.state = {
            restPositionX: 0,
            isDragging: false
        };

        this.leftBound = 0;
        this.rightBound = 0;

        this.docStyle = document.documentElement.style;
        this.inputType = '';
        this.velocityX = 0;
        this.downX = 0;
        this.dragStartPosition = 0;
        this.nativePosition = 0; // starting position
        this.dragPosition = this.nativePosition;
        this.rafId = null;

        this.outerEl = null;
        this.innerEl = null;
        this.outerWidth = 0;
        this.innerWidth = 0;
    }

    componentDidMount() {
        this.outerEl = this.draggerRefOuter.current;
        this.innerEl = this.draggerRefInner.current;
        // need to use scrollWidth instead of offsetWidth
        this.outerWidth = this.outerEl.scrollWidth;
        this.innerWidth = this.innerEl.scrollWidth;

        const { left, right } = getBoundaries({
            outerWidth: this.outerWidth,
            innerWidth: this.innerWidth,
            elClientLeft: this.outerEl.clientLeft
        });

        this.leftBound = left;
        this.rightBound = right;

        // Update the edge boundaries when the outer element is resized
        // Update the inner width when the children change size
        // Check first if ResizeObserver is available on the window or if a polyfill is supplied by the user via props
        if (!window.ResizeObserver && !this.props.ResizeObserver) {
            throw new Error('No ResizeObserver is available. Please check the docs for instructions on how to add a polyfill.');
        }

        const Ro = window.ResizeObserver || this.props.ResizeObserver;
        // address the 'any' typing of entries
        const observer = new Ro((entries: any[]) => {
            // use the elements ID to determine whether the inner or the outer has been observed
            const id = entries[0].target.dataset.id;
            if (id === 'Dragger-inner') this.innerWidth = entries[0].contentRect.width;
            if (id === 'Dragger-outer') this.outerWidth = entries[0].contentRect.width;

            const { left, right } = getBoundaries({
                outerWidth: this.outerWidth,
                innerWidth: this.innerWidth,
                elClientLeft: this.outerEl.clientLeft
            });

            this.leftBound = left;
            this.rightBound = right;

            // broadcast onFrame event on component mount, as well as when the inner or outer elements change size
            if (this.props.onFrame) {
                this.props.onFrame({
                    x: roundNum(this.nativePosition),
                    outerWidth: this.outerWidth,
                    innerWidth: this.innerWidth,
                    progress: roundNum(this.nativePosition / (this.outerWidth - this.innerWidth))
                });
            }
        });
        observer.observe(this.outerEl);
        observer.observe(this.innerEl);
    }

    componentDidUpdate() {
        if (this.props.friction && this.settings.friction !== this.props.friction) {
            this.settings.friction = this.props.friction;
        }
    }

    update = () => {
        this.velocityX = this.velocityX * this.settings.friction;

        if (!this.state.isDragging && this.nativePosition < this.leftBound) {
            this.velocityX = applyBoundForce({
                bound: this.leftBound,
                edge: 'left',
                nativePosition: this.nativePosition,
                friction: this.settings.friction,
                velocityX: this.velocityX
            });
        }

        if (!this.state.isDragging && this.nativePosition > this.rightBound) {
            this.velocityX = applyBoundForce({
                bound: this.rightBound,
                edge: 'right',
                nativePosition: this.nativePosition,
                friction: this.settings.friction,
                velocityX: this.velocityX
            });
        }

        this.velocityX = applyDragForce({
            isDragging: this.state.isDragging,
            dragPosition: this.dragPosition,
            nativePosition: this.nativePosition,
            velocityX: this.velocityX
        });

        this.nativePosition = this.nativePosition + this.velocityX;

        const isInfinitesimal = roundNum(Math.abs(this.velocityX)) < 0.001;

        if (!this.state.isDragging && isInfinitesimal) {
            // no longer dragging and inertia has stopped
            this.rafId && window.cancelAnimationFrame(this.rafId);
            this.setState({ restPositionX: roundNum(this.nativePosition) });
        } else {
            // bypass Reacts render method during animation, similar to react-spring
            if (this.draggerRefInner) {
                this.draggerRefInner.current.style.transform = `translate3d(${roundNum(this.nativePosition)}px,0,0)`;
            }
            this.rafId = window.requestAnimationFrame(this.update);
        }

        if (this.props.onFrame) {
            this.props.onFrame({
                x: roundNum(this.nativePosition),
                outerWidth: this.outerWidth,
                innerWidth: this.innerWidth,
                progress: roundNum(this.nativePosition / (this.outerWidth - this.innerWidth))
            });
        }
    };
    // address 'any' typing of event // MouseEvent does not have property 'touches'
    onMove = (e: any) => {
        const x: number = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX;
        const moveVector: number = x - this.downX;

        // gradually increase friction as the dragger is pulled beyond bounds
        // credit: https://github.com/metafizzy/flickity/blob/master/dist/flickity.pkgd.js#L2894
        let dragX: number = this.dragStartPosition + moveVector;
        const originBound: number = Math.max(this.rightBound, this.dragStartPosition);
        dragX = dragX > originBound ? (dragX + originBound) * 0.5 : dragX;
        const endBound: number = Math.min(this.leftBound, this.dragStartPosition);
        dragX = dragX < endBound ? (dragX + endBound) * 0.5 : dragX;

        this.dragPosition = dragX;
    };

    onRelease = (e: MouseEvent<any> | any) => {
        this.setState({ isDragging: false });

        // onRelease if the slider hasn't dragged sufficiently, classify it as a static click
        const moveVector = Math.abs(this.downX - e.pageX);
        if (moveVector < 20 && this.props.onStaticClick) {
            this.props.onStaticClick(e.target);
        }

        // Update html element styles
        this.docStyle.cursor = '';
        this.docStyle.userSelect = '';

        if (this.inputType === 'mouse') {
            window.removeEventListener('mousemove', this.onMove);
            window.removeEventListener('mouseup', this.onRelease);
        } else {
            window.removeEventListener('touchmove', this.onMove);
            window.removeEventListener('touchend', this.onRelease);
        }
    };

    onStart = (e: MouseEvent<any> | any) => {
        if (this.props.disabled) return;

        // dismiss clicks from right or middle buttons
        // (credit: https://github.com/metafizzy/flickity/blob/e2706840532c0ce9c4fc25832e810ad4f9823b61/dist/flickity.pkgd.js#L2176)
        const mouseButton = e.button;
        if (mouseButton && (mouseButton !== 0 && mouseButton !== 1)) return;

        this.setState({ isDragging: true });
        this.rafId && window.cancelAnimationFrame(this.rafId); // cancel any existing loop
        this.rafId = window.requestAnimationFrame(this.update); // kick off a new loop

        this.inputType = e.type === 'mousedown' ? 'mouse' : 'touch';

        // Update html element styles
        this.docStyle.cursor = 'grabbing';
        this.docStyle.userSelect = 'none';
        this.downX = this.inputType === 'mouse' ? e.pageX : e.touches[0].pageX;
        this.dragStartPosition = this.nativePosition;

        this.onMove(e);

        if (this.inputType === 'mouse') {
            window.addEventListener('mousemove', this.onMove);
            window.addEventListener('mouseup', this.onRelease);
        } else if (this.inputType === 'touch') {
            window.addEventListener('touchmove', this.onMove);
            window.addEventListener('touchend', this.onRelease);
        }
    };

    render() {
        // TypeScript doesn't like the defined type of refOuter and Inner
        return (
            <div
                data-id='Dragger-outer'
                ref={this.draggerRefOuter}
                className={`${styles.outer} ${this.state.isDragging ? styles.isDragging : ''}${this.props.disabled
                    ? ' is-disabled'
                    : ''} ${this.props.className}`}
                onTouchStart={this.onStart}
                onMouseDown={this.onStart}
                style={{ ...this.props.style }}>
                <div
                    data-id='Dragger-inner'
                    ref={this.draggerRefInner}
                    className={`${styles.inner} dragger-inner`}
                    style={{ transform: `translateX(${this.state.restPositionX}px)` }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
