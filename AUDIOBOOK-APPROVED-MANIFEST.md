# Audiobook — Approved Version Manifest (for review)

_Generated 2026-07-20 17:42 · read-only snapshot · authoritative record of the version approved in the prior session._

Production audio is **git-ignored by repo policy** (`.gitignore: audiobook/` — "use a separate object store") and the combined book (310 MB) exceeds GitHub's 100 MB/file limit. This manifest is the reviewable stand-in: it pins each approved file by SHA-256 so the exact audio can be verified without committing the binaries.

## A. Approved combined deliverable
- **File:** `audiobook/Psilocybin Integration Guide - Maya Allan (audiobook).mp3`
- **Duration:** 5:37:57  ·  **Size:** 324,438,159 B (309.4 MB)  ·  **Format:** mp3 44100Hz 1ch 128k
- **Tags:** Psilocybin Integration Guide,Maya Allan  ·  **Chapter markers:** 18
- **Built:** 2026-07-16 08:41 from `final/` originals (durations match; no repaired-candidate audio)
- **SHA-256:** `f381a1ff9c7a818c1ec61540189694768bcf30f16447263dc797868992948222`

## B. Approved chapter set — `audiobook/final/` (16 files)

| # | File | Duration | Size (B) | Codec | SHA-256 |
|---|---|--:|--:|---|---|
| 01 | `01-introduction.mp3` | 1:15.51 | 1,209,199 | mp3 128k/44100/1ch | `847c238e00464b55348f8636bd248386ef56efda336c73c425c4b13156c02df1` |
| 02 | `02-chapter-1-understanding-psilocybin.mp3` | 4:39.94 | 4,480,148 | mp3 128k/44100/1ch | `98a551f2b5b88479bc3f54d0ec4c82920a0bbb388bda5adc86ba8b2cb758205b` |
| 03 | `03-chapter-2-preparing-for-the-journey.mp3` | 5:41.66 | 5,467,786 | mp3 128k/44100/1ch | `dcfa2717211332134d1b9508b8f4aba8af465a180450c0badc17dee722fdd14c` |
| 04 | `04-chapter-3-dosage-and-administration.mp3` | 4:28.14 | 4,291,231 | mp3 128k/44100/1ch | `fa5137581e25857c1d880bac26257f56b9b2932b44bd40de4dcebf9db2605086` |
| 05 | `05-chapter-4-the-journey-unfolds.mp3` | 4:24.99 | 4,240,657 | mp3 128k/44100/1ch | `1c2034a86497e7997bbe616ec1423eb32299f7766739818d884c722a8b3a043b` |
| 06 | `06-chapter-5-journeys-with-a-guide-or-friend.mp3` | 88:37.60 | 85,082,738 | mp3 128k/44100/1ch | `6a84d46b9c6711f1d75ccb69f43c459cb7b7d06e0183b250d706af4c6cb06ff0` |
| 07 | `07-chapter-6-solo-journeys.mp3` | 67:05.39 | 64,407,134 | mp3 128k/44100/1ch | `b981608539bf9964f251aa4def06e404b7d36989c1ae84b70eb730127433715a` |
| 08 | `08-chapter-7-group-journeys.mp3` | 104:24.22 | 100,228,742 | mp3 128k/44100/1ch | `22de24927be059f6371b93a382cb52f38c783f31a9e45c3e38aefc4f35b76fc9` |
| 09 | `09-chapter-8-healing-the-inner-child.mp3` | 15:40.22 | 15,044,484 | mp3 128k/44100/1ch | `573e8795383f237d9f4b9687e1ec8010855432213b440ec0c8cbed49e187fbd9` |
| 10 | `10-chapter-9-integration.mp3` | 4:04.97 | 3,920,501 | mp3 128k/44100/1ch | `558792c8f337363c25141542dcfdba141fc7dd2285c0205424eb6d65c54ac4bd` |
| 11 | `11-chapter-10-ethical-considerations.mp3` | 4:03.53 | 3,897,513 | mp3 128k/44100/1ch | `9f1b1c215c5c6e6695c30e65c26969ece20fc9789768b483d11c752832b1a0b8` |
| 12 | `12-chapter-11-aftercare-and-reflection.mp3` | 10:36.18 | 10,179,857 | mp3 128k/44100/1ch | `f589390af82f6571c2787c7f7bbc48285906565bd8863fdd71486965d894c59a` |
| 13 | `13-appendix-a-glossary-of-terms.mp3` | 2:11.70 | 2,108,230 | mp3 128k/44100/1ch | `e4378e985a858ecb950c4cbad6544c7d40d88c14384347f392ddfe2c5dec5e26` |
| 14 | `14-appendix-b-legal-considerations.mp3` | 7:02.70 | 6,764,295 | mp3 128k/44100/1ch | `799e36f0892885a814e157f3621ebdee57d068927af1f0540bc030917aeab6b0` |
| 15 | `15-appendix-c-resources.mp3` | 2:10.50 | 2,089,004 | mp3 128k/44100/1ch | `aab8b088cad8e887c347753b491a35e4a9744d070789e43636313bbdf0821a51` |
| 16 | `16-appendix-d-integration-worksheets.mp3` | 10:33.35 | 10,134,718 | mp3 128k/44100/1ch | `d30ef52606f05205b67f81d06c89087acc7ef7f45b6c9a9dd1e5ff52df820e56` |

**Total `final/`:** 323,546,237 B (309 MB). Every file above is byte-identical (same SHA-256) to `audiobook/archive/final-original-render/` — the read-only backup.

## C. Approval status (from the prior session)
- **Chapters 2–16:** complete, unchanged.
- **Chapters 6 & 7:** their earlier "defects" were proven to be **ElevenLabs Scribe transcription artifacts, not audio** (loop-autocorrelation ~0.02–0.04; durations match manuscript; 99.5% residual match). Left **unchanged / approved clean**.
- **Chapter 1:** contains **one real 2-word breakdown** — the manuscript phrase **"to ensure"** garbled at **02:45** (audio 165.04–172.89 s). **Unresolved** (options: targeted A2 re-render / cross-render splice / accept as-is).
- **Provenance:** built from `final/` only. **No** repaired-candidate audio, **no** re-rendered/generated narration, **no** ElevenLabs calls in the assembly.

## D. Explicitly NOT the approved version (excluded)
- `audiobook/repaired-candidates/` — rejected re-renders (deleted 2026-07-20).
- `audiobook/_emma-backup/` — superseded "emma" voice (24 kHz).
- `audiobook/02-chapter-1-*.mp3` + `.v1.mp3` — May alternate Ch 1 takes (kept locally only for a possible Ch 1 fix).
- `audiobook/mockups/` (in repo root `mayaallan/mockups/`) — voice-audition samples.

## E. Voice settings of the approved render (frozen "A2")
- Voice clone **Maya Allan**, model `eleven_multilingual_v2`, stability 0.33, similarity_boost 0.75, style 0.60, speaker_boost on, speed 0.90.
