import React from 'react';

const members = [
  { name: 'Sumit Kumar', url: 'https://www.linkedin.com/in/sumit-kumar91/', photo: '/sumit.jpg' },
  { name: 'Shelly Lazbin', url: 'https://www.linkedin.com/in/shelly-lazbin/', photo: '/shelly.jpg' },
  { name: 'Nandini Goswami', url: 'https://www.linkedin.com/in/nandini-goswami-ng/', photo: '/nandini.jpg' },
  { name: 'Akshatha', url: 'https://www.linkedin.com/in/akshatha564/', photo: '/akshatha.jpg' },
];

function Team() {
  return (
    <div className="team-page">
      <header>
        <h1>The Team</h1>
        <p className="subtitle">The people behind Swara Detector</p>
      </header>

      <div className="team-grid">
        {members.map(({ name, url, photo }) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="team-card">
            <img src={photo} alt={name} className="team-photo" />
            <div className="team-name">{name}</div>
            <div className="team-linkedin">View LinkedIn</div>
          </a>
        ))}
      </div>

      <div className="club-section">
        <h2 className="section-title">Indian Classical Music Club at Stony Brook</h2>
        <p>
          This project felt especially close to our hearts because our team had also started the
          Indian Classical Music Club at Stony Brook, where we aim to keep the spirit of Indian
          classical music alive while exploring new creative directions.
        </p>
        <p>
          The club is all about preserving and sharing the beauty of Indian classical traditions
          while encouraging creative interpretations and collaborations. Projects like Swara Detector
          show how timeless art forms can be reimagined through modern technology.
        </p>
        <div className="club-links">
          <a href="https://sbuicm.github.io" target="_blank" rel="noopener noreferrer" className="club-link">Website</a>
          <a href="https://linktr.ee/sbu.icm" target="_blank" rel="noopener noreferrer" className="club-link">Linktree</a>
          <a href="https://instagram.com/sbu.icm" target="_blank" rel="noopener noreferrer" className="club-link">Instagram</a>
        </div>
      </div>
    </div>
  );
}

export default Team;
