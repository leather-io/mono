import { Queue, QueueAddOptions } from 'p-queue';
import { v4 as uuid } from 'uuid';

type RunFunction = () => Promise<unknown>;

type PriorityQueueOptions = {
  priority?: number;
} & QueueAddOptions;

function lowerBound<T>(array: readonly T[], value: T, comparator: (a: T, b: T) => number): number {
  let first = 0;
  let count = array.length;

  while (count > 0) {
    const step = Math.trunc(count / 2);
    let it = first + step;

    if (comparator(array[it], value) <= 0) {
      first = ++it;
      count -= step + 1;
    } else {
      count = step;
    }
  }

  return first;
}

export class PriorityQueue implements Queue<RunFunction, PriorityQueueOptions> {
  readonly queue: (PriorityQueueOptions & { run: RunFunction; id: string })[] = [];

  enqueue(run: RunFunction, options?: Partial<PriorityQueueOptions>): void {
    options = {
      priority: 0,
      ...options,
    };
    const id = uuid();

    const element = {
      priority: options.priority,
      run,
      id,
    };

    options.signal?.addEventListener('abort', () => {
      const task = this.queue.find(task => task.id === id);

      if (task) {
        const index = this.queue.indexOf(task);
        this.queue.splice(index, 1);
      }
    });

    if (this.size && this.queue[this.size - 1].priority! >= options.priority!) {
      this.queue.push(element);
      return;
    }

    const index = lowerBound(
      this.queue,
      element,
      (a: Readonly<PriorityQueueOptions>, b: Readonly<PriorityQueueOptions>) =>
        b.priority! - a.priority!
    );

    this.queue.splice(index, 0, element);
  }

  dequeue(): RunFunction | undefined {
    const item = this.queue.shift();
    return item?.run;
  }

  filter(options: Readonly<Partial<PriorityQueueOptions>>): RunFunction[] {
    return this.queue
      .filter((element: Readonly<PriorityQueueOptions>) => element.priority === options.priority)
      .map((element: Readonly<{ run: RunFunction }>) => element.run);
  }

  get size(): number {
    return this.queue.length;
  }
}
