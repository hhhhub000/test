# Design Guidelines for 4-in-a-Row Game

## Design Approach
**Selected Approach:** Design System with Game-Focused Adaptations
**Justification:** This utility-focused game prioritizes clear gameplay mechanics and immediate visual feedback over aesthetic differentiation. Clean, functional design ensures players can focus on strategy.

## Core Design Elements

### Color Palette
**Dark Mode Primary:**
- Background: 220 15% 12% (Deep navy-blue background)
- Game board: 220 20% 18% (Slightly lighter board surface)
- Player 1 pieces: 0 75% 55% (Vibrant red)
- Player 2 pieces: 220 75% 55% (Vibrant blue)
- UI elements: 220 10% 85% (Light gray text/borders)

**Light Mode Primary:**
- Background: 220 25% 95% (Light blue-gray)
- Game board: 220 15% 25% (Dark board for contrast)
- Player pieces: Same vibrant colors for consistency
- UI elements: 220 15% 20% (Dark gray text/borders)

### Typography
**Font Stack:** System fonts (system-ui, -apple-system, sans-serif)
- Game title: Bold, 2xl-3xl size
- Player indicators: Medium weight, lg size  
- Button text: Medium weight, base size
- Game status: Regular weight, lg size

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Board cells: p-2 padding
- Section spacing: mb-6, mt-8
- Button spacing: px-6, py-2
- Container margins: m-4

### Component Library

**Game Board:**
- 7x6 grid with circular piece slots
- Drop zones highlighted on hover
- Animated piece dropping with subtle easing
- Clean borders between cells using contrasting colors

**Game Pieces:**
- Perfect circles with subtle shadow/depth
- Smooth color transitions when placed
- Winning pieces highlighted with subtle glow effect

**Player Interface:**
- Current player indicator with large, clear typography
- Turn counter and game status prominently displayed
- Reset button with standard styling

**Controls:**
- Primary action buttons with solid backgrounds
- Clear hover states with slight opacity changes
- Consistent button sizing across interface

### Visual Hierarchy
1. **Game Board:** Central focus, largest visual element
2. **Current Player Status:** Secondary prominence above board
3. **Control Buttons:** Tertiary elements, clean and accessible
4. **Game Information:** Supporting text with appropriate sizing

### Interaction Design
- **Piece Placement:** Click column to drop piece with smooth animation
- **Visual Feedback:** Immediate hover states showing drop position
- **Win State:** Highlight winning pieces with connecting line or glow
- **Game Reset:** Smooth clear animation returning to initial state

### Responsive Considerations
- Mobile: Stack layout vertically, ensure board remains playable
- Tablet: Maintain horizontal layout with appropriate scaling
- Desktop: Centered layout with generous whitespace

## Images
No hero images or background images needed. The game board itself serves as the primary visual element. All graphics are CSS-generated shapes and colors for optimal performance and scalability.