# UI Guidelines

## Design Principles

1. Keep the interface simple, task-focused, and easy to scan.
2. Prioritize readability with clear visual hierarchy and sufficient spacing.
3. Use consistent components, terminology, and interaction patterns.
4. Make core actions obvious: add, edit, complete, filter, and delete tasks.

## Layout and Structure

1. Use a responsive layout that works well on mobile, tablet, and desktop.
2. Keep primary content in a centered container with clear section spacing.
3. Show the task input area at the top of the page.
4. Group task controls (search, filter, sort) in a single, discoverable toolbar.
5. Separate active and completed tasks with visible section headings.

## Components and Styling

1. Use Material Design components (or equivalent) for inputs, buttons, cards, and dialogs.
2. Keep component styles consistent across all screens and states.
3. Use rounded corners and subtle elevation for cards to improve visual grouping.
4. Use button variants consistently:
   - Primary buttons for main actions (for example: Add Task, Save).
   - Secondary/outlined buttons for less critical actions.
   - Destructive actions (for example: Delete, Clear Completed) must be visually distinct.
5. Provide visible hover, focus, active, disabled, and loading states for interactive controls.

## Color and Typography

1. Use a defined color system with semantic roles:
   - Primary: main actions and highlights.
   - Success: completed state confirmations.
   - Warning/Error: validation and destructive actions.
   - Neutral: backgrounds, borders, and secondary text.
2. Ensure text/background contrast meets WCAG 2.1 AA minimums.
3. Use a clear, legible sans-serif type scale with consistent sizes for headings, body text, and helper text.
4. Do not rely on color alone to communicate status; pair with icons or labels.

## Task Item Design

1. Each task item should show title, optional description, due date, and status indicator.
2. Completed tasks should be visually differentiated (for example: check icon and subdued text style).
3. Overdue tasks should be clearly flagged using both color and text/icon cues.
4. Keep edit and delete actions available but not visually dominant.

## Forms and Validation

1. Mark required fields clearly and validate task title as non-empty.
2. Show inline validation messages near the relevant input.
3. Preserve user input on validation failure.
4. Use accessible date-picker controls for due date entry.

## Accessibility Requirements

1. Meet WCAG 2.1 AA accessibility standards.
2. Ensure all interactive elements are keyboard accessible.
3. Provide visible focus indicators for keyboard navigation.
4. Use semantic HTML and ARIA attributes where needed.
5. Provide accessible labels for form fields, icon buttons, and filters.
6. Announce important state changes to assistive technologies when appropriate (for example: task completed, task deleted).

## Feedback and States

1. Provide immediate feedback after create, update, complete, and delete actions.
2. Include clear empty states when there are no tasks.
3. Include clear loading and error states for async operations.
4. Use confirmation dialogs for destructive bulk actions (for example: Clear Completed).

## Motion and Interaction

1. Use subtle, purposeful transitions for add/remove/reorder interactions.
2. Keep animation durations short and non-distracting.
3. Respect reduced-motion preferences.

## Consistency and Maintainability

1. Centralize design tokens (colors, spacing, typography) in shared style variables.
2. Reuse common UI components instead of creating one-off variants.
3. Document any deviations from these guidelines in design notes.