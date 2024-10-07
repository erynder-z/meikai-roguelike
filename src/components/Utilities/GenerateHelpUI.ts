export class GenerateHelpUI {
  public static async generate() {
    const body = document.getElementById('body-help');

    if (!body) {
      console.error('Body element not found');
      return;
    }

    // Main help container
    const helpContainer = document.createElement('div');
    helpContainer.classList.add('help-container');

    // Tab container
    const tabContainer = document.createElement('div');
    tabContainer.classList.add('tab-container');

    // Tabs (controls, buffs, environment, items, mobs, concepts)
    const tabs = [
      {
        target: 'controls',
        textBeforeUnderline: 'C',
        underline: 'o',
        textAfterUnderline: 'ntrols',
      },
      {
        target: 'buffs',
        textBeforeUnderline: '',
        underline: 'B',
        textAfterUnderline: 'uffs',
      },
      {
        target: 'environment',
        textBeforeUnderline: '',
        underline: 'E',
        textAfterUnderline: 'nvironment',
      },
      {
        target: 'items',
        textBeforeUnderline: '',
        underline: 'I',
        textAfterUnderline: 'tems',
      },
      {
        target: 'mobs',
        textBeforeUnderline: '',
        underline: 'M',
        textAfterUnderline: 'obs',
      },
      {
        target: 'concepts',
        textBeforeUnderline: 'Concep',
        underline: 't',
        textAfterUnderline: 's',
      },
    ];

    // Generate tabs dynamically
    tabs.forEach((tabData, index) => {
      const tab = document.createElement('div');
      tab.classList.add('tab');
      if (index === 0) tab.classList.add('active'); // Make the first tab active
      tab.dataset.target = tabData.target;

      const beforeTextNode = document.createTextNode(
        tabData.textBeforeUnderline,
      );
      const afterTextNode = document.createTextNode(tabData.textAfterUnderline);

      const underlineSpan = document.createElement('span');
      underlineSpan.classList.add('underline');
      underlineSpan.innerText = tabData.underline;

      tab.appendChild(beforeTextNode);
      tab.appendChild(underlineSpan);
      tab.appendChild(afterTextNode);

      tabContainer.appendChild(tab);
    });

    // Append tab container to the main help container
    helpContainer.appendChild(tabContainer);

    // Tab contents (controls, buffs, environment, items, mobs, concepts)
    const contents = [
      { id: 'controls', component: 'help-controls', active: true },
      { id: 'buffs', component: 'help-buffs', active: false },
      { id: 'environment', component: 'help-environment', active: false },
      { id: 'items', component: 'help-items', active: false },
      { id: 'mobs', component: 'help-mobs', active: false },
      { id: 'concepts', component: 'help-other', active: false },
    ];

    // Generate content dynamically
    contents.forEach(content => {
      const contentDiv = document.createElement('div');
      contentDiv.id = content.id;
      contentDiv.classList.add('tab-content');
      if (content.active) contentDiv.classList.add('active');

      const component = document.createElement(content.component);
      contentDiv.appendChild(component);

      helpContainer.appendChild(contentDiv);
    });

    // Close button
    const closeButton = document.createElement('close-button');
    helpContainer.appendChild(closeButton);

    // Append the main help container to the body
    body.appendChild(helpContainer);

    this.initializeTabs();
  }

  private static initializeTabs() {
    const tabElements = document.querySelectorAll(
      '.tab',
    ) as NodeListOf<HTMLElement>;
    const contentElements = document.querySelectorAll('.tab-content');

    const handleTabClick = (tabElement: HTMLElement) => {
      tabElements.forEach(tab => tab.classList.remove('active'));
      contentElements.forEach(content => content.classList.remove('active'));
      tabElement.classList.add('active');

      const targetContentId = tabElement.getAttribute('data-target');
      const targetContent = targetContentId
        ? document.getElementById(targetContentId)
        : null;
      targetContent?.classList.add('active');
    };

    tabElements.forEach(tabElement =>
      tabElement.addEventListener('click', () => handleTabClick(tabElement)),
    );

    document.addEventListener('keydown', event => {
      switch (event.key) {
        case 'o':
          handleTabClick(
            document.querySelector('[data-target="controls"]') as HTMLElement,
          );
          break;
        case 't':
          handleTabClick(
            document.querySelector('[data-target="concepts"]') as HTMLElement,
          );
          break;
        case 'B':
          handleTabClick(
            document.querySelector('[data-target="buffs"]') as HTMLElement,
          );
          break;
        case 'E':
          handleTabClick(
            document.querySelector(
              '[data-target="environment"]',
            ) as HTMLElement,
          );
          break;
        case 'I':
          handleTabClick(
            document.querySelector('[data-target="items"]') as HTMLElement,
          );
          break;
        case 'M':
          handleTabClick(
            document.querySelector('[data-target="mobs"]') as HTMLElement,
          );
          break;
      }
    });
  }
}
