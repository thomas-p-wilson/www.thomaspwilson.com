# Units of Measure #

A unit of measure definition looks like:

```
{
 symbol: 'C',
    name: 'Celsius', // The general unit name
    singular: 'degree Celsius', // e.g. 1 degree Celsius
    plural: 'degrees Celsius', // e.g. 5 degrees Celsius
    scale: 'Temperature', // The scale of measure, e.g. temperature, length, etc.
    system: 'Metric', // The system under which the unit falls (Metric, British Imperial, US Customary, etc)

    // The following are used for converting to and from an arbitrary base unit
    multiplier: 1000, // The amount to multiply by to get to the base unit
    shift: 273.15, // The amount to add/subtract to get to the base unit
    transform: (from, to), // A transform function used to convert the value from or to the base unit
}
```