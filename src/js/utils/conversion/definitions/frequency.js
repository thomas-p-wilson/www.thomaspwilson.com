import { generateScale } from './utils';

export default {
    ...generateScale('Hz', 'Hertz', 'Hertz', 'Frequency', 'Metric', ['G', 'M', 'k', 'm']),
    rpm: {
        symbol: 'rpm',
        singular: 'Rotation per minute',
        plural: 'Rotations per minute',
        measure: 'Frequency',
        multiplier: 1 / 60, // To Hertz
    },
    'deg/s': {
        symbol: 'deg/s',
        singular: 'Degree per second',
        plural: 'Degrees per second',
        measure: 'Frequency',
        multiplier: 1 / 360, // To Hertz
    },
    'rad/s': {
        symbol: 'rad/s',
        singular: 'Radian per second',
        plural: 'Radians per second',
        measure: 'Frequency',
        multiplier: 1 / (Math.PI * 2)
    }
}
