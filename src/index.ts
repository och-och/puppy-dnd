/**
 * Handles a draggable element
 */
export class DragHandle {
	private abortController = new AbortController()
	private offsetX = 0
	private offsetY = 0
	private dragSubscribers = new Set<(event:MouseEvent)=>void>()
	private dropSubscribers = new Set<(event:MouseEvent)=>void>()
	private moveSubscribers = new Set<(event:MouseEvent)=>void>()

	/**
	 * Create a draggable element
	 * @param element element to become draggable
	 */
	constructor(public element: HTMLElement) {
		this.element.classList.add("pup-draggable")
		this.element.addEventListener("mousedown", e => this.triggerDrag(e))
	}

	triggerDrag(event: MouseEvent) {
		this.offsetX = event.offsetX
		this.offsetY = event.offsetY
		this.element.style.position = "absolute"
		this.updatePosition(event.pageX, event.pageY)

		this.abortController = new AbortController()
		document.addEventListener("mousemove", e => this.triggerMove(e), {
			signal: this.abortController.signal,
		})
		document.addEventListener("mouseup", e => this.triggerDrop(e), {
			signal: this.abortController.signal,
		})
		this.dragSubscribers.forEach(fn => fn(event))
	}

	triggerDrop(event: MouseEvent) {
		this.abortController.abort()
		this.dropSubscribers.forEach(fn => fn(event))
	}

	triggerMove(event: MouseEvent) {
		this.updatePosition(event.pageX, event.pageY)
		this.moveSubscribers.forEach(fn => fn(event))
	}

	private updatePosition(x: number, y: number) {
		this.element.style.left = x - this.offsetX + "px"
		this.element.style.top = y - this.offsetY + "px"
	}

	/**
	 * Add an event handler for drag starting
	 * @returns a function for unsubscribing
	 */
	onDrag(handler: (event:MouseEvent) => void) {
		this.dragSubscribers.add(handler)
		return () => this.dragSubscribers.delete(handler)
	}

	/**
	 * Add an event handler for drag ending
	 * @returns a function for unsubscribing
	 */
	onDrop(handler: (event:MouseEvent) => void) {
		this.dropSubscribers.add(handler)
		return () => this.dropSubscribers.delete(handler)
	}

	/**
	 * Add an event handler for moving the mouse while dragging
	 * @returns a function for unsubscribing
	 */
	onMove(handler: (event:MouseEvent) => void) {
		this.moveSubscribers.add(handler)
		return () => this.moveSubscribers.delete(handler)
	}
}
