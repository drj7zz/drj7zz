// Build the page entirely from JavaScript so the HTML remains minimal.

document.addEventListener('DOMContentLoaded', () => {
  const appBody = document.body;
  appBody.classList.add('js-enabled');

  const data = {
    title: 'KAALYUG',
    tagline: 'Organization • Open-source • Nepal',
    name: 'DRJ',
    subtitle: 'Developer · Learner · Open-source',
    avatar: 'images/10.jpg',
    logo: 'images/logo.png',
    skills: ['Frontend Developer', 'Learner', 'Open-source Enthusiast'],
    socials: [
      { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/drj7zz', title: 'Instagram (opens in new tab)', aria: 'Instagram (opens in new tab)', iconClass: 'fa-brands fa-instagram' },
      { key: 'github', label: 'GitHub', href: 'https://github.com/drj7zz', title: 'GitHub (opens in new tab)', aria: 'GitHub (opens in new tab)', iconClass: 'fa-brands fa-github' },
      { key: 'reddit', label: 'Reddit', href: 'https://www.reddit.com/user/Ok-Fox-4670', title: 'Reddit (opens in new tab)', aria: 'Reddit (opens in new tab)', iconClass: 'fa-brands fa-reddit' },
      { key: 'email', label: 'Email', href: 'mailto:giridirghraj@gmail.com', title: 'Email', aria: 'Send email to giridirghraj@gmail.com', iconClass: 'fa-solid fa-envelope' }
    ],
    stickers: [
      { label: 'JavaScript', iconClass: 'fa-brands fa-js', color: '#f7df1e' },
      { label: 'Frontend', iconClass: 'fa-solid fa-code', color: '#2563eb' },
      { label: 'Open Source', iconClass: 'fa-solid fa-users', color: '#10b981' },
      { label: 'Creative', iconClass: 'fa-solid fa-lightbulb', color: '#f97316' },
      { label: 'Instagram', href: 'https://www.instagram.com/drj7zz', iconClass: 'fa-brands fa-instagram', color: '#e1306c' },
      { label: 'GitHub', href: 'https://github.com/drj7zz', iconClass: 'fa-brands fa-github', color: '#111111' }
    ],
    details: [
      'Education: XI (+2 PCM)',
      'Location: Madhesh (Parsa), Nepal',
      'Role: Frontend Developer · Open-source Enthusiast',
      'Focus: accessible UI, responsive layouts, polished web interactions',
      'Interests: JavaScript, clean design, developer tooling and community'
    ],
    footer: 'Site updated: markup, styles and interactive pointer added.'
  };

  function createElement(name, options = {}) {
    const el = document.createElement(name);
    if (options.className) el.className = options.className;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
      });
    }
    return el;
  }

  function createSocialLink(social) {
    const anchor = createElement('a', {
      className: `social ${social.key}`,
      attrs: {
        href: social.href,
        target: social.href.startsWith('mailto:') ? '_self' : '_blank',
        rel: social.href.startsWith('mailto:') ? 'noopener' : 'noopener noreferrer',
        title: social.title,
        'aria-label': social.aria
      }
    });
    const icon = createElement('span', { className: 'icon' });
    icon.innerHTML = `<i class="${social.iconClass}" aria-hidden="true"></i>`;

    const label = createElement('span', { className: 'label', text: social.label });
    anchor.append(icon, label);
    return anchor;
  }

  function createStickerTag(tag) {
    const element = tag.href ? createElement('a', {
      className: 'sticker',
      attrs: {
        href: tag.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: tag.label
      }
    }) : createElement('span', { className: 'sticker' });

    const rotation = Math.floor(Math.random() * 9 - 4);
    element.style.setProperty('--sticker-rotate', `${rotation}deg`);
    element.style.setProperty('--sticker-color', tag.color || '#3b82f6');
    element.innerHTML = `<i class="${tag.iconClass}" aria-hidden="true"></i><span>${tag.label}</span>`;
    return element;
  }

  const header = createElement('header', { className: 'container header' });
  const logoWrapper = createElement('div', { className: 'logo' });
  const logoImage = createElement('img', {
    attrs: { src: data.logo, alt: 'DRJ logo', class: 'logo-img' }
  });
  logoWrapper.appendChild(logoImage);
  const headerText = createElement('div');
  headerText.append(
    createElement('div', { className: 'site-title', text: data.title }),
    createElement('div', { className: 'tagline', text: data.tagline })
  );
  header.append(logoWrapper, headerText);

  const main = createElement('main', { className: 'container' });
  const profileCard = createElement('section', { className: 'profile-card' });

  const avatarWrapper = createElement('div');
  const avatar = createElement('img', {
    attrs: { src: data.avatar, alt: 'DRJ profile', class: 'avatar' }
  });
  avatar.addEventListener('error', () => {
    avatar.style.display = 'none';
  });
  avatarWrapper.appendChild(avatar);

  const info = createElement('div', { className: 'info' });
  info.append(
    createElement('h2', { text: data.name }),
    createElement('p', { className: 'tagline', text: data.subtitle }),
    createElement('div', { className: 'chips' })
  );

  const stickersContainer = createElement('div', {
    className: 'stickers',
    attrs: { 'aria-label': 'Profile sticker tags' }
  });
  data.stickers.forEach(tag => stickersContainer.appendChild(createStickerTag(tag)));

  const socialsContainer = createElement('div', {
    className: 'socials',
    attrs: { 'aria-label': 'Social links', style: 'margin-top:12px' }
  });
  data.socials.forEach(social => socialsContainer.appendChild(createSocialLink(social)));

  const section = createElement('div', { className: 'section' });
  section.append(createElement('h3', { text: 'About' }));
  const card = createElement('div', { className: 'card' });
  const detailsList = createElement('ul');
  data.details.forEach(text => detailsList.appendChild(createElement('li', { text })));
  card.appendChild(detailsList);
  section.appendChild(card);

  info.appendChild(stickersContainer);
  info.appendChild(socialsContainer);
  info.appendChild(section);
  profileCard.append(avatarWrapper, info);
  main.append(profileCard, createElement('div', { className: 'footer', text: data.footer }));

  const noScript = document.querySelector('noscript.noscript-warning');
  if (noScript) noScript.remove();

  appBody.append(header, main);

  const chipsEl = document.querySelector('.chips');
  data.skills.forEach(skill => {
    const chip = createElement('span', { className: 'chip', text: skill });
    chipsEl.appendChild(chip);
  });

  const popup = createElement('div', { className: 'link-popup' });
  popup.setAttribute('role', 'status');
  appBody.appendChild(popup);

  let popupTimer = null;
  document.querySelectorAll('.social').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const rect = anchor.getBoundingClientRect();
      const left = rect.left + rect.width / 2;
      const top = rect.top - 8;
      popup.textContent = anchor.title || anchor.getAttribute('aria-label') || 'Opening';
      popup.style.left = `${left}px`;
      popup.style.top = `${Math.max(8, top)}px`;
      popup.classList.add('show');
      anchor.classList.add('active');
      clearTimeout(popupTimer);
      popupTimer = setTimeout(() => {
        popup.classList.remove('show');
        anchor.classList.remove('active');
      }, 1200);
    });
  });
});
