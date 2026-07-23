import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
};

export default meta;

export const Default = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Technician Card</CardTitle>
        <CardDescription>View assigned field service details</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Technician ID #4092 is assigned to downtown HVAC unit maintenance.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm">Dismiss</Button>
        <Button variant="primary" size="sm">View Details</Button>
      </CardFooter>
    </Card>
  ),
};
