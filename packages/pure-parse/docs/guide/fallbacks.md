# Fallbacks (Failsafe Parsing)

A huge benefit of parsing data over of validating data (with guards) is that errors can be handled gracefully.

### Fallbacks with defaults (`withDefault`)

Consider an application

[withDefault](/api/parsers/fallbacks#withDefault) functions provide the means to make

### Fallbacks with multiple attempts (`oneOf`)

Consider an application with a large document with many nested properties: if there is a small error anywhere in the data, it might be preferable to ignore the error and continue processing—rather than discarding the entire document.

[oneOf](/api/parsers/fallbacks#oneOf)
