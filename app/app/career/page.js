'use client';
import React from 'react';
import Link from 'next/link';
import { careerStrengths } from '../../lib/data';
import { ArrowRight } from 'lucide-react';

export default function CareerPage() {
  return (
    <section className="career-panel" aria-labelledby="career-title">
      <div className="career-intro">
        <p className="section-label">03 / Career direction</p>
        <h2 id="career-title">Growing into a dependable frontend partner.</h2>
        <p>
          I am building the foundation for a career in frontend development: thoughtful implementation, strong collaboration habits, and the confidence to take ownership of a user-facing experience.
        </p>
        <Link className="text-link" href="/connect">
          Open to internships, junior roles, and collaboration <ArrowRight size={14} />
        </Link>
      </div>

      <div className="strength-list">
        {careerStrengths.map((item) => (
          <article className="strength" key={item.number || item[0]}>
            <span>{item.number || item[0]}</span>
            <div>
              <h3>{item.title || item[1]}</h3>
              <p>{item.description || item[2]}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
