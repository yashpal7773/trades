# Design Guidelines: AI Trading Battle Arena

## Design Approach
**Reference-Based**: Financial trading platform aesthetics inspired by professional trading terminals (Bloomberg Terminal, Interactive Brokers, Robinhood's dark mode) with a modern gaming/competitive overlay for the AI battle arena aspect.

## Theme: Deep Ocean Dark Mode

### Color System (User-Specified)
```
Primary Background: #0B1026
Secondary Background: #151E3F (cards/panels)
Accent Green: #00FF94 (profits/positive)
Accent Red: #FF4B4B (losses/negative)
Text Primary: #FFFFFF
Text Muted: #B0B3C5
```

## Layout Architecture

### Global Structure
- **Fixed Left Sidebar** (240px width)
  - Navigation: Dashboard, Portfolio, Account, Graphs, AI Trading
  - Dark background (#151E3F)
  - Active state indicators with accent green glow
  
- **Main Content Area**
  - Full height, responsive padding (p-6 to p-8)
  - Scrollable content with custom dark scrollbar styling

### Spacing System
Use Tailwind units: 2, 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6
- Section gaps: gap-6 to gap-8
- Card spacing: space-y-4

## Typography Hierarchy

### Fonts
- **Primary**: 'Inter' or 'Geist Sans' (Google Fonts)
- **Monospace**: 'JetBrains Mono' for numbers, prices, tickers

### Hierarchy
- Page titles: text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base
- Captions/labels: text-sm text-muted
- Numeric displays: font-mono for prices/P&L

## Component Library

### Cards & Panels
- Background: #151E3F
- Border: 1px solid rgba(255,255,255,0.1)
- Border radius: rounded-lg (8px)
- Subtle shadow for depth
- Hover: border glow with accent color

### Dashboard Components
1. **User Profile Card**
   - Avatar circle (w-16 h-16) with initials
   - Username (text-xl font-semibold)
   - Badge pill: "Pro Trader" with green accent border

2. **Quick Stats Grid**
   - 3-column grid (grid-cols-3 gap-4)
   - Each stat: Large number (text-2xl font-mono), label below (text-sm)
   - Net Worth with directional arrow (▲/▼) and color-coded change percentage

3. **Recent Activity Feed**
   - Timeline-style list with timestamps
   - Trade entries: Ticker badge + Action (BUY/SELL) + P&L color-coded

### AI Trading Tab Layout

**Top Section: Candlestick Chart**
- Full width, height: 60vh
- Using lightweight-charts library
- Dark theme with green/red candles
- Buy/Sell markers overlaid as triangles with labels

**Bottom Section: 50/50 Split**

**Left: Debate Arena**
- Chat-log interface with auto-scroll
- AI avatars (circular, 40px) with distinct colors per agent
- Message bubbles with agent name header
- Timestamp for each message (text-xs text-muted)

**Right: Control & Status Panel**
- Current stock/strategy display at top
- Voting bars: horizontal progress bars showing weighted votes
- Status indicator with color-coded states
- Action buttons (START/STOP) prominent with glow effect on active states

### Portfolio & Account

**Portfolio Table**
- Header row with column labels
- Striped rows for readability
- Profit/Loss column with color-coded text and background tint
- Sortable columns

**Pie Chart (Asset Allocation)**
- Using Chart.js with dark theme
- Color palette: shades of blue/green for holdings, gray for cash
- Legend positioned right with percentages

**Account Settings**
- Form inputs with dark styling
- Input background: rgba(255,255,255,0.05)
- Focus state: accent green border glow
- Buttons for paper money: outlined style with hover fill

### Graphs (Analytics)

**Heatmap (Accuracy)**
- Grid visualization with color gradient (red to green)
- Cell tooltips on hover
- Axis labels for agents and time

**Bar Charts (Power Rankings)**
- Horizontal bars with rounded ends
- Color gradient based on rank
- Agent names on left, power values on right

## Interactive Elements

### Buttons
- Primary: Green (#00FF94) with subtle glow, white text
- Secondary: Outlined with border, transparent background
- Danger (Emergency Stop): Red (#FF4B4B) with pulsing glow effect
- Hover: slight scale and brightness increase
- Disabled: opacity-50, cursor-not-allowed

### Status Indicators
- Pulsing dot for "live" states
- Color-coded text (green=active, yellow=processing, red=stopped)

### WebSocket Real-time Updates
- Smooth transitions for price updates (animate changes)
- Flash effect for new trades on chart
- Badge notifications for new debate messages

## Animations
- Page transitions: fade-in (300ms)
- Chart updates: smooth line interpolation
- Trade markers: pop-in scale effect
- Emergency stop: shake + red flash
- Keep subtle - prioritize performance

## Data Visualization Principles
- Numbers always in monospace font
- Positive values: green with ▲
- Negative values: red with ▼
- Percentage changes in parentheses
- Large numbers with comma separators
- Prices to 2 decimal places

## Accessibility
- High contrast ratios maintained with white text on dark backgrounds
- Focus indicators with accent green outline
- Screen reader labels for chart elements
- Keyboard navigation support for all interactive elements

This design creates a professional trading terminal aesthetic with competitive gaming elements for the AI battle arena, balancing data density with visual clarity.