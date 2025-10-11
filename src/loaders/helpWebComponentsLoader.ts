// Import all the individual help page modules
import { CloseButton } from '../helpPages/closeButton';
import { HelpBuffs } from '../helpPages/helpBuffs';
import { HelpControls } from '../helpPages/helpControls';
import { HelpEnvironment } from '../helpPages/helpEnvironment';
import { HelpItems } from '../helpPages/helpItems';
import { HelpMobs } from '../helpPages/helpMobs';
import { HelpOther } from '../helpPages/helpOther';

// Define and register custom elements for each help page
customElements.define('help-buffs', HelpBuffs);
customElements.define('help-other', HelpOther);
customElements.define('help-controls', HelpControls);
customElements.define('help-environment', HelpEnvironment);
customElements.define('help-items', HelpItems);
customElements.define('help-mobs', HelpMobs);
customElements.define('close-button', CloseButton);
