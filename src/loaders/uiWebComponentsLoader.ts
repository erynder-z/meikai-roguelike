import { BuffsDisplay } from '../ui/buffs/buffsDisplay';
import { CommandDirectionScreenDisplay } from '../ui/commandDirectionScreenDisplay/commandDirectionScreenDisplay';
import { EntityInfoCard } from '../ui/entityInfoDisplay/entityInfoCard';
import { EquipmentDisplay } from '../ui/equipment/equipmentDisplay';
import { EquipmentScreenDisplay } from '../ui/equipmentScreenDIsplay/equipmentScreenDisplay';
import { FlashDisplay } from '../ui/flashDisplay/flashDisplay';
import { GameOverScreenDisplay } from '../ui/gameOverScreenDisplay/gameOverScreenDisplay';
import { MessagesDisplay } from '../ui/messages/messagesDisplay';
import { MiscInfo } from '../ui/miscInfo/miscInfo';
import { IngameMenu } from '../ui/menu/ingameMenu';
import { IngameOptions } from '../ui/menu/ingameOptions';
import { InventoryScreenDisplay } from '../ui/inventoryScreenDisplay/inventoryScreenDisplay';
import { ItemScreenDisplay } from '../ui/itemScreenDisplay/itemScreenDisplay';
import { LevelDepthInfo } from '../ui/miscInfo/levelDepthInfo';
import { LevelTemperatureInfo } from '../ui/miscInfo/levelTemperatureInfo';
import { LogScreenDisplay } from '../ui/logScreenDisplay/logScreenDisplay';
import { PlayerHealthInfo } from '../ui/miscInfo/playerHealthInfo';
import { PlayerSetup } from '../ui/menu/playerSetup';
import { PopupBoxGood } from '../ui/popup/popupBoxGood';
import { PostMortem } from '../ui/postMortem/postMortem';
import { SpellScreenDisplay } from '../ui/spellScreenDisplay/spellScreenDisplay';
import { StatsScreenDisplay } from '../ui/statsScreenDisplay/statsScreenDisplay';
import { TitleMenu } from '../ui/menu/titleMenu';
import { TitleMenuOptions } from '../ui/menu/titleMenuOptions';
import { TitleScreen } from '../ui/menu/titleScreen';

// Define and register custom elements for each UI element
customElements.define('title-screen', TitleScreen);
customElements.define('title-menu', TitleMenu);
customElements.define('title-menu-options', TitleMenuOptions);
customElements.define('player-setup', PlayerSetup);
customElements.define('misc-info', MiscInfo);
customElements.define('messages-display', MessagesDisplay);
customElements.define('buffs-display', BuffsDisplay);
customElements.define('equipment-display', EquipmentDisplay);
customElements.define('flash-display', FlashDisplay);
customElements.define('ingame-menu', IngameMenu);
customElements.define('ingame-options', IngameOptions);
customElements.define('log-screen-display', LogScreenDisplay);
customElements.define('inventory-screen-display', InventoryScreenDisplay);
customElements.define('equipment-screen-display', EquipmentScreenDisplay);
customElements.define('item-screen-display', ItemScreenDisplay);
customElements.define('spell-screen-display', SpellScreenDisplay);
customElements.define('stats-screen-display', StatsScreenDisplay);
customElements.define(
  'command-direction-screen-display',
  CommandDirectionScreenDisplay,
);
customElements.define('game-over-screen-display', GameOverScreenDisplay);
customElements.define('post-mortem', PostMortem);
customElements.define('popup-box-good', PopupBoxGood);
customElements.define('entity-info-card', EntityInfoCard);
customElements.define('player-health-info', PlayerHealthInfo);
customElements.define('level-depth-info', LevelDepthInfo);
customElements.define('level-temperature-info', LevelTemperatureInfo);
