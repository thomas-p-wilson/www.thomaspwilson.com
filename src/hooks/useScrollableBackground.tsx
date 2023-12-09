// import { useEffect } from 'react';
import { RGB, hslToRgb, rgbStringToNumericComponent, rgbToHsl, rgbToString } from '../utils/color';


const useEffect = (_fn: any) => {}

export const colorAtPoint = ([r1, g1, b1]: RGB, [r2, g2, b2]: RGB, percent: number): RGB => {
    return [
        ((r2 - r1) * percent) + r1,
        ((g2 - g1) * percent) + g1,
        ((b2 - b1) * percent) + b1,
    ]
}

export const useScrollableBackground = (selector: string) => {
    let sections: any[] = [];
    let original: any;

    function scrollHandler() {
        const next = sections.find(([_color, position]) => (position >= window.scrollY));
        const prev = sections[sections.indexOf(next) - 1] || next;
        const transitionLength = next[1] - prev[1];
        const currentPosition = window.scrollY - prev[1];
        const percentComplete = currentPosition / transitionLength;
        const color = colorAtPoint(prev[0], next[0], percentComplete);
        document.body.style.background = rgbToString(...hslToRgb(...color));
    }

    useEffect(() => {
        // On mount
        original = document.body.style.background;
        sections = Array.from(document.body.querySelectorAll(selector))
            .map((s) => ([
                rgbToHsl(...rgbStringToNumericComponent(((s as any).dataset as any).background)),
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
