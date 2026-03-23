# Swara Detector

**Real-time Indian classical music pitch detection in the browser.**

**[View on Devpost](https://devpost.com/software/swara-detector)**

## Inspiration

For the inexperienced learner, understanding the difference between different notes is very difficult. By creating software that can help identify different notes, we give learners who may not have access to professional vocal or instrumental training the opportunity to develop the skills they need to succeed in music.

By bridging the gap between ancient musical tradition and modern technology, we're making the beautiful complexity of Indian classical music accessible to everyone, regardless of their background, location, or resources. Our mission is to preserve the mathematical precision of this ancient art form while empowering the next generation of musicians with tools for success.

## What it does

Swara Detector identifies the frequency/pitch of sounds and labels them according to the sargam system (Sa Re Ga Ma Pa Dha Ni Sa) based on their proportions — since Indian music uses only one relative key, which in theory could be any note.

It helps learners:

- Identify precise swaras as they sing or play instruments
- Understand pitch relationships between different notes
- Develop auditory skills through immediate, objective feedback
- Practice effectively without constant supervision

This tool is particularly valuable for:

- Self-taught musicians seeking structured feedback
- Students in remote areas with limited access to gurus
- Educational institutions looking to supplement traditional teaching
- Music enthusiasts exploring Indian classical music for the first time

## Tech Stack

- **React** — Frontend framework
- **Web Audio API** — Real-time audio processing
- **CSS3** — Styling and responsive design
- **JavaScript (ES6+)** — Application logic
- **Vercel** — Deployment

## Architecture

Swara Detector is a fully client-side React application. All audio is processed entirely in the browser — no audio data ever leaves your device, ensuring low latency and complete privacy.

The pitch detection engine is built from scratch using the Web Audio API with FFT-based analysis. All swaras are calculated as mathematical ratios from a user-defined base Sa frequency, faithfully reflecting how Indian classical music works in practice.

## Challenges

A fundamental challenge was that Indian classical music uses **relative pitch** rather than the fixed frequencies of Western music. Western notes have standardized frequencies; Indian swaras are entirely relative to the performer's base Sa.

This required designing a system where users input their own base frequency, and all other swaras are computed as mathematical ratios from that foundation. We refined our detection algorithms by leveraging the pitch perception skills of the musicians on our team and validated our ratio-based approach through extensive testing — settling on a ±5% tolerance for practical swara recognition.

## What We're Proud Of

- Built a real-time pitch detection engine from scratch with millisecond latency
- Faithfully implemented the ancient swara ratio system in modern JavaScript
- Achieved smooth 60fps Canvas visualization while processing live audio
- Zero external signal processing libraries — the entire pipeline is custom-built
- Merged centuries-old music theory with modern web technology in a way that actually works

## What We Learned

- Mastered the Web Audio API from basic audio contexts to complex real-time signal processing pipelines
- Discovered why Indian classical music requires precise mathematical ratios rather than equal temperament
- Optimized React state updates to avoid blocking the main thread during audio processing
- Bridged music theory and code by translating abstract musical concepts into concrete algorithms

## What's Next

**Raga Intelligence** — A Markov chain-based model that analyzes note sequences to identify which raga you're practicing in real-time, with feedback on raga-specific rules and phrasing.

**Integrated Practice Environment** — A digital Tanpura and Tabla for natural pitch reference and rhythmic accompaniment, with customizable drone settings and real-time rhythm synchronization.

## Contributors

- [Sumit Kumar](https://www.linkedin.com/in/sumit-kumar91)
- [Shelly Lazbin](https://www.linkedin.com/in/shelly-lazbin)
- [Nandini Goswami](https://www.linkedin.com/in/nandini-goswami-ng)
- [Akshatha](https://www.linkedin.com/in/akshatha564)
