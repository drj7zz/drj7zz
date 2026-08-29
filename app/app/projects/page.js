'use client';
import React from 'react';
import { projects } from '../../lib/data';
import { ExternalLink, Github } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <div className="projects-intro">
        <p className="section-label">04 / Selected projects</p>
        <h2 id="projects-title">Work I have built and continue to improve.</h2>
        <p>
          Each project reflects my interest in thoughtful interfaces, practical web tools, and learning through building in public.
        </p>
      </div>

      <div className="project-list">
        {projects.map((project, index) => (
          <article className="project" key={project.name}>
            <span className="project-number">0{index + 1}</span>
            <div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <span className="project-stack">{project.stack}</span>
            <div className="project-links">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer">
                  Live site <ExternalLink size={12} />
                </a>
              )}
              <a href={project.code} target="_blank" rel="noopener noreferrer">
                Source <Github size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
