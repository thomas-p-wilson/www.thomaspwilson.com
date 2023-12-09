import { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Basic Components / Input',
  component: Input,
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
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof Input>;

export const Basic: Story = {
  render: () => (<Input name="test" />),
};

export const WithPlaceholder: Story = {
  render: () => (<Input name="test" placeholder="Type to begin..." />),
};

export const WithValue: Story = {
  render: () => (<Input name="test" value="Lorem ipsum" />),
};

// export const WithIcon: Story = {
//   render: () => (<Input value="Lorem ipsum" before={<SearchIcon />} />),
// };

// export const WithButton: Story = {
//   render: () => (<Input value="Lorem ipsum" after={<Button>Go!</Button>} />),
// };

// export const WithSuccess: Story = {
//   render: () => (<Input success value="Lorem ipsum" after={<CheckIcon />} />),
// };

// export const WithError: Story = {
//   render: () => (<Input error value="Lorem ipsum" after={<CloseIcon />} />),
// };

// export const WithMask: Story = {};
