'use client';
import React, { useState } from 'react';
import { socialLinks } from '../../lib/data';
import { Radio, Mail, Copy, Check, Instagram, Github, Globe } from 'lucide-react';

const ICON_MAP = {
  Instagram,
  Github,
  Globe,
  Mail
};

export default function ConnectPage() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('giridirghraj@gmail.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2200);
    } catch (_err) {
      window.location.href = 'mailto:giridirghraj@gmail.com';
    }
  };

  return (
    <section className="connect" aria-labelledby="connect-title">
      <div className="connect-orbit" aria-hidden="true">
        <Radio size={20} />
      </div>
      <div className="connect-copy">
        <p className="section-label">Let us connect</p>
        <h2 id="connect-title">Let us build something useful.</h2>
        <p>I am open to junior frontend opportunities, internships, open-source work, and thoughtful collaborations.</p>
        <div className="connect-actions">
          <a className="email-action" href="mailto:giridirghraj@gmail.com">
            <Mail size={13} /> Send an email
          </a>
          <button className="copy-email" type="button" onClick={copyEmail}>
            {emailCopied ? (
              <><Check size={13} style={{ color: 'var(--accent)' }} /> Email copied</>
            ) : (
              <><Copy size={13} /> Copy email</>
            )}
          </button>
        </div>
      </div>
      <div className="socials" aria-label="Social links">
        {socialLinks.map(({ name, url, icon }) => {
          const IconComp = ICON_MAP[icon] || Globe;
          return (
            <a
              className="social"
              href={url}
              aria-label={name}
              title={name}
              key={name}
              {...(url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <IconComp size={14} />
              <span>{name}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
