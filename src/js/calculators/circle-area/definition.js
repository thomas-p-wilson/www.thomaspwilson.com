import get from 'lodash/get';
import Calculator from '../Calculator';
import { getStoredValue } from '../helpers';

export default new Calculator({
    exclusive: true,
    slug: 'circle-area'
}, [
    {
        id: 'radius',
        title: 'Radius (r)',
        symbol: 'r',
        unit: 'length-metric-centimetre',
        calculate(data) {
            const diameter = this.diameter.get(data);
            if (diameter) {
                return diameter / 2;
            }
            const circumference = this.circumference.get(data);
            if (circumference) {
                return circumference / Math.PI / 2;
            }
            const area = this.area.get(data);
            if (area) {
                return Math.sqrt(area / Math.PI);
            }
        }
    },
    {
        id: 'diameter',
        title: 'Diameter (d)',
        symbol: 'd',
        unit: 'length-metric-centimetre',
        calculate(data) {
            const radius = this.radius.get(data);
            if (typeof radius === 'undefined' || radius === '') {
                return '';
            }
            return radius * 2;
        }
    },
    {
        id: 'circumference',
        title: 'Circumference (c)',
        symbol: 'c',
        unit: 'length-metric-centimetre',
        calculate(data) {
            const radius = this.radius.get(data);
            if (typeof radius === 'undefined' || radius === '') {
                return '';
            }
            return 2 * Math.PI * radius;
        }
    },
    {
        id: 'area',
        title: 'Area (A)',
        symbol: 'A',
        unit: 'length-metric-centimetre',
        calculate(data) {
            const radius = this.radius.get(data);
            if (typeof radius === 'undefined' || radius === '') {
                return '';
            }
            return Math.PI * Math.pow(radius, 2);
        }
    }
]);
