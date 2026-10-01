# ZimCar — 3D Car Dealership

React + Vite + Tailwind dealership site with a real-time 3D showroom built on
[three.js](https://threejs.org) / [React Three Fiber](https://r3f.docs.pmnd.rs).

## Features

- **3D Showroom** (`/showroom`): every car in stock on its own turntable, a reflective floor,
  filters by body type, arrow-key browsing, and a camera that glides between cars.
- **3D viewer + configurator** on each car page (`/car/:id`):
  - Orbit, zoom, and preset views (3/4, front, side, rear, top)
  - **Interior view**: sit in the (right-hand drive) driver's seat and look around
  - Click a door to open it; headlights toggle
  - Live paint (presets or any custom colour), gloss/metallic/matte finish, wheels, interior trim
  - Studio / daylight / sunset / night lighting
  - Feature hotspots generated from each car's `features`
  - Running build price, and **Enquire** pre-fills the enquiry form with the chosen spec
  - Snapshot to PNG and fullscreen
- **3D homepage hero** with a drag-to-spin car.
- **Bloom glow** on headlights and light strips (skipped on phones for speed).

## Sales tools

- **Finance calculator** on every car: deposit, term, rate and optional trade-in, with a
  one-tap "Apply on WhatsApp" that sends the figures to the sales team. "From $X/mo" shows
  on every card. Defaults live in `src/utils/finance.js`.
- **Test-drive booking**: pick a day and slot within trading hours, the request goes to
  WhatsApp, and the customer can add it to their calendar (.ics).
- **WhatsApp everywhere**: floating chat button (names the car on car pages) and car-specific
  enquiry links. The number comes from `dealershipInfo.whatsapp` in `src/data/mockData.js`.
- **Saved cars**: heart any car; the header shows the count and Inventory has a Saved filter.
  Stored in the visitor's browser.
- **Share** button (native share sheet or copy link) and a sticky price / test-drive bar on mobile.

There is no backend yet: bookings and finance applications are delivered through WhatsApp.

## How the 3D cars work

The cars are generated in code from a body profile (`src/components/three/carSpecs.js`),
so no model files need to be downloaded or licensed. Each car's `bodyType` in
`src/data/mockData.js` selects the body: `sedan`, `hatch`, `suv`, `pickup`, or `roadster`.
All lighting is generated locally (no HDRI downloads), and three.js is lazy-loaded only
on pages that use it.

| File | Purpose |
| --- | --- |
| `components/three/carSpecs.js` | Body dimensions, derived layout, camera views, hotspot anchors |
| `components/three/carGeometry.js` | Panel, glass, tyre and texture builders |
| `components/three/ProceduralCar.jsx` | The car: body, doors, glass, cabin, wheels, lights |
| `components/three/CarViewer.jsx` | Single-car viewer + configurator UI |
| `components/three/Showroom3D.jsx` | Virtual showroom |
| `components/three/moods.js`, `StudioEnvironment.jsx` | Lighting moods, floor, shadows |
| `components/three/Glow.jsx` | Bloom + tone mapping post-processing |

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run lint
```
