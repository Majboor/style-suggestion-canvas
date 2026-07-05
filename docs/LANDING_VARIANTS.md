# Landing hero A/B variants

The landing page (`/`) ships with two interchangeable hero treatments so you
can A/B-test messaging and layout without a rebuild. The choice is driven
entirely by a query parameter.

## Toggling

| URL | Hero shown |
| --- | --- |
| `/` | Variant **A** (default) |
| `/?variant=a` | Variant **A** (forced) |
| `/?variant=b` | Variant **B** |

- The value from `?variant=` wins and is **persisted to `localStorage`**
  (`ssc:landing-variant`), so subsequent visits without the query keep the
  last-chosen variant for that browser.
- A small text link under the hero flips between the two, so you can preview
  either one live.
- Anything other than `a` / `b` is ignored and falls back to the default.

## The two variants

**Variant A — original (control).**
Centered single column on a light background. Product-name-led headline
_"Style Preference API"_ with two equal-weight CTAs (`Try the Style API`,
`View API Documentation`).

**Variant B — alternate (challenger).**
Asymmetric two-column split on a dark gradient with a stat strip
(Feedback / Profiles / Access). Benefit-led headline _"Fashion that learns
you"_ with an action-first primary CTA (`Start rating styles`) and a
secondary `Read the docs` link.

Both heroes route to the same destinations (`/style-api`, `/api-docs`); only
the wording, layout, and emphasis differ — the rest of the landing page
(feature cards, About) is shared.

## Where it lives

| Concern | File |
| --- | --- |
| Variant resolution + persistence hook | `src/hooks/use-variant.ts` |
| Variant B hero component | `src/components/HeroVariantB.tsx` |
| Wiring / control (variant A) hero | `src/pages/Index.tsx` |

To add a third variant, extend the `LandingVariant` union and `normalize()`
in `use-variant.ts`, then branch in `Index.tsx`.
