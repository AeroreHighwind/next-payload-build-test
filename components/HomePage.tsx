'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const sections = ['about', 'systems', 'archive', 'contact', 'SSR-PAGE'];

export default function HomePage() {
    const [activeSection, setActiveSection] = useState('about');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio - a.intersectionRatio
                    );

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                rootMargin: '-20% 0px -60% 0px',
                threshold: [0.1, 0.25, 0.5],
            }
        );

        sections.forEach((id) => {
            const element = document.getElementById(id);

            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <main className="grid-background">
            {/* HEADER */}
            <header className="nier-header">
                <div className="container nier-header-inner">
                    <a href="#" className="logo">
                        YORHA // SYSTEM
                    </a>

                    <nav className="nav">
                        {sections.map((section) => (
                            <a
                                key={section}
                                href={`${section !== 'SSR-PAGE' ? ('#'+section) : '/advancement'}`}
                                className={
                                    activeSection === section
                                        ? 'active'
                                        : ''
                                }
                            >
                                {section}
                            </a>
                        ))}
                    </nav>
                </div>
            </header>

            {/* HERO */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="system-text">
                        CONNECTION ESTABLISHED
                    </div>

                    <h1>
                        System
                        <br />
                        Interface
                    </h1>

                    <div className="divider-short" />

                    <p style={{ maxWidth: 620 }}>
                        The 14th Machine War has begun.
                        <br />
                        Current operation: 243rd Descent.
                    </p>

                    <p
                        className="text-muted"
                        style={{
                            maxWidth: 560,
                            fontSize: '0.95rem',
                        }}
                    >
                        Access the YoRHa network, review archived
                        intelligence, and begin your assigned
                        operational sequence.
                    </p>

                    <div className="mt-4">
                        <a href="#systems" className="btn btn-primary">
                            Initialize System
                        </a>

                        <a
                            href="#archive"
                            className="btn"
                            style={{ marginLeft: '1rem' }}
                        >
                            View Archive
                        </a>
                    </div>
                </div>
            </section>

            {/* STATUS BAR */}
            <section
                style={{
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(10, 10, 9, 0.75)',
                }}
            >
                <div
                    className="container"
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(3, 1fr)',
                    }}
                >
                    <div
                        style={{
                            padding: '1rem',
                            borderRight: '1px solid var(--border)',
                        }}
                    >
                        <div className="card-meta">
                            NETWORK
                        </div>

                        <div className="status status-online mt-1">
                            Operational
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '1rem',
                            borderRight: '1px solid var(--border)',
                        }}
                    >
                        <div className="card-meta">
                            SERVER
                        </div>

                        <div className="status status-online mt-1">
                            Connected
                        </div>
                    </div>

                    <div style={{ padding: '1rem' }}>
                        <div className="card-meta">
                            SECURITY
                        </div>

                        <div className="status status-warning mt-1">
                            Level 03
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="section">
                <div className="container">
                    <div className="system-line">
                        SYSTEM OVERVIEW
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                '1fr 1.5fr',
                            gap: '5rem',
                            marginTop: '3rem',
                            alignItems: 'start',
                        }}
                    >
                        <div>
                            <div className="system-text">
                                OPERATIONAL DIRECTIVE
                            </div>

                            <h2>
                                The mission
                                <br />
                                continues.
                            </h2>
                        </div>

                        <div>
                            <p>
                                Humanity has abandoned Earth.
                                The machines remain.
                            </p>

                            <p className="text-muted">
                                Our objective is not merely survival.
                                We are tasked with restoring what was
                                lost, recovering forgotten knowledge,
                                and maintaining the systems that remain.
                            </p>

                            <p className="text-muted">
                                Every operation contributes to the
                                archive. Every decision becomes part
                                of the record.
                            </p>

                            <div className="divider" />

                            <div className="system-line">
                                ALL SYSTEMS ARE SUBJECT TO CHANGE
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SYSTEMS */}
            <section id="systems" className="section">
                <div className="container">
                    <div className="system-line">
                        AVAILABLE SYSTEMS
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns:
                                    'repeat(3, 1fr)',
                            }}
                        >
                            <article className="card">
                                <div className="card-meta">
                                    SYSTEM // 01
                                </div>

                                <h3 className="card-title">
                                    Intelligence
                                </h3>

                                <p className="text-muted">
                                    Access operational intelligence,
                                    mission data, and recovered
                                    information from active units.
                                </p>

                                <div className="divider" />

                                <span className="status status-online">
                                    Available
                                </span>
                            </article>

                            <article className="card">
                                <div className="card-meta">
                                    SYSTEM // 02
                                </div>

                                <h3 className="card-title">
                                    Archive
                                </h3>

                                <p className="text-muted">
                                    Search historical records and
                                    review fragments recovered from
                                    abandoned facilities.
                                </p>

                                <div className="divider" />

                                <span className="status status-warning">
                                    Restricted
                                </span>
                            </article>

                            <article className="card">
                                <div className="card-meta">
                                    SYSTEM // 03
                                </div>

                                <h3 className="card-title">
                                    Network
                                </h3>

                                <p className="text-muted">
                                    Monitor active units and inspect
                                    the current state of the global
                                    machine network.
                                </p>

                                <div className="divider" />

                                <span className="status status-online">
                                    Connected
                                </span>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            {/* ARCHIVE */}
            <section id="archive" className="section">
                <div className="container">
                    <div className="system-line">
                        RECENT ARCHIVE ENTRIES
                    </div>

                    <div
                        className="nier-frame"
                        style={{ marginTop: '3rem' }}
                    >
                        <table>
                            <thead>
                                <tr>
                                    <th>Entry</th>
                                    <th>Classification</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Operation 001</td>
                                    <td>Combat</td>
                                    <td>
                                        <span className="status status-online">
                                            Verified
                                        </span>
                                    </td>
                                    <td>02.14.11</td>
                                </tr>

                                <tr>
                                    <td>Operation 002</td>
                                    <td>Reconnaissance</td>
                                    <td>
                                        <span className="status status-online">
                                            Verified
                                        </span>
                                    </td>
                                    <td>03.08.11</td>
                                </tr>

                                <tr>
                                    <td>Operation 003</td>
                                    <td>Unknown</td>
                                    <td>
                                        <span className="status status-warning">
                                            Restricted
                                        </span>
                                    </td>
                                    <td>04.22.11</td>
                                </tr>

                                <tr>
                                    <td>Operation 004</td>
                                    <td>Archive</td>
                                    <td>
                                        <span className="status status-error">
                                            Corrupted
                                        </span>
                                    </td>
                                    <td>05.19.11</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section
                id="contact"
                className="section"
                style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="container text-center">
                    <div className="system-text">
                        AWAITING USER INPUT
                    </div>

                    <h2 style={{ marginTop: '1rem' }}>
                        Begin the sequence.
                    </h2>

                    <p
                        className="text-muted"
                        style={{
                            maxWidth: 520,
                            margin: '0 auto',
                        }}
                    >
                        The system is ready.
                        <br />
                        Your next action will determine
                        what happens next.
                    </p>

                    <div className="mt-4">
                        <Link href={`/advancement`}>
                                  <button className="btn btn-primary">
                            Connect
                        </button>
                        </Link>
              
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer
                style={{
                    borderTop: '1px solid var(--border)',
                    padding: '2rem 0',
                }}
            >
                <div
                    className="container"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span className="card-meta">
                        YORHA // SYSTEM
                    </span>

                    <span className="card-meta">
                        SYSTEM VERSION 2.7.4
                    </span>

                    <span className="card-meta">
                        © 11945
                    </span>
                </div>
            </footer>
        </main>
    );
}
