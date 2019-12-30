# Calculator Definition Example #

```json
{
    "id": "reflective-telescopy",
    "title": "Reflective Telescopy",
    "description": "Calculate reflective telescope design and fabrication parameters",
    "version": "1.0.0-beta.1",
    "category": "other",
    "keywords": [],
    "related": [],
    "changelog": [
        {
            "version": "1.0.0-beta.1",
            "description": "Initial implementation",
            "author": ["thomas-p-wilson"]
        }
    ]
}
```

Every calculator definition should have a title, description, version, category, and a changelog which contains a list of changes, as seen above. Keywords are optional.

Based on these properties we generate a manifest of calculators at build time, which is used in the frontend for full-text searching, listing, and filtering.

When a calculator is rendered, the changelog may be displayed, in case the user for some reason wants to know how the calculator has evolved.

The `related` attribute points to other calculators by id.