/**
 * Handles a draggable element
 */
export class DragHandle {
	private abortController = new AbortController()
	private offsetX = 0
	private offsetY = 0
	private dragSubscribers = new Set<(event:MouseEvent|TouchEvent)=>void>()
	private dropSubscribers = new Set<(event:MouseEvent|TouchEvent)=>void>()
	private moveSubscribers = new Set<(event:MouseEvent|TouchEvent)=>void>()

	/**
	 * Create a draggable element
	 * @param element element to become draggable
	 */
	constructor(public element: HTMLElement) {
		this.element.classList.add("pup-draggable")
		this.element.addEventListener("touchstart", e => this.triggerDrag(e))
		this.element.addEventListener("mousedown", e => this.triggerDrag(e))
	}

	triggerDrag(event: MouseEvent|TouchEvent) {
		const touch = this.getTouch(event)
		if (!touch) return

		if (event instanceof MouseEvent) {
			if (event.buttons != 1) return

			this.offsetX = event.offsetX
			this.offsetY = event.offsetY
			this.abortController = new AbortController()
			document.addEventListener("mousemove", e => this.triggerMove(e), {
				signal: this.abortController.signal,
			})
			document.addEventListener("mouseup", e => this.triggerDrop(e), {
				signal: this.abortController.signal,
			})
		}
		else {
			const box = this.element.getBoundingClientRect()
			this.offsetX = box.width / 2
			this.offsetY = box.height / 2
			document.addEventListener("touchmove", e => this.triggerMove(e), {
				signal: this.abortController.signal,
			})
			document.addEventListener("touchend", e => this.triggerDrop(e), {
				signal: this.abortController.signal,
			})
			document.addEventListener("touchcancel", e => this.triggerDrop(e), {
				signal: this.abortController.signal,
			})
		}

		this.element.style.position = "absolute"
		this.updatePosition(touch.pageX, touch.pageY)

		this.dragSubscribers.forEach(fn => fn(event))
	}

	triggerDrop(event: MouseEvent|TouchEvent) {
		this.abortController.abort()
		this.dropSubscribers.forEach(fn => fn(event))
	}

	triggerMove(event: MouseEvent|TouchEvent) {
		const touch = this.getTouch(event)
		if (!touch) return
		this.updatePosition(touch.pageX, touch.pageY)
		this.moveSubscribers.forEach(fn => fn(event))
	}

	private updatePosition(x: number, y: number) {
		this.element.style.left = x - this.offsetX + "px"
		this.element.style.top = y - this.offsetY + "px"
	}

	getTouch(event: MouseEvent|TouchEvent) {
		const touch = event instanceof MouseEvent ? event : event.touches.item(0)
		return touch
	}

	/**
	 * Add an event handler for drag starting
	 * @returns a function for unsubscribing
	 */
	onDrag(handler: (event:MouseEvent|TouchEvent) => void) {
		this.dragSubscribers.add(handler)
		return () => this.dragSubscribers.delete(handler)
	}

	/**
	 * Add an event handler for drag ending
	 * @returns a function for unsubscribing
	 */
	onDrop(handler: (event:MouseEvent|TouchEvent) => void) {
		this.dropSubscribers.add(handler)
		return () => this.dropSubscribers.delete(handler)
	}

	/**
	 * Add an event handler for moving the mouse while dragging
	 * @returns a function for unsubscribing
	 */
	onMove(handler: (event:MouseEvent|TouchEvent) => void) {
		this.moveSubscribers.add(handler)
		return () => this.moveSubscribers.delete(handler)
	}
}
