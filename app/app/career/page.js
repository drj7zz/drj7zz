'use client';
import React from 'react';
import Link from 'next/link';
import { careerStrengths } from '../../lib/data';
import { ArrowRight } from 'lucide-react';

export default function CareerPage() {
  return (
    <section className="career-panel" aria-labelledby="career-title">
      <div className="career-intro">
        <p className="section-label">03 / Engineering Focus</p>
        <h2 id="career-title">Engineering dependable frontend solutions.</h2>
        <p>
          Delivering thoughtful implementation, scalable architecture, and production-grade user experiences with strong technical ownership and collaborative execution.
        </p>
        <Link className="text-link" href="/connect">
          Open to frontend engineering roles, contract work, and technical collaboration <ArrowRight size={14} />
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
