import { Draft, produce } from 'immer';
import { StateCreator } from 'zustand';

type EntityId = string;

interface EntityBase {
  id: EntityId;
}

export interface Update<Entity> {
  id: EntityId;
  update: Partial<Entity>;
}

export type EntitySetter<Entity extends EntityBase> = (
  state: EntityAdapter<Entity>
) => EntityAdapter<Entity>;

export interface EntityAdapter<Entity extends EntityBase> {
  // state
  ids: EntityId[];
  entities: Record<EntityId, Entity>;
  // actions
  /**
   * Add one entity to the collection, if that entity doesn't exist already.
   */
  addOne(entity: Entity): void;
  /**
   * Applies a partial update in an entity searched by the `id` property, if the entity searched exists.
   */
  updateOne(update: Update<Entity>): void;
  /**
   * Removes an entity from the collection.
   */
  removeOne(entity: Entity): void;
  /**
   * Removes an entity from the collection by id
   */
  removeOneById(id: EntityId): void;
  /**
   * Removes all entities from the collection.
   */
  removeAll(): void;
}

export function createEntity<
  Entity extends EntityBase,
  State extends EntityAdapter<Entity> = EntityAdapter<Entity>,
>(setState: Parameters<StateCreator<State>>['0']): EntityAdapter<Entity> {
  function getId(entity: Entity) {
    return entity.id;
  }

  function setOne(state: State, entity: Entity): State {
    const id = getId(entity);

    return produce(state, draftState => {
      const { entities } = draftState;
      entities[id] = entity as Draft<Entity>;
      draftState.ids.push(id);
    });
  }

  function addOne(state: State, entity: Entity): State {
    const id = getId(entity);

    if (state.ids.includes(id)) {
      // TODO: should we maybe throw an error here?
      return state;
    }

    return setOne(state, entity);
  }

  function updateOne(state: State, { id, update }: Update<Entity>): State {
    const entity = state.entities[id];

    if (!entity) {
      // TODO: maybe an error?
      return state;
    }

    return produce(state, draftState => {
      const { entities } = draftState;
      entities[id] = {
        ...entities[id],
        ...update,
      };
    });
  }

  function removeOne(state: State, entity: Entity): State {
    const id = getId(entity);

    return removeOneById(state, id);
  }

  function removeOneById(state: State, id: EntityId): State {
    return produce(state, draftState => {
      delete draftState.entities[id];
      draftState.ids.filter(v => v !== id);
    });
  }

  return {
    // state
    ids: [],
    entities: {},
    // actions
    removeAll() {
      setState(state => ({ ...state, ids: [], entities: {} }));
    },
    addOne(entity) {
      setState(state => addOne(state, entity));
    },
    updateOne(entity) {
      setState(state => updateOne(state, entity));
    },
    removeOne(entity) {
      setState(state => removeOne(state, entity));
    },
    removeOneById(id) {
      setState(state => removeOneById(state, id));
    },
  };
}
