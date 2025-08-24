export type EquipmentItemData = {
  char: string;
  slot: string;
  weight: number;
  description: string;
};

export type EquipmentDisplayData = {
  items: EquipmentItemData[];
  inventoryWeight: number;
  maxCarryWeight: number;
};
