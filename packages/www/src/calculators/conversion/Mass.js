import React from 'react';
import ConversionView from './ConversionView';
import { measures } from '@thomaspwilson/react-calculator';

export default () => (
    <ConversionView measure={ measures.mass } base='mass-metric-gram' />
)
