'use client';
import React, { useEffect, useState } from 'react';
import { ExternalLink, GitBranch, RefreshCw } from 'lucide-react';

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const res = await fetch('/api/projects');
        if (res.ok) {
          const json = await res.json();
          setProjectsList(json.data || []);
        }
      } catch (_err) {
        setProjectsList([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <div className="projects-intro">
        <p className="section-label">04 / Selected Works</p>
        <h2 id="projects-title">Engineered for performance and clarity.</h2>
        <p>
          A curated selection of production applications, interactive browser architectures, and open-source systems.
        </p>
        <p className="kaalyug-note">
          Each application is architected with modular design patterns, strict state management, and responsive user experience across modern platforms.
        </p>
      </div>

      <div className="project-list">
        {loading && (
          <p style={{ color: 'var(--muted)', font: '11px "DM Mono", monospace', margin: '20px 0' }}>
            <RefreshCw size={12} style={{ display: 'inline', marginRight: '6px' }} />
            Loading projects...
          </p>
        )}

        {!loading && projectsList.length === 0 && (
          <div style={{ padding: '36px 0', color: 'var(--muted)', fontSize: '13px' }}>
            No projects added yet. Add projects in the <a href="/admin" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Admin Dashboard</a>.
          </div>
        )}

        {projectsList.map((project, idx) => (
          <article className="project" key={project.name || idx}>
            <span className="project-number">0{idx + 1}</span>
            <div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <span className="project-stack">{project.stack}</span>
            <div className="project-links">
              {project.code && (
                <a href={project.code} target="_blank" rel="noopener noreferrer">
                  <GitBranch size={12} /> Source
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} /> Live
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
