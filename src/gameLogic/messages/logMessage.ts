export enum EventCategory {
  buff,
  mobDamage,
  mobDeath,
  heal,
  unknown,
  unable,
  dig,
  door,
  drop,
  equip,
  playerDamage,
  playerDeath,
  attack,
  layingObject,
  pickup,
  lvlChange,
  moving_UP,
  moving_DOWN,
  moving_LEFT,
  moving_RIGHT,
  moving_UP_LEFT,
  moving_UP_RIGHT,
  moving_DOWN_LEFT,
  moving_DOWN_RIGHT,
  rangedAttack,
  wait,
  look,
  none,
  teleport,
  use,
  mobSpawn,
  trap,
  chasmDanger,
  hungerDamage,
  thirstDamage,
}
export class LogMessage {
  private static idCounter = 0;
  public id: number;

  constructor(
    public message: string,
    public category: EventCategory,
  ) {
    this.id = LogMessage.idCounter++;
  }
}
