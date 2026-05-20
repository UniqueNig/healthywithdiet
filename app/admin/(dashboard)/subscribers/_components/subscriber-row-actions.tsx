'use client';

import { Pause, Play, Trash2 } from 'lucide-react';
import { setSubscriberStatus, deleteSubscriber } from '../_actions';

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

      <form
        action={deleteSubscriber.bind(null, subscriberId)}
        onSubmit={(e) => {
          if (
            !window.confirm(`Delete ${email}? This cannot be undone.`)
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          aria-label="Delete"
          title="Delete"
          className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </form>
    </div>
  );
}
