
import { useEffect } from 'react';
import { hslToRgb, numericComponentToRgbString, rgbStringToNumericComponent, rgbToHsl } from './colors';

function colorAtPoint([r1, g1, b1], [r2, g2, b2], percent) {
    return [
        ((r2 - r1) * percent) + r1,
        ((g2 - g1) * percent) + g1,
        ((b2 - b1) * percent) + b1,
    ]
}

export function useScrollableBackground(selector) {
    let sections = [];
    let original;

    function scrollHandler() {
        const next = sections.find(([color, position]) => (position >= window.scrollY));
        const prev = sections[sections.indexOf(next) - 1] || next;
        const transitionLength = next[1] - prev[1];
        const currentPosition = window.scrollY - prev[1];
        const percentComplete = currentPosition / transitionLength;
        const color = colorAtPoint(prev[0], next[0], percentComplete);
        document.body.style.background = numericComponentToRgbString(...hslToRgb(...color));
    }

    useEffect(() => {
        // On mount
        original = document.body.style.background;
        sections = Array.from(document.body.querySelectorAll(selector))
            .map((s) => ([
                rgbToHsl(...rgbStringToNumericComponent(s.dataset.background)),
                s.getBoundingClientRect().top - document.body.getBoundingClientRect().top,
                s,
            ]));
        window.addEventListener('scroll', scrollHandler);
        scrollHandler();
        return () => {
            // Unmount
            document.body.style.background = original;
            window.removeEventListener('scroll', scrollHandler);
        }
    });
}