import React from 'react';

function About() {
  return (
    <div className="about-page">
      <header>
        <h1>About Swara Detector</h1>
        <p className="subtitle">Bridging ancient musical tradition with modern technology</p>
      </header>

      <div className="media-section">
        <div className="media-video">
          <iframe
            src="https://www.youtube.com/embed/MIfXMSjuZU0"
            title="Swara Detector Hackathon Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="media-photos">
          <img src="/sbuhacks.JPG" alt="Team at SBU Hacks" />
        </div>
      </div>

      <div className="about-grid">
        <section className="about-card">
          <h2 className="section-title">Inspiration</h2>
          <p>
            For the inexperienced learner, understanding the difference between different notes is very
            difficult. By creating software that can help identify different notes, we give learners who
            may not have access to professional vocal or instrumental training the opportunity to develop
            a trained ear and the skills they need to succeed in music.
          </p>
          <p style={{ marginTop: '12px' }}>
            By bridging the gap between ancient musical tradition and modern technology, we're making
            the beautiful complexity of Indian classical music accessible to everyone, regardless of
            their background, location, or resources.
          </p>
        </section>

        <section className="about-card">
          <h2 className="section-title">What It Does</h2>
          <p>
            Swara Detector identifies the frequency and pitch of sounds and labels them according to
            the sargam system (Sa Re Ga Ma Pa Dha Ni) based on their proportions. Since Indian music
            uses only one key (which in theory could be any note), and all swaras are calculated as
            mathematical ratios from the performer's chosen base Sa.
          </p>
          <ul className="about-list">
            <li>Identify precise swaras as you sing or play an instrument</li>
            <li>Understand pitch relationships between different notes</li>
            <li>Develop auditory skills through immediate, objective feedback</li>
            <li>Practice effectively without constant supervision</li>
          </ul>
        </section>

        <section className="about-card">
          <h2 className="section-title">Who It's For</h2>
          <ul className="about-list">
            <li>Self-taught musicians seeking structured feedback</li>
            <li>Students in remote areas with limited access to gurus</li>
            <li>Educational institutions supplementing traditional teaching</li>
            <li>Music enthusiasts exploring Indian classical music for the first time</li>
          </ul>
        </section>

        <section className="about-card">
          <h2 className="section-title">How We Built It</h2>
          <p>
            Swara Detector is a client-side React application that processes audio entirely in the
            browser. No audio data ever leaves your device. We built the entire signal processing
            pipeline from scratch using the Web Audio API, implementing FFT-based pitch detection
            and handling the complexities of vocal harmonics without relying on external libraries.
          </p>
          <div className="tech-stack">
            {['React', 'Web Audio API', 'JavaScript ES6+', 'CSS3', 'Vite', 'Vercel'].map(tech => (
              <span key={tech} className="tech-badge">{tech}</span>
            ))}
          </div>
        </section>

        <section className="about-card">
          <h2 className="section-title">The Challenge</h2>
          <p>
            A fundamental challenge was that Indian classical music uses <strong>relative pitch</strong> rather
            than the fixed frequencies of Western music. Western notes have standardized frequencies;
            Indian swaras are entirely relative to the performer's base Sa.
          </p>
          <p style={{ marginTop: '12px' }}>
            This required a unique system where users input their base frequency and all other swaras
            are calculated as precise mathematical ratios from that foundation. Through testing, we
            found that the human voice requires a ±5% tolerance for practical swara recognition.
          </p>
        </section>

        <section className="about-card">
          <h2 className="section-title">What's Next</h2>
          <ul className="about-list">
            <li>
              <strong>Raga Intelligence:</strong> Markov chain-based raga recognition that identifies
              which raga you're practicing in real time and flags rule violations
            </li>
            <li>
              <strong>Integrated Tanpura & Tabla:</strong> Digital drone and rhythm accompaniment
              with customizable Sa-Pa / Sa-Ma combinations and tempo control
            </li>
          </ul>
        </section>
      </div>

      <div className="hackathon-badge">
        Built at a Hackathon - merging centuries of musical tradition with modern web technology.{' '}
        <a href="https://devpost.com/software/swara-detector" target="_blank" rel="noopener noreferrer" className="devpost-link">View on Devpost</a>
      </div>
    </div>
  );
}

export default About;
