import { Meta, StoryObj } from '@storybook/react';

import { Card } from './Card';

const meta = {
  title: 'Basic Components / Card',
  component: Card,
  parameters: {
    layout: 'centered',
    controls:{
      exclude:/ref/g,
    },
  },
  tags: ['autodocs'],
  args: {
    children: 'Save',
  },
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof Card>;

export const Example: Story = {};

export const Unpadded: Story = {
  args: {
    unpadded: true,
  },
};
