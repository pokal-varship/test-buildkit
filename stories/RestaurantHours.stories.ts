// Replace your-framework with the name of your framework
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within, expect, fn } from 'storybook/test';
import { StoreFrontHours } from '@components/storeFront/StoreFrontHours';


const meta: Meta<typeof StoreFrontHours> = {
    component: StoreFrontHours,
};

export default meta;
type Story = StoryObj<typeof StoreFrontHours>;

/*
 * See https://storybook.js.org/docs/writing-stories/play-function#working-with-the-canvas
 * to learn more about using the canvasElement to query the DOM
 */
export const Default: Story = {
    play: async ({ args, canvasElement, step }: { args: any, canvasElement: any, step: any }) => {
        const canvas = within(canvasElement);

        await step('Click Button', async () => {
            await userEvent.click(canvas.getByRole('button'));
        });

        await step('Submit Helper', async () => {
            await userEvent.click(canvas.getByRole('button'));
        });

        // 👇 Now we can assert that the onSubmit arg was called
        await waitFor(() => expect(args.onClick).toHaveBeenCalled());
    },
};
