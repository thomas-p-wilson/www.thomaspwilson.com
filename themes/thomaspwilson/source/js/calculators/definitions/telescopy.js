import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import UnitOfMeasureService from '../UnitOfMeasureService';
import Calculator from '../Calculator';

const unitOfMeasureService = new UnitOfMeasureService();
const G = 9.80665; // m/s^2

export default new Calculator({
    'title': 'Telescopy',
    'default': {
        'unit_of_length': 'mm',
        'unit_of_mass': 'g',
        'unit_of_angle': 'deg',
        'unit_of_rotation': 'rpm',
        'aperture_diameter': 609.6,
        'primary_type': 'paraboloid',
        'primary_thickness': 50.8
    },
    'compute': {
        //
        // System
        //
        'aperture_radius': function() {
            return this.aperture_diameter / 2;
        },
        'aperture_area': function() {
            return Math.PI * Math.pow(this.aperture_radius, 2);
        },
        'system_focal_length': function() {
            return this.aperture_diameter * 3;
        },
        'system_focal_ratio': function() {
            return this.system_focal_length / this.aperture_diameter;
        },

        //
        // Primary
        //
        'primary_diameter': function() {
            return this.aperture_diameter;
        },
        'primary_radius': function() {
            return this.primary_diameter / 2;
        },
        'primary_focal_length': function() {
            return this.primary_diameter * 2;
        },
        'primary_focal_ratio': function() {
            return this.primary_focal_length / this.primary_diameter;
        },
        'primary_depth': function() {
            if (this.primary_type === 'spherical') {
                return this.primary_focal_length - Math.sqrt(Math.pow(this.primary_focal_length, 2) - Math.pow(this.primary_radius, 2));
            }
            if (this.primary_type === 'paraboloid') {
                return Math.pow(this.primary_radius, 2) / (4 * this.primary_focal_length);
            }
            return NaN;
        },
        'primary_area': function() {
            var r = this.primary_radius;
            var r2 = Math.pow(r, 2);
            var d = this.primary_depth;

            if (this.primary_type === 'spherical') {
                return 2 * Math.PI * r * d;
            }
            if (this.primary_type === 'paraboloid') {
                return ((Math.PI * r) / (6 * Math.pow(d, 2))) * (Math.pow((r2 + (4 * Math.pow(d, 2))), 3/2) - Math.pow(r, 3));
            }
            return NaN;
        },
        'primary_dish_volume': function() {
            var r = this.primary_radius;
            var d = this.primary_depth;
            if (this.primary_type === 'spherical') {
                return ((Math.PI * d) / 6) * (3 * Math.pow(r, 2) + Math.pow(d, 2));
            }
            if (this.primary_type === 'paraboloid') { // We know the exact formula for paraboloidal volume
                return (Math.PI * Math.pow(r, 2) * d) / 2;
            }
            return NaN;
        },
        'primary_material_volume': function() {
            var r = this.primary_radius;
            var t = this.primary_thickness;
            var v = this.primary_dish_volume;

            return (Math.PI * Math.pow(r, 2) * t) - v;
        },
        'primary_mass': function() {
            var volume = unitOfMeasureService.convert(this.primary_material_volume, this.unit_of_length, 'cm', 3);
            return unitOfMeasureService.convert(volume * 28, 'g', this.unit_of_mass); // Assuming glass for mirror material
        },
        'primary_cast_spin': function() {
            var rad = Math.sqrt(unitOfMeasureService.convert(G, 'm', this.unit_of_length) / (this.primary_focal_length * 2));
            if ('rpm' === this.unit_of_rotation) {
                return 0.159155 * rad * 60;
            }
            return unitOfMeasureService.convert(rad, 'rad', this.unit_of_rotation);
        }
        // 'primary_radius_of_curvature': function() {
        //     return -((2 * this.mirror_distance * this.expected_system_focal_length) / (this.expected_system_focal_length - this.back_focal_length))
        // },
        // 'secondary_radius_of_curvature': function() {
        //     return -((2 * this.mirror_distance * this.back_focal_length) / (this.expected_system_focal_length - this.back_focal_length - this.mirror_distance));
        // }
        // 'secondary_conic_constant': function() {
        //   var a = .5 * Math.pow((4DBM)/((F + BM - DM) * (F - B - D)), 2)

        //   return -1 * a - Math.sqrt(a * (a + 2));
        // }
    },
    'watch': {
        'unit_of_length': function(oldVal, newVal) {
            Object.keys(fields)
                .filter((fieldName) => (fields[fieldName].convertable))
                .filter((fieldName) => (this.data[fieldName]))
                .forEach((key) => {
                    this[key] = unitOfMeasureService.convert(this[key], oldVal, newVal);
                });
        },
        'unit_of_mass': function(oldVal, newVal) {},
        'unit_of_rotation': function(oldVal, newVal) {}
    },
    'sections': [{
        'title': 'Units of Measure',
        'fields': ['unit_of_length', 'unit_of_mass', 'unit_of_angle', 'unit_of_rotation']
    }, {
        'title': 'System Info',
        'fields': ['aperture_diameter', 'aperture_radius', 'aperture_area', 'system_focal_length', 'system_focal_ratio']
    }, {
        'title': 'Primary Info',
        'fields': ['primary_type', 'primary_diameter', 'primary_radius', 'primary_focal_length', 'primary_focal_ratio', 'primary_thickness', 'primary_depth', 'primary_area', 'primary_dish_volume', 'primary_material_volume', 'primary_mass', 'primary_cast_rotation']
    }],
    'fields': {
        'unit_of_length': {
            'title': 'Unit Of Length',
            'options': {
                'mm': 'Millimetres',
                'cm': 'Centimetres',
                'm': 'Metres',
                'in': 'Inches',
                'ft': 'Feet'
            }
        },
        'unit_of_mass': {
            'title': 'Unit Of Mass',
            'options': {
                'g': 'Grams',
                'kg': 'Kilograms',
                'oz': 'Ounces',
                'lb': 'Pounds'
            }
        },
        'unit_of_angle': {
            'title': 'Unit Of Angle',
            'options': {
                'deg': 'Degrees',
                'rad': 'Radians'
            }
        },
        'unit_of_rotation': {
            'title': 'Unit Of Rotation',
            'options': {
                'rps': 'Revolutions Per Second',
                'rpm': 'Revolutions Per Minute'
            }
        },

        // System info
        'aperture_diameter': {
            'title': 'Aperture Diameter',
            'addon': '$unit_of_length',
            'info': 'The diameter of the objective aperture determines the amount of light allowed to enter the telescope. Larger apertures allow more light to enter the telescope. Aperture size directly affects focal ratio and other properties of the telescope.',
            'convertable': true
        },
        'aperture_radius': {
            'title': 'Aperture Radius',
            'addon': '$unit_of_length',
            'convertable': true
        },
        'aperture_area': {
            'title': 'Aperture Area',
            'addon': function({ unit_of_length }) {
                return (<span>{ unit_of_length }<sup>2</sup></span>);
            },
            'output': true,
            'convertable': true
        },
        'system_focal_length': {
            'title': 'Focal Length',
            'addon': '$unit_of_length',
            'convertable': true
        },
        'system_focal_ratio': {
            'title': 'Focal Ratio',
            'convertable': true
        },

        // Primary info
        'primary_type': {
            'title': 'Type',
            'options': {
                'spherical': 'Spherical',
                'paraboloid': 'Paraboloid'
            },
            'info': 'The diameter of the primary is typically the same as the aperture diameter.'
        },
        'primary_diameter': {
            'title': 'Diameter',
            'addon': '$unit_of_length',
            'output': true,
            'info': 'The diameter of the primary is typically the same as the aperture diameter.',
            'convertable': true
        },
        'primary_radius': {
            'title': 'Radius',
            'addon': '$unit_of_length',
            'output': true,
            'info': 'The radius of the primary is typically the same as the aperture radius.',
            'convertable': true
        },
        'primary_focal_length': {
            'title': 'Focal Length',
            'addon': '$unit_of_length',
            'info': 'The focal length of the primary mirror. Typcially twice the primary diameter.',
            'convertable': true
        },
        'primary_focal_ratio': {
            'title': 'Focal Ratio',
            'info': 'The formula for the [focal ratio][focal ratio] or f-number is \\\\(N = \dfrac{f}{D}\\\\)',
            'convertable': true
        },
        'primary_thickness': {
            'title': 'Blank Thickness',
            'addon': '$unit_of_length',
            'info': 'The blank thickness used for the primary mirror. Used in determining weight, volume, etc.',
            'convertable': true
        },
        'primary_depth': {
            'title': 'Depth',
            'addon': '$unit_of_length',
            'info': 'The depth from the paraboloid vertex to the rim of the mirror. The formula to calculate the depth of the dish is \\\\(h = \dfrac{1}{2g}w^2r^2\\\\)',
            'convertable': true
        },
        'primary_area': {
            'title': 'Surface Area',
            'addon': function({ unit_of_length }) {
                return (<span>{ unit_of_length }<sup>2</sup></span>);
            },
            'info': 'The area of the concave primary mirror. The formula to determine the concave surface area is \\\\(a = \dfrac{\pi r}{6d^2}\times((r^2 + 4d^2)^{3/2}-r^3)\\\\)',
            'convertable': true
        },
        'primary_dish_volume': {
            'title': 'Dish Volume',
            'addon': function({ unit_of_length }) {
                return (<span>{ unit_of_length }<sup>3</sup></span>);
            },
            'info': 'The volume of the dish formed by the paraboloidal mirror. The formula for the volume of a paraboloid is \\\\(v = \dfrac{1}{2}pr^2d\\\\).',
            'convertable': true
        },
        'primary_material_volume': {
            'title': 'Material Volume',
            'addon': function({ unit_of_length }) {
                return (<span>{ unit_of_length }<sup>3</sup></span>);
            },
            'info': 'A rough estimate of the volume of the material used to create the mirror.',
            'convertable': true
        },
        'primary_mass': {
            'title': 'Mass',
            'addon': '$unit_of_mass',
            'info': 'A rough estimate of the mass of the material required to construct the primary mirror.',
            'convertable': true
        },
        'primary_cast_rotation': {
            'title': 'Cast Rotation',
            'addon': '$unit_of_rotation',
            'info': `The angular velocity with which the mirror must be rotated in order to achieve the desired focal length during spin-casting.
            <br><br>

            - *r* represent the radius of the rim of the mirror, in centimetres
            - *f* represent the focal length of the mirror from the vertex, in centimetres
            - *h* represent the height of an imaginary parcel above a zero to be defined in the calculation
            - *w* represent the angular velocity of the liquid's rotation, in radians per second
            - *g* represent the acceleration due to gravity, in centimetres

            \\\\[
            \begin{align}
            r^2 &= 4fh \\\\\
            &= 4f\dfrac{1}{2g}w^2r^2 \\\\\
            1 &= 4f\dfrac{1}{2g}w^2 \\\\\
            2g &= 4fw^2 \\\\\
            g &= 2fw^2
            \end{align}
            \\\\]

            So for example, if I want to cast a 50cm (~20 inch) mirror with a focal length
            of 180cm (~6 feet), we plug in:

            - *r* = 25cm
            - *f* = 180cm
            - *g* ~ 981cm

            \\\\[
            \begin{align}
            g &= 2fw^2 \\\\\
            981 &= 2\times180w^2 \\\\\
             &= 360w^2 \\\\\
            w^2 &= \dfrac{981}{360} \\\\\
            w &= \sqrt{2.725} \\\\\
            w &= 1.6507574
            \end{align}
            \\\\]`,
            'convertable': true
        }

    /*  <div class="panel panel-default">
        <h3>Radii of Curvature</h3>

        <p>Primary: {{ primary_radius_of_curvature }}</p>
        <p>R1 = -((2DF)/(F-B))</p>
        <p>Secondary: {{ secondary_radius_of_curvature }}</p>
        <p>R2 = -((2DB)/(F-B-D))</p>
      </div>
    </div>*/

    }
});