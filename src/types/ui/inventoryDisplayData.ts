import { ItemObject } from '../../gameLogic/itemObjects/itemObject';

export type InventoryDisplayData = {
  items: ItemObject[];
  wornItemsWeight: number;
};
