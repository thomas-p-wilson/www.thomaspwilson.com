import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { convert } from '../measurements';
import Calculator from '../Calculator';

const G = 9.80665; // m/s^2

export default new Calculator({
    'title': 'Telescopy',
    'slug': 'telescopy',
    'description': 'Determine telescope design properties, including individual mirror mass, curvatures, focal points, and system properties.',
    'units': {
        'length': 'mm',
        'mass': 'g',
        'angle': 'rad',
        'frequency': 'Hz'
    },
    'scale': 3,
    'watch': {
        'unit_of_length': function(oldVal, newVal) {
            Object.keys(fields)
                .filter((fieldName) => (fields[fieldName].convertable))
                .filter((fieldName) => (this.data[fieldName]))
                .forEach((key) => {
                    this[key] = convert(this[key], oldVal, newVal);
                });
        },
        'unit_of_mass': function(oldVal, newVal) {},
        'unit_of_rotation': function(oldVal, newVal) {}
    },
    'sections': [{
        'title': 'System Info',
        'fields': ['aperture_diameter', 'aperture_radius', 'aperture_area', 'system_focal_length', 'system_focal_ratio']
    }, {
        'title': 'Primary Info',
        'fields': ['primary_type', 'primary_diameter', 'primary_radius', 'primary_focal_length', 'primary_focal_ratio', 'primary_thickness', 'primary_depth', 'primary_area', 'primary_dish_volume', 'primary_material_volume', 'primary_mass', 'primary_cast_rotation']
    }],
    'fields': {
        // System info
        'aperture_diameter': {
            'title': 'Aperture Diameter',
            'info': 'The diameter of the objective aperture determines the amount of light allowed to enter the telescope. Larger apertures allow more light to enter the telescope. Aperture size directly affects focal ratio and other properties of the telescope.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': 'cm'
            },
            'default': 60.96,
            'calculate': (o) => (o.aperture_radius * 2)
        },
        'aperture_radius': {
            'title': 'Aperture Radius',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': '$unit$aperture_diameter'
            },
            'calculate': (o) => (o.aperture_diameter / 2)
        },
        'aperture_area': {
            'title': 'Aperture Area',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'exponent': 2,
                'default': '$unit$aperture_diameter'
            },
            'output': true,
            'convertable': true,
            'calculate': (o) => (Math.PI * Math.pow(o.aperture_radius, 2))
        },
        'system_focal_length': {
            'title': 'Focal Length',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': '$unit$aperture_diameter'
            },
            'convertable': true,
            'calculate': (o) => (o.aperture_diameter * 3)
        },
        'system_focal_ratio': {
            'title': 'Focal Ratio',
            'convertable': true,
            'calculate': (o) => (o.system_focal_length / o.aperture_diameter)
        },

        // Primary info
        'primary_type': {
            'title': 'Type',
            'options': {
                'spherical': 'Spherical',
                'paraboloid': 'Paraboloid'
            },
            'info': 'The diameter of the primary is typically the same as the aperture diameter.',
            'default': 'paraboloid'
        },
        'primary_diameter': {
            'title': 'Diameter',
            'info': 'The diameter of the primary is typically the same as the aperture diameter.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': '$unit$aperture_diameter'
            },
            'output': true,
            'convertable': true,
            'calculate': (o) => (o.aperture_diameter)
        },
        'primary_radius': {
            'title': 'Radius',
            'info': 'The radius of the primary is typically the same as the aperture radius.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': '$unit$primary_diameter'
            },
            'output': true,
            'convertable': true,
            'calculate': (o) => (o.primary_diameter / 2)
        },
        'primary_focal_length': {
            'title': 'Focal Length',
            'info': 'The focal length of the primary mirror. Typcially twice the primary diameter.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'default': '$unit$primary_diameter'
            },
            'convertable': true,
            'calculate': (o) => (o.primary_diameter * 2)
        },
        'primary_focal_ratio': {
            'title': 'Focal Ratio',
            'info': 'The formula for the [focal ratio][focal ratio] or f-number is \\\\(N = \dfrac{f}{D}\\\\)',
            'convertable': true,
            'calculate': (o) => (o.primary_focal_length / o.primary_diameter)
        },
        'primary_thickness': {
            'title': 'Blank Thickness',
            'info': 'The blank thickness used for the primary mirror. Used in determining weight, volume, etc.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'in'],
                'default': '$unit$primary_diameter'
            },
            'convertable': true,
            'default': 50.8
        },
        'primary_depth': {
            'title': 'Depth',
            'info': 'The depth from the paraboloid vertex to the rim of the mirror. The formula to calculate the depth of the dish is \\\\(h = \dfrac{1}{2g}w^2r^2\\\\)',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'in'],
                'default': '$unit$primary_thickness'
            },
            'convertable': true,
            'calculate': (o) => {
                if (o.primary_type === 'spherical') {
                    return o.primary_focal_length - Math.sqrt(Math.pow(o.primary_focal_length, 2) - Math.pow(o.primary_radius, 2));
                }
                if (o.primary_type === 'paraboloid') {
                    return Math.pow(o.primary_radius, 2) / (4 * o.primary_focal_length);
                }
                return NaN;
            }
        },
        'primary_area': {
            'title': 'Surface Area',
            'info': 'The area of the concave primary mirror. The formula to determine the concave surface area is \\\\(a = \dfrac{\pi r}{6d^2}\times((r^2 + 4d^2)^{3/2}-r^3)\\\\)',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'm', 'in', 'ft'],
                'exponent': 2,
                'default': '$unit$primary_diameter'
            },
            'convertable': true,
            'calculate': (o) => {
                var r = o.primary_radius;
                var r2 = Math.pow(r, 2);
                var d = o.primary_depth;

                if (o.primary_type === 'spherical') {
                    return 2 * Math.PI * r * d;
                }
                if (o.primary_type === 'paraboloid') {
                    return ((Math.PI * r) / (6 * Math.pow(d, 2))) * (Math.pow((r2 + (4 * Math.pow(d, 2))), 3/2) - Math.pow(r, 3));
                }
                return NaN;
            }
        },
        'primary_dish_volume': {
            'title': 'Dish Volume',
            'info': 'The volume of the dish formed by the paraboloidal mirror. The formula for the volume of a paraboloid is \\\\(v = \dfrac{1}{2}pr^2d\\\\).',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'in'],
                'exponent': 3,
                'default': '$unit$primary_diameter'
            },
            'convertable': true,
            'calculate': (o) => {
                var r = o.primary_radius;
                var d = o.primary_depth;
                if (o.primary_type === 'spherical') {
                    return ((Math.PI * d) / 6) * (3 * Math.pow(r, 2) + Math.pow(d, 2));
                }
                if (o.primary_type === 'paraboloid') { // We know the exact formula for paraboloidal volume
                    return (Math.PI * Math.pow(r, 2) * d) / 2;
                }
                return NaN;
            }
        },
        'primary_material_volume': {
            'title': 'Material Volume',
            'info': 'A rough estimate of the volume of the material used to create the mirror.',
            'unit': {
                'type': 'length',
                'options': ['mm', 'cm', 'in'],
                'exponent': 3,
                'default': '$unit$primary_dish_volume'
            },
            'convertable': true,
            'calculate': (o) => {
                var r = o.primary_radius;
                var t = o.primary_thickness;
                var v = o.primary_dish_volume;

                return (Math.PI * Math.pow(r, 2) * t) - v;
            }
        },
        'primary_mass': {
            'title': 'Mass',
            'info': 'A rough estimate of the mass of the material required to construct the primary mirror.',
            'unit': {
                'type': 'mass',
                'options': ['g', 'kg', 'oz', 'lb'],
                'exponent': 1,
                'default': 'g'
            },
            'convertable': true,
            'calculate': (o) => {
                var volume = convert(o.primary_material_volume, o.unit_of_length, 'cm', 3);
                return convert(volume * 28, 'g', o.unit_of_mass); // Assuming glass for mirror material
            }
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
            'convertable': true,
            'calculate': (o) => {
                var rad = Math.sqrt(convert(G, 'm', o.unit_of_length) / (o.primary_focal_length * 2));
                if ('rpm' === o.unit_of_rotation) {
                    return 0.159155 * rad * 60;
                }
                return convert(rad, 'rad', o.unit_of_rotation);
            }
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