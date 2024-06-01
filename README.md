# puppy-dnd

The puppiest drag and drop library 🐶!
Only drag and drop, no extra features, super small and simple.

# example

```typescript
// Get the draggable element
const draggable = document.querySelector<HTMLElement>(".draggable")!

// Make the element draggable
const dragHandle = new DragHandle(draggable)

// Add a drop handler
dragHandle.onDrop(e => {
  // Get the hovered element and put our dragged element into it
  const parent = document.elementsFromPoint(e.clientX, e.clientY)[1]
  parent.append(draggable)
  
  // Unabsolute its position
  draggable.style.position = ""
})
```
