'use client';

import { Pause, Play, Trash2 } from 'lucide-react';
import { setSubscriberStatus, deleteSubscriber } from '../_actions';
import { ConfirmAction } from '../../_components/confirm-action';

const iconButton =
  'grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-bg hover:text-fg';

export function SubscriberRowActions({
  subscriberId,
  email,
  status,
}: {
  subscriberId: string;
  email: string;
  status: 'active' | 'unsubscribed';
}) {
  const isActive = status === 'active';

  return (
    <div className="flex items-center gap-1">
      <form
        action={setSubscriberStatus.bind(
          null,
          subscriberId,
          isActive ? 'unsubscribed' : 'active',
        )}
      >
        <button
          type="submit"
          aria-label={isActive ? 'Unsubscribe' : 'Reactivate'}
          title={isActive ? 'Unsubscribe' : 'Reactivate'}
          className={iconButton}
        >
          {isActive ? <Pause size={15} /> : <Play size={15} />}
        </button>
      </form>

      <ConfirmAction
        action={deleteSubscriber.bind(null, subscriberId)}
        title={`Delete ${email}?`}
        description="This permanently removes the subscriber record. They can re-subscribe later if they want."
        confirmLabel="Delete"
        destructive
        triggerAriaLabel="Delete"
        triggerTitle="Delete"
        triggerClassName="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </ConfirmAction>
    </div>
  );
}
