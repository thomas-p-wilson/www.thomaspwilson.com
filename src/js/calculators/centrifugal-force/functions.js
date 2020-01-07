import { sq } from '../helpers';

export function surfaceSpeed(rotation, radius) {
	// v = ω * 2 * π * r
	return rotation * radius;
}

export function centrifugalForce(mass, speed, radius) { // g, cm
	// F = m * v^2 / r
	return mass * sq(speed) / radius;
}

export function centripetalAcceleration(speed, radius) { // cm/s, cm
	console.log('Speed: ', speed);
	console.log('Radius: ', radius);
	// a_c = v^2 / r
	// where
	// a_c = acceleration, centripetal, m/s2
	//   v = velocity, m/s
	//   r = radius, m
	return sq(speed) / radius;


// a_c = v^2 / r
//     = ω^2 r
//     = (2 π nrps)^2 r
//     = (2 π nrpm / 60)^2 r
//     = (π nrpm / 30)^2 r
//
// where
//   a_c = centripetal acceleration (m/s2, ft/s2)
//     v = tangential velocity (m/s, ft/s)
//     r = circular radius (m, ft)
//     ω = angular velocity (rad/s)
//  nrps = revolutions per second (rev/s, 1/s)
//  nrpm = revolutions per min (rev/min, 1/min)



// function calculate() {
// 	var c = new Number();
// 	var a,b,m,u,ua,radius,linear_speed,angular_speed,mass,centrifugal_acceleration,centrifugal_force;
// 	radius = parseFloat(document.calculator.radius.value);
// 	u = document.calculator.uradius.options[document.calculator.uradius.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
//  	};
// 	radius = Math.pow(((radius - a) / m), (1 / b));
// 	linear_speed = parseFloat(document.calculator.linear_speed.value);
// 	u = document.calculator.ulinear_speed.options[document.calculator.ulinear_speed.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
//  	};
//  	linear_speed = Math.pow(((linear_speed - a) / m), (1 / b));

// 	angular_speed = parseFloat(document.calculator.angular_speed.value);
// 	u = document.calculator.uangular_speed.options[document.calculator.uangular_speed.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
//  	};
//  	angular_speed = Math.pow(((angular_speed-a)/m),(1/b));

// 	mass = parseFloat(document.calculator.mass.value);
// 	u = document.calculator.uid.options[document.calculator.uid.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
//  	};
//  	mass = Math.pow(((mass - a) / m), (1 / b));

// 	as = linear_speed / radius;

// 	if (angular_speed > 0) {
// 		as = angular_speed;
// 	}
// 	centrifugal_acceleration = as * as * radius;

// 	centrifugal_force = centrifugal_acceleration * mass;

// 	u = document.calculator.uoa.options[document.calculator.uoa.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
// 	};
// 	centrifugal_acceleration = Math.pow(centrifugal_acceleration,b) * m + a;

// 	if (centrifugal_acceleration.toPrecision) {
// 		centrifugal_acceleration = centrifugal_acceleration.toPrecision(6);
// 	}
// 	document.calculator.centrifugal_acceleration.value = centrifugal_acceleration;
// 	u = document.calculator.uob.options[document.calculator.uob.selectedIndex].value;
// 	ua = u.split(":",3);
// 	m = parseFloat(ua[0]);
// 	b = parseFloat(ua[1]);
// 	a = parseFloat(ua[2]);
// 	if (m == 0 && a == 0 && b == 0) {
// 		return false;
// 	};
// 	centrifugal_force = Math.pow(centrifugal_force,b) * m + a;

// 	if(centrifugal_force.toPrecision) {
// 		centrifugal_force=centrifugal_force.toPrecision(6);
// 	}
// 	document.calculator.centrifugal_force.value = centrifugal_force;

// 	return false;
// }




}


// Hz = RAD
//  1 = 2 * pi
//    = 6.28

//  R = 