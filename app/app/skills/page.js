'use client';
import React from 'react';
import Link from 'next/link';
import { skills } from '../../lib/data';
import { Code2, Layout, GitBranch, ArrowRight } from 'lucide-react';

const ICON_MAP = {
  Code2,
  Layout,
  GitBranch
};

export default function SkillsPage() {
  return (
    <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '780px' }}>
      <section className="section-panel" aria-labelledby="skills-title">
        <p className="section-label">02 / Focus</p>
        <h2 id="skills-title">Skills I am sharpening.</h2>
        <p>
          My focus centers on browser fundamentals, modern JavaScript, semantic markup, and responsive web design.
        </p>

        <div className="skill-list" style={{ marginTop: '24px' }}>
          {skills.map(([iconKey, title, description, level]) => {
            const IconComp = ICON_MAP[iconKey] || Code2;
            return (
              <article className="skill" key={title}>
                <span className="skill-icon">
                  <IconComp size={16} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className="skill-level">{level}</span>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: '32px' }}>
          <Link className="button" href="/career">
            View career direction <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
