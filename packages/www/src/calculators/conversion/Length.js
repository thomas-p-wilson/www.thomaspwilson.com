import React from 'react';
import ConversionView from './ConversionView';
import { measures } from '@thomaspwilson/react-calculator';

export default () => (
    <ConversionView measure={ measures.length } base="length-metric-metre" />
)
