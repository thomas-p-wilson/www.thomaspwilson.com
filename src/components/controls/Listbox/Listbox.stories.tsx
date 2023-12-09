import { Meta, StoryObj } from '@storybook/react';

import { Listbox } from './Listbox';

const meta = {
  title: 'Basic Components / Listbox',
  component: Listbox,
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
} satisfies Meta<typeof Listbox>;
export default meta;

type Story = StoryObj<typeof Listbox>;

export const Basic: Story = {
  render: () => {
    return (
      <Listbox />
    );
  },
};
