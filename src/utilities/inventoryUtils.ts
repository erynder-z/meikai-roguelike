import { ItemObject } from '../gameLogic/itemObjects/itemObject';

export type GroupedItem = {
  item: ItemObject;
  count: number;
};

/**
 * Takes an array of item objects and groups them by their properties.
 * This function treats two items as the same if all their properties are equal,
 * except for their id. This is used for grouping items in the player's
 * inventory or during crafting.
 *
 * @param items The items to group.
 * @return An array of items, where each item has a count of how many times it
 * appeared in the original array.
 */
export function groupInventory(items: ItemObject[]): GroupedItem[] {
  const itemMap = new Map<string, GroupedItem>();

  for (const item of items) {
    const key = JSON.stringify({
      ...item,
      id: '',
    });

    if (itemMap.has(key)) {
      itemMap.get(key)!.count++;
    } else {
      itemMap.set(key, { item: item, count: 1 });
    }
  }

  return Array.from(itemMap.values());
}
