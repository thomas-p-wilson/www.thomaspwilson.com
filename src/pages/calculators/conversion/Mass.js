import React from 'react';
import ConversionView from './ConversionView';
import { measures } from '../../../utils/conversion';

export default () => (
    <ConversionView measure={ measures.mass } base='mass-metric-gram' />
)